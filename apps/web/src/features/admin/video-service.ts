import {
  LessonType,
  MediaSourceType,
  Prisma,
  VideoAssetStatus,
  VideoProviderType,
  prisma,
} from "@academy/db";
import { revalidatePath } from "next/cache";
import type { VideoAssetStatus as DomainVideoAssetStatus } from "@academy/video-domain";

import { getVideoProvider } from "@/lib/video/provider";

type EmbedSourceType = "RUTUBE_EMBED" | "EXTERNAL_EMBED";

function normalizeRutubeEmbedUrl(url: string) {
  const value = url.trim();

  const embedMatch = value.match(
    /^https?:\/\/rutube\.ru\/play\/embed\/([a-zA-Z0-9-_/]+)\/?$/i,
  );

  if (embedMatch) {
    return value;
  }

  const videoMatch = value.match(
    /^https?:\/\/rutube\.ru\/video\/([a-zA-Z0-9-]+)\/?$/i,
  );

  if (videoMatch) {
    return `https://rutube.ru/play/embed/${videoMatch[1]}`;
  }

  throw new Error("Укажи корректную ссылку на видео RUTUBE.");
}

function normalizeEmbedUrl(sourceType: EmbedSourceType, videoUrl: string) {
  if (sourceType === "RUTUBE_EMBED") {
    return normalizeRutubeEmbedUrl(videoUrl);
  }

  return videoUrl.trim();
}

function mapProviderNameToDb(providerName: "mock" | "cloudflare_stream") {
  return providerName === "cloudflare_stream"
    ? VideoProviderType.CLOUDFLARE_STREAM
    : VideoProviderType.MOCK;
}

function mapStatusToDb(status: DomainVideoAssetStatus) {
  switch (status) {
    case "draft":
      return VideoAssetStatus.DRAFT;
    case "pending_upload":
      return VideoAssetStatus.PENDING_UPLOAD;
    case "importing":
      return VideoAssetStatus.IMPORTING;
    case "processing":
      return VideoAssetStatus.PROCESSING;
    case "ready":
      return VideoAssetStatus.READY;
    case "error":
      return VideoAssetStatus.ERROR;
  }
}

function getManagedPlayerUrl(
  provider: VideoProviderType,
  playbackId?: string | null,
  playerUrl?: string | null,
) {
  if (playerUrl) {
    return playerUrl;
  }

  if (
    provider === VideoProviderType.CLOUDFLARE_STREAM &&
    playbackId &&
    process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE
  ) {
    return `https://customer-${process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE}.cloudflarestream.com/${playbackId}/iframe`;
  }

  if (provider === VideoProviderType.CLOUDFLARE_STREAM && playbackId) {
    return `https://iframe.videodelivery.net/${playbackId}`;
  }

  return null;
}

async function getLessonContext(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    include: {
      module: {
        select: {
          courseId: true,
        },
      },
      videoAsset: true,
    },
  });

  if (!lesson) {
    throw new Error("Урок не найден.");
  }

  return lesson;
}

function refreshVideoPaths(courseId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/learning");
  revalidatePath(`/learning/courses/${courseId}`);
}

export async function prepareManagedVideoUpload(input: {
  lessonId: string;
  filename: string;
  mimeType: string;
  sizeInBytes: number;
  ownerId: string;
}) {
  const lesson = await getLessonContext(input.lessonId);
  const provider = getVideoProvider();
  const session = await provider.createUploadSession({
    lessonId: input.lessonId,
    filename: input.filename,
    mimeType: input.mimeType,
    sizeInBytes: input.sizeInBytes,
    ownerId: input.ownerId,
  });

  const asset = await prisma.videoAsset.upsert({
    where: {
      lessonId: lesson.id,
    },
    update: {
      provider: mapProviderNameToDb(provider.name),
      sourceType: MediaSourceType.MANAGED_UPLOAD,
      status: VideoAssetStatus.PENDING_UPLOAD,
      originalFilename: input.filename,
      mimeType: input.mimeType,
      sizeInBytes: input.sizeInBytes,
      externalAssetId: session.externalAssetId,
      uploadUrl: session.uploadUrl,
      sourceUrl: null,
      playerUrl: null,
      playbackId: null,
      errorMessage: null,
      metadata: {
        expiresAt: session.expiresAt.toISOString(),
      } satisfies Prisma.JsonObject,
    },
    create: {
      lessonId: lesson.id,
      provider: mapProviderNameToDb(provider.name),
      sourceType: MediaSourceType.MANAGED_UPLOAD,
      status: VideoAssetStatus.PENDING_UPLOAD,
      originalFilename: input.filename,
      mimeType: input.mimeType,
      sizeInBytes: input.sizeInBytes,
      externalAssetId: session.externalAssetId,
      uploadUrl: session.uploadUrl,
      metadata: {
        expiresAt: session.expiresAt.toISOString(),
      } satisfies Prisma.JsonObject,
    },
    select: {
      id: true,
    },
  });

  await prisma.lesson.update({
    where: {
      id: lesson.id,
    },
    data: {
      type: LessonType.VIDEO,
      videoSourceType: MediaSourceType.MANAGED_UPLOAD,
      videoUrl: null,
      videoPlaybackId: null,
    },
  });

  refreshVideoPaths(lesson.module.courseId);

  return {
    assetId: asset.id,
    uploadUrl: session.uploadUrl,
    expiresAt: session.expiresAt.toISOString(),
  };
}

