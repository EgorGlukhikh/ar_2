import { auth } from "@academy/auth";
import { prisma } from "@academy/db";
import { USER_ROLES, type UserRole } from "@academy/shared";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  attachLessonEmbedVideo,
  clearLessonVideo,
  finalizeManagedVideoUpload,
  importLessonVideoFromUrl,
  prepareManagedVideoUpload,
  refreshLessonVideoAsset,
} from "@/features/admin/video-service";
import { canEditCourseContent } from "@/lib/admin";

function isWorkspaceRole(value: string | undefined | null): value is UserRole {
  return Object.values(USER_ROLES).includes(value as (typeof USER_ROLES)[keyof typeof USER_ROLES]);
}

async function canEditLessonVideoByLessonId(
  actor: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
  },
  lessonId: string,
) {
  if (!actor.id || !isWorkspaceRole(actor.role)) {
    return false;
  }

  const role = actor.role;

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      module: {
        select: {
          course: {
            select: {
              authorId: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return false;
  }

  return canEditCourseContent(
    {
      id: actor.id,
      email: actor.email,
      name: actor.name,
      role,
    },
    lesson.module.course.authorId,
  );
}

async function canEditLessonVideoByAssetId(
  actor: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
  },
  assetId: string,
) {
  if (!actor.id || !isWorkspaceRole(actor.role)) {
    return false;
  }

  const role = actor.role;

  const asset = await prisma.videoAsset.findUnique({
    where: {
      id: assetId,
    },
    select: {
      lesson: {
        select: {
          module: {
            select: {
              course: {
                select: {
                  authorId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!asset) {
    return false;
  }

  return canEditCourseContent(
    {
      id: actor.id,
      email: actor.email,
      name: actor.name,
      role,
    },
    asset.lesson.module.course.authorId,
  );
}

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("createUploadSession"),
    lessonId: z.string().trim().min(1),
    filename: z.string().trim().min(1),
    mimeType: z.string().trim().min(1),
    sizeInBytes: z.number().int().positive(),
  }),
  z.object({
    action: z.literal("finalizeUpload"),
    assetId: z.string().trim().min(1),
  }),
  z.object({
    action: z.literal("importFromUrl"),
    lessonId: z.string().trim().min(1),
    sourceUrl: z.string().trim().url(),
  }),
  z.object({
    action: z.literal("attachEmbed"),
    lessonId: z.string().trim().min(1),
    sourceType: z.enum(["RUTUBE_EMBED", "EXTERNAL_EMBED"]),
    videoUrl: z.string().trim().url(),
  }),
  z.object({
    action: z.literal("clearVideo"),
    lessonId: z.string().trim().min(1),
  }),
  z.object({
    action: z.literal("refreshAsset"),
    assetId: z.string().trim().min(1),
  }),
]);

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = requestSchema.parse(await request.json());
    const allowed =
      "lessonId" in payload
        ? await canEditLessonVideoByLessonId(session.user, payload.lessonId)
        : await canEditLessonVideoByAssetId(session.user, payload.assetId);

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    switch (payload.action) {
      case "createUploadSession": {
        const result = await prepareManagedVideoUpload({
          lessonId: payload.lessonId,
          filename: payload.filename,
          mimeType: payload.mimeType,
          sizeInBytes: payload.sizeInBytes,
          ownerId: session.user.id,
        });

        return NextResponse.json({ ok: true, result });
      }
      case "finalizeUpload": {
        const result = await finalizeManagedVideoUpload({
          assetId: payload.assetId,
          ownerId: session.user.id,
        });

        return NextResponse.json({ ok: true, result });
      }
      case "importFromUrl": {
        const result = await importLessonVideoFromUrl({
          lessonId: payload.lessonId,
          sourceUrl: payload.sourceUrl,
          ownerId: session.user.id,
        });

        return NextResponse.json({ ok: true, result });
      }
      case "attachEmbed": {
        const result = await attachLessonEmbedVideo({
          lessonId: payload.lessonId,
          sourceType: payload.sourceType,
          videoUrl: payload.videoUrl,
        });

        return NextResponse.json({ ok: true, result });
      }
      case "clearVideo": {
        await clearLessonVideo({
          lessonId: payload.lessonId,
        });

        return NextResponse.json({ ok: true });
      }
      case "refreshAsset": {
        const result = await refreshLessonVideoAsset({
          assetId: payload.assetId,
        });

        return NextResponse.json({ ok: true, result });
      }
    }
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid request."
        : error instanceof Error
          ? error.message
          : "Unexpected error.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
