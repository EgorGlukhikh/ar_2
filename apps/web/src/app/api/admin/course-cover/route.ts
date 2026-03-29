import { auth } from "@academy/auth";
import { prisma } from "@academy/db";
import { USER_ROLES, type UserRole } from "@academy/shared";
import { NextResponse } from "next/server";

import { canEditCourseContent } from "@/lib/admin";
import { isAllowedImageFile } from "@/lib/media-upload";

const MAX_COVER_SIZE_BYTES = 10 * 1024 * 1024;

function isUserRole(value: string | undefined | null): value is UserRole {
  return Boolean(value && Object.values(USER_ROLES).includes(value as UserRole));
}

function buildCourseCoverUrl(fileId: string) {
  return `/api/course-cover/${fileId}`;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !isUserRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const file = formData.get("file");

  if (!courseId || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing course or file." }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Empty files are not supported." }, { status: 400 });
  }

  if (file.size > MAX_COVER_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Image is too large. Limit is 10 MB." },
      { status: 400 },
    );
  }

  if (!isAllowedImageFile(file)) {
    return NextResponse.json(
      { error: "Unsupported image format. Allowed: JPG, PNG, WEBP, AVIF." },
      { status: 400 },
    );
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      authorId: true,
      coverFile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const canEdit = canEditCourseContent(
    {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    },
    course.authorId,
  );

  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  const saved = course.coverFile
    ? await prisma.courseCoverFile.update({
        where: {
          id: course.coverFile.id,
        },
        data: {
          filename: file.name,
          mimeType: file.type || "image/jpeg",
          sizeInBytes: file.size,
          data: bytes,
        },
        select: {
          id: true,
          filename: true,
          sizeInBytes: true,
        },
      })
    : await prisma.courseCoverFile.create({
        data: {
          courseId,
          filename: file.name,
          mimeType: file.type || "image/jpeg",
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
      url: buildCourseCoverUrl(saved.id),
    },
  });
}