export async function finalizeManagedVideoUpload(input: {
  assetId: string;
  ownerId: string;
}) {
  const asset = await prisma.videoAsset.findUnique({
    where: {
      id: input.assetId,
    },
    include: {
      lesson: {
        include: {
          module: {
            select: {
              courseId: true,
            },
          },
        },
      },
    },
  });

  if (!asset || !asset.lesson || !asset.externalAssetId) {
    throw new Error("Видео-ассет не найден.");
  }

  const provider = getVideoProvider();
  const snapshot = await provider.finalizeUpload({
    externalAssetId: asset.externalAssetId,
    lessonId: asset.lessonId,
    ownerId: input.ownerId,
  });
  const playerUrl = getManagedPlayerUrl(
    asset.provider,
    snapshot.playbackId,
    snapshot.playerUrl,
  );

  await prisma.$transaction([
    prisma.videoAsset.update({
      where: {
        id: asset.id,
      },
      data: {
        status: mapStatusToDb(snapshot.status),
        playbackId: snapshot.playbackId ?? null,
        playerUrl,
        uploadUrl: null,
        errorMessage: snapshot.errorMessage ?? null,
      },
    }),
    prisma.lesson.update({
      where: {
        id: asset.lessonId,
      },
      data: {
        type: LessonType.VIDEO,
        videoSourceType: MediaSourceType.MANAGED_UPLOAD,
        videoPlaybackId: snapshot.playbackId ?? null,
        videoUrl: playerUrl,
      },
    }),
  ]);

  refreshVideoPaths(asset.lesson.module.courseId);

  return {
    status: snapshot.status,
    playbackId: snapshot.playbackId ?? null,
    playerUrl,
  };
}

export async function importLessonVideoFromUrl(input: {
  lessonId: string;
  sourceUrl: string;
  ownerId: string;
}) {
  const lesson = await getLessonContext(input.lessonId);
  const provider = getVideoProvider();
  const result = await provider.importFromUrl({
    lessonId: lesson.id,
    sourceUrl: input.sourceUrl.trim(),
    ownerId: input.ownerId,
  });
  const playerUrl = getManagedPlayerUrl(
    mapProviderNameToDb(provider.name),
    result.playbackId ?? null,
    result.playerUrl ?? null,
  );

  await prisma.$transaction([
    prisma.videoAsset.upsert({
      where: {
        lessonId: lesson.id,
      },
      update: {
        provider: mapProviderNameToDb(provider.name),
        sourceType: MediaSourceType.CLOUD_IMPORT,
        status: mapStatusToDb(result.status),
        sourceUrl: result.sourceUrl,
        externalAssetId: result.externalAssetId,
        playbackId: result.playbackId ?? null,
        playerUrl,
        uploadUrl: null,
        errorMessage: null,
      },
      create: {
        lessonId: lesson.id,
        provider: mapProviderNameToDb(provider.name),
        sourceType: MediaSourceType.CLOUD_IMPORT,
        status: mapStatusToDb(result.status),
        sourceUrl: result.sourceUrl,
        externalAssetId: result.externalAssetId,
        playbackId: result.playbackId ?? null,
        playerUrl,
      },
    }),
    prisma.lesson.update({
      where: {
        id: lesson.id,
      },
      data: {
        type: LessonType.VIDEO,
        videoSourceType: MediaSourceType.CLOUD_IMPORT,
        videoPlaybackId: result.playbackId ?? null,
        videoUrl: playerUrl,
      },
    }),
  ]);

  refreshVideoPaths(lesson.module.courseId);

  return {
    status: result.status,
    playbackId: result.playbackId ?? null,
    playerUrl,
  };
}

