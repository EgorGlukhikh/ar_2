"use server";

import {
  CourseStatus,
  LessonType,
  MediaSourceType,
  Prisma,
  prisma,
} from "@academy/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin";
import { buildLessonContent } from "@/lib/lesson-content";

const createCourseSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  status: z.nativeEnum(CourseStatus),
});

const updateCourseSchema = createCourseSchema.extend({
  courseId: z.string().trim().min(1),
});

const moduleSchema = z.object({
  courseId: z.string().trim().min(1),
  title: z.string().trim().min(2),
});

const updateModuleSchema = moduleSchema.extend({
  moduleId: z.string().trim().min(1),
});

const lessonSchema = z.object({
  moduleId: z.string().trim().min(1),
  title: z.string().trim().min(2),
  type: z.nativeEnum(LessonType),
});

const updateLessonSchema = z.object({
  lessonId: z.string().trim().min(1),
  moduleId: z.string().trim().min(1),
  title: z.string().trim().min(2),
  excerpt: z.string().trim().optional(),
  type: z.nativeEnum(LessonType),
  isPreview: z.boolean().default(false),
  accessAfterDays: z.number().int().min(0).nullable(),
  contentText: z.string().trim().optional(),
  attachmentTitle: z.string().trim().optional(),
  attachmentUrl: z.string().trim().optional(),
  videoSourceType: z.nativeEnum(MediaSourceType).nullable(),
  videoUrl: z.string().trim().optional(),
  videoPlaybackId: z.string().trim().optional(),
});

function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getOptionalValue(formData: FormData, key: string) {
  const value = getTrimmedValue(formData, key);
  return value.length > 0 ? value : undefined;
}

