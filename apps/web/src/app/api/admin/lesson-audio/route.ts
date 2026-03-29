import { auth } from "@academy/auth";
import { prisma } from "@academy/db";
import { USER_ROLES, type UserRole } from "@academy/shared";
import { NextResponse } from "next/server";

import { canEditCourseContent } from "@/lib/admin";
import { isAllowedAudioFile } from "@/lib/media-upload";

const MAX_AUDIO_SIZE_BYTES = 20 * 1024 * 1024;

function isUserRole(value: string | undefined | null): value is UserRole {
  return Boolean(value && Object.values(USER_ROLES).includes(value as UserRole));
}

function buildAudioUrl(fileId: string) {
  return `/api/lesson-audio/${fileId}`;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !isUserRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const lessonId = String(formData.get("lessonId") ?? "").trim();
  const blockKey = String(formData.get("blockKey") ?? "").trim();
  const file = formData.get("file");

  if (!lessonId || !blockKey || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing lesson, block or file." }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Empty files are not supported." }, { status: 400 });
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Audio file is too large. Limit is 20 MB." },
      { status: 400 },
    );
  }

  if (!isAllowedAudioFile(file)) {
    return NextResponse.json(
      { error: "Unsupported audio format. Allowed: MP3, M4A, AAC, WAV, OGG, WEBM." },
      { status: 400 },
    );
  }

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
      module: {
        select: {
          course: {
            select: {
              id: true,
              authorId: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  const canEdit = canEditCourseContent(
    {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    },
    lesson.module.course.authorId,
  );

  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  const existing = await prisma.lessonAudioFile.findUnique({
    where: {
      lessonId_blockKey: {
        lessonId,
        blockKey,
      },
    },
    select: {
      id: true,
    },
  });

  const saved = existing
    ? await prisma.lessonAudioFile.update({
        where: {
          id: existing.id,
        },
        data: {
          filename: file.name,
          mimeType: file.type || "audio/mpeg",
          sizeInBytes: file.size,
          data: bytes,
        },
        select: {
          id: true,
          filename: true,
          sizeInBytes: true,
        },
      })
    : await prisma.lessonAudioFile.create({
        data: {
          lessonId,
          blockKey,
          filename: file.name,
          mimeType: file.type || "audio/mpeg",
          sizeInBytes: file.size,
          data: bytes,
        },
        select: {
          id: true,
          filename: true,
          sizeInBytes: true,
        },
      });

  return NextResponse.json({
    ok: true,
    file: {
      id: saved.id,
      filename: saved.filename,
      sizeInBytes: saved.sizeInBytes,
      url: buildAudioUrl(saved.id),
    },
  });
}