export async function attachLessonEmbedVideo(input: {
  lessonId: string;
  sourceType: EmbedSourceType;
  videoUrl: string;
}) {
  const lesson = await getLessonContext(input.lessonId);
  const normalizedUrl = normalizeEmbedUrl(input.sourceType, input.videoUrl);
  const mappedSourceType =
    input.sourceType === "RUTUBE_EMBED"
      ? MediaSourceType.RUTUBE_EMBED
      : MediaSourceType.EXTERNAL_EMBED;

  await prisma.$transaction([
    prisma.videoAsset.upsert({
      where: {
        lessonId: lesson.id,
      },
      update: {
        provider: VideoProviderType.MOCK,
        sourceType: mappedSourceType,
        status: VideoAssetStatus.READY,
        sourceUrl: normalizedUrl,
        playerUrl: normalizedUrl,
        externalAssetId: null,
        playbackId: null,
        uploadUrl: null,
        errorMessage: null,
      },
      create: {
        lessonId: lesson.id,
        provider: VideoProviderType.MOCK,
        sourceType: mappedSourceType,
        status: VideoAssetStatus.READY,
        sourceUrl: normalizedUrl,
        playerUrl: normalizedUrl,
      },
    }),
    prisma.lesson.update({
      where: {
        id: lesson.id,
      },
      data: {
        type: LessonType.VIDEO,
        videoSourceType: mappedSourceType,
        videoUrl: normalizedUrl,
        videoPlaybackId: null,
      },
    }),
  ]);

  refreshVideoPaths(lesson.module.courseId);

  return {
    sourceType: mappedSourceType,
    playerUrl: normalizedUrl,
  };
}

export async function clearLessonVideo(input: { lessonId: string }) {
  const lesson = await getLessonContext(input.lessonId);

  await prisma.$transaction([
    prisma.videoAsset.deleteMany({
      where: {
        lessonId: lesson.id,
      },
    }),
    prisma.lesson.update({
      where: {
        id: lesson.id,
      },
      data: {
        videoSourceType: null,
        videoUrl: null,
        videoPlaybackId: null,
      },
    }),
  ]);

  refreshVideoPaths(lesson.module.courseId);
}

export async function refreshLessonVideoAsset(input: { assetId: string }) {
  const asset = await prisma.videoAsset.findUnique({
    where: {
      id: input.assetId,
    },
    include: {
      lesson: {
        include: {
          module: {
            select: {
              courseId: true,
            },
          },
        },
      },
    },
  });

  if (!asset || !asset.lesson) {
    throw new Error("Видео-ассет не найден.");
  }

  if (!asset.externalAssetId) {
    refreshVideoPaths(asset.lesson.module.courseId);

    return {
      status: asset.status,
      playbackId: asset.playbackId,
      playerUrl: asset.playerUrl,
    };
  }

  const provider = getVideoProvider();
  const snapshot = await provider.getAsset(asset.externalAssetId);
  const playerUrl = getManagedPlayerUrl(
    asset.provider,
    snapshot.playbackId,
    snapshot.playerUrl,
  );

  await prisma.$transaction([
    prisma.videoAsset.update({
      where: {
        id: asset.id,
      },
      data: {
        status: mapStatusToDb(snapshot.status),
        playbackId: snapshot.playbackId ?? null,
        playerUrl,
        errorMessage: snapshot.errorMessage ?? null,
      },
    }),
    prisma.lesson.update({
      where: {
        id: asset.lessonId,
      },
      data: {
        videoPlaybackId: snapshot.playbackId ?? null,
        videoUrl: playerUrl,
      },
    }),
  ]);

  refreshVideoPaths(asset.lesson.module.courseId);

  return {
    status: snapshot.status,
    playbackId: snapshot.playbackId ?? null,
    playerUrl,
  };
}