function getOptionalNumber(formData: FormData, key: string) {
  const raw = getTrimmedValue(formData, key);

  if (!raw) {
    return null;
  }

  const value = Number(raw);

  return Number.isFinite(value) ? value : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

async function ensureUniqueCourseSlug(baseValue: string, courseId?: string) {
  const baseSlug = slugify(baseValue) || `course-${Date.now()}`;
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.course.findFirst({
      where: {
        slug: candidate,
        ...(courseId
          ? {
              id: {
                not: courseId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

function refreshAdminRoutes(courseId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/courses");

  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}/content`);
    revalidatePath(`/admin/courses/${courseId}/access`);
  }
}

export async function createCourse(formData: FormData) {
  await requireAdminUser();

  const parsed = createCourseSchema.parse({
    title: getTrimmedValue(formData, "title"),
    slug: getOptionalValue(formData, "slug"),
    description: getOptionalValue(formData, "description"),
    status: getTrimmedValue(formData, "status"),
  });

  const slug = await ensureUniqueCourseSlug(parsed.slug ?? parsed.title);

  const course = await prisma.course.create({
    data: {
      title: parsed.title,
      slug,
      description: parsed.description,
      status: parsed.status,
    },
    select: {
      id: true,
    },
  });

  refreshAdminRoutes(course.id);
  redirect(`/admin/courses/${course.id}/content`);
}

export async function updateCourse(formData: FormData) {
  await requireAdminUser();

  const parsed = updateCourseSchema.parse({
    courseId: getTrimmedValue(formData, "courseId"),
    title: getTrimmedValue(formData, "title"),
    slug: getOptionalValue(formData, "slug"),
    description: getOptionalValue(formData, "description"),
    status: getTrimmedValue(formData, "status"),
  });

  const slug = await ensureUniqueCourseSlug(
    parsed.slug ?? parsed.title,
    parsed.courseId,
  );

  await prisma.course.update({
    where: {
      id: parsed.courseId,
    },
    data: {
      title: parsed.title,
      slug,
      description: parsed.description,
      status: parsed.status,
    },
  });

  refreshAdminRoutes(parsed.courseId);
}

export async function deleteCourse(formData: FormData) {
  await requireAdminUser();

  const courseId = getTrimmedValue(formData, "courseId");

  await prisma.course.delete({
    where: {
      id: courseId,
    },
  });

  refreshAdminRoutes();
  redirect("/admin/courses");
}

export async function createModule(formData: FormData) {
  await requireAdminUser();

  const parsed = moduleSchema.parse({
    courseId: getTrimmedValue(formData, "courseId"),
    title: getTrimmedValue(formData, "title"),
  });

  const lastModule = await prisma.module.findFirst({
    where: {
      courseId: parsed.courseId,
    },
    orderBy: {
      position: "desc",
    },
    select: {
      position: true,
    },
  });

  const createdModule = await prisma.module.create({
    data: {
      courseId: parsed.courseId,
      title: parsed.title,
      position: (lastModule?.position ?? 0) + 1,
    },
    select: {
      id: true,
    },
  });

  refreshAdminRoutes(parsed.courseId);
  redirect(
    `/admin/courses/${parsed.courseId}/content?moduleId=${createdModule.id}`,
  );
}

export async function updateModule(formData: FormData) {
  await requireAdminUser();

  const parsed = updateModuleSchema.parse({
    moduleId: getTrimmedValue(formData, "moduleId"),
    courseId: getTrimmedValue(formData, "courseId"),
    title: getTrimmedValue(formData, "title"),
  });

  await prisma.module.update({
    where: {
      id: parsed.moduleId,
    },
    data: {
      title: parsed.title,
    },
  });

  refreshAdminRoutes(parsed.courseId);
}

export async function deleteModule(formData: FormData) {
  await requireAdminUser();

  const moduleId = getTrimmedValue(formData, "moduleId");
  const courseId = getTrimmedValue(formData, "courseId");

  await prisma.module.delete({
    where: {
      id: moduleId,
    },
  });

  refreshAdminRoutes(courseId);
}

export async function createLesson(formData: FormData) {
  await requireAdminUser();

  const parsed = lessonSchema.parse({
    moduleId: getTrimmedValue(formData, "moduleId"),
    title: getTrimmedValue(formData, "title"),
    type: getTrimmedValue(formData, "type"),
  });

  const [moduleRecord, lastLesson] = await Promise.all([
    prisma.module.findUnique({
      where: {
        id: parsed.moduleId,
      },
      select: {
        courseId: true,
      },
    }),
    prisma.lesson.findFirst({
      where: {
        moduleId: parsed.moduleId,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    }),
  ]);

  if (!moduleRecord) {
    throw new Error("Module not found");
  }

  const lesson = await prisma.lesson.create({
    data: {
      moduleId: parsed.moduleId,
      title: parsed.title,
      type: parsed.type,
      position: (lastLesson?.position ?? 0) + 1,
    },
    select: {
      id: true,
    },
  });

  refreshAdminRoutes(moduleRecord.courseId);
  redirect(
    `/admin/courses/${moduleRecord.courseId}/content?moduleId=${parsed.moduleId}&lessonId=${lesson.id}`,
  );
}

export async function updateLesson(formData: FormData) {
  await requireAdminUser();

  const hasVideoFields =
    formData.has("videoSourceType") ||
    formData.has("videoUrl") ||
    formData.has("videoPlaybackId");

  const parsed = updateLessonSchema.parse({
    lessonId: getTrimmedValue(formData, "lessonId"),
    moduleId: getTrimmedValue(formData, "moduleId"),
    title: getTrimmedValue(formData, "title"),
    excerpt: getOptionalValue(formData, "excerpt"),
    type: getTrimmedValue(formData, "type"),
    isPreview: formData.get("isPreview") === "on",
    accessAfterDays: getOptionalNumber(formData, "accessAfterDays"),
    contentText: getOptionalValue(formData, "contentText"),
    attachmentTitle: getOptionalValue(formData, "attachmentTitle"),
    attachmentUrl: getOptionalValue(formData, "attachmentUrl"),
    videoSourceType: getOptionalValue(formData, "videoSourceType") ?? null,
    videoUrl: getOptionalValue(formData, "videoUrl"),
    videoPlaybackId: getOptionalValue(formData, "videoPlaybackId"),
  });

  const moduleRecord = await prisma.module.findUnique({
    where: {
      id: parsed.moduleId,
    },
    select: {
      courseId: true,
    },
  });

  if (!moduleRecord) {
    throw new Error("Module not found");
  }

  const contentPayload = buildLessonContent({
    body: parsed.contentText,
    attachmentTitle: parsed.attachmentTitle,
    attachmentUrl: parsed.attachmentUrl,
  });

  await prisma.lesson.update({
    where: {
      id: parsed.lessonId,
    },
    data: {
      title: parsed.title,
      excerpt: parsed.excerpt,
      type: parsed.type,
      isPreview: parsed.isPreview,
      accessAfterDays: parsed.accessAfterDays,
      content: contentPayload ? contentPayload : Prisma.JsonNull,
      ...(hasVideoFields
        ? {
            videoSourceType: parsed.videoSourceType,
            videoUrl: parsed.videoUrl,
            videoPlaybackId: parsed.videoPlaybackId,
          }
        : {}),
    },
  });

  refreshAdminRoutes(moduleRecord.courseId);
}

export async function deleteLesson(formData: FormData) {
  await requireAdminUser();

  const lessonId = getTrimmedValue(formData, "lessonId");
  const courseId = getTrimmedValue(formData, "courseId");

  await prisma.lesson.delete({
    where: {
      id: lessonId,
    },
  });

  refreshAdminRoutes(courseId);
}
