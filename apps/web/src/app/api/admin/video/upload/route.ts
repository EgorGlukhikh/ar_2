import { auth } from "@academy/auth";
import { prisma } from "@academy/db";
import { USER_ROLES, type UserRole } from "@academy/shared";
import { NextResponse } from "next/server";

import { canEditCourseContent } from "@/lib/admin";
import { isAllowedVideoFile } from "@/lib/media-upload";

const MAX_VIDEO_SIZE_BYTES = 512 * 1024 * 1024;

function isWorkspaceRole(value: string | undefined | null): value is UserRole {
  return Object.values(USER_ROLES).includes(value as (typeof USER_ROLES)[keyof typeof USER_ROLES]);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !isWorkspaceRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;

  const formData = await request.formData();
  const assetId = String(formData.get("assetId") ?? "").trim();
  const file = formData.get("file");

  if (!assetId || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing asset or file." }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Empty files are not supported." }, { status: 400 });
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Video file is too large. Limit is 512 MB." },
      { status: 400 },
    );
  }

  if (!isAllowedVideoFile(file)) {
    return NextResponse.json(
      { error: "Unsupported video format. Allowed: MP4, M4V, MOV, WEBM, OGG." },
      { status: 400 },
    );
  }

  const asset = await prisma.videoAsset.findUnique({
    where: {
      id: assetId,
    },
    select: {
      id: true,
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
    return NextResponse.json({ error: "Video asset not found." }, { status: 404 });
  }

  const allowed = canEditCourseContent(
    {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role,
    },
    asset.lesson.module.course.authorId,
  );

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  await prisma.videoAsset.update({
    where: {
      id: assetId,
    },
    data: {
      originalFilename: file.name,
      mimeType: file.type || "video/mp4",
      sizeInBytes: file.size,
      fileData: bytes,
      sourceUrl: `/api/lesson-video/${assetId}`,
      playerUrl: `/api/lesson-video/${assetId}`,
      errorMessage: null,
    },
  });

  return NextResponse.json({
    ok: true,
    file: {
      assetId,
      filename: file.name,
      sizeInBytes: file.size,
      url: `/api/lesson-video/${assetId}`,
    },
  });
}
