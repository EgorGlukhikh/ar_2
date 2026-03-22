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

import {
  canEditCourseContent,
  requireAdminUser,
  requireWorkspaceUser,
} from "@/lib/admin";
import {
  buildLessonContentFromBlocks,
  type LessonBlock,
} from "@/lib/lesson-content";

const createCourseSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  status: z.nativeEnum(CourseStatus),
});

const updateCourseSchema = createCourseSchema.extend({
  courseId: z.string().trim().min(1),
  authorId: z.string().trim().optional(),
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
  type: z.nativeEnum(LessonType).default(LessonType.TEXT),
});

const moveLessonSchema = z.object({
  lessonId: z.string().trim().min(1),
  targetModuleId: z.string().trim().min(1),
});

const updateLessonSchema = z.object({
  lessonId: z.string().trim().min(1),
  moduleId: z.string().trim().min(1),
  title: z.string().trim().min(2),
  excerpt: z.string().trim().optional(),
  type: z.nativeEnum(LessonType).default(LessonType.TEXT),
  isPreview: z.boolean().default(false),
  accessAfterDays: z.number().int().min(0).nullable(),
  blocksJson: z.string().trim().optional(),
  requiresCuratorReview: z.boolean().default(true),
  unlockNextModuleOnApproval: z.boolean().default(true),
  allowTextSubmission: z.boolean().default(true),
  allowLinkSubmission: z.boolean().default(true),
  allowFileUpload: z.boolean().default(true),
  videoSourceType: z.nativeEnum(MediaSourceType).nullable(),
  videoUrl: z.string().trim().optional(),
  videoPlaybackId: z.string().trim().optional(),
});

const lessonBlockSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().trim().min(1),
    type: z.literal("TEXT"),
    title: z.string(),
    body: z.string(),
  }),
  z.object({
    id: z.string().trim().min(1),
    type: z.literal("VIDEO"),
    title: z.string(),
    body: z.string().optional().default(""),
  }),
  z.object({
    id: z.string().trim().min(1),
    type: z.literal("FILE"),
    title: z.string(),
    url: z.string(),
    note: z.string().optional().default(""),
  }),
  z.object({
    id: z.string().trim().min(1),
    type: z.literal("HOMEWORK"),
    title: z.string(),
    body: z.string(),
    submissionHint: z.string().optional().default(""),
  }),
]);

function parseLessonBlocksJson(value?: string): LessonBlock[] {
  if (!value) {
    return [];
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(value);
  } catch {
    throw new Error("Не удалось прочитать структуру блоков урока.");
  }

  if (!Array.isArray(parsedJson)) {
    throw new Error("Структура блоков урока должна быть списком.");
  }

  return parsedJson.map((item) => lessonBlockSchema.parse(item));
}

function resolveLessonTypeFromBlocks(blocks: LessonBlock[], fallback: LessonType) {
  if (blocks.length === 0) {
    return fallback;
  }

  if (blocks.some((block) => block.type === "HOMEWORK")) {
    return LessonType.HOMEWORK;
  }

  if (blocks.some((block) => block.type === "VIDEO")) {
    return LessonType.VIDEO;
  }

  if (blocks.some((block) => block.type === "FILE")) {
    return LessonType.FILE;
  }

  return LessonType.TEXT;
}

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
  revalidatePath("/admin/team");

  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}/content`);
    revalidatePath(`/admin/courses/${courseId}/access`);
  }
}

async function requireCourseContentEditor(courseId: string) {
  const user = await requireWorkspaceUser();

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (!canEditCourseContent(user, course.authorId)) {
    redirect("/admin/courses");
  }

  return { user, course };
}

async function requireModuleContentEditor(moduleId: string) {
  const moduleRecord = await prisma.module.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      id: true,
      courseId: true,
      course: {
        select: {
          authorId: true,
        },
      },
    },
  });

  if (!moduleRecord) {
    throw new Error("Module not found");
  }

  const user = await requireWorkspaceUser();

  if (!canEditCourseContent(user, moduleRecord.course.authorId)) {
    redirect("/admin/courses");
  }

  return {
    user,
    moduleRecord,
  };
}

async function requireLessonContentEditor(lessonId: string) {
  const lessonRecord = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
      moduleId: true,
      module: {
        select: {
          courseId: true,
          course: {
            select: {
              authorId: true,
            },
          },
        },
      },
    },
  });

  if (!lessonRecord) {
    throw new Error("Lesson not found");
  }

  const user = await requireWorkspaceUser();

  if (!canEditCourseContent(user, lessonRecord.module.course.authorId)) {
    redirect("/admin/courses");
  }

  return {
    user,
    lessonRecord,
  };
}

async function normalizeLessonPositions(
  tx: Prisma.TransactionClient,
  moduleId: string,
) {
  const lessons = await tx.lesson.findMany({
    where: {
      moduleId,
    },
    orderBy: {
      position: "asc",
    },
    select: {
      id: true,
    },
  });

  await Promise.all(
    lessons.map((lesson, index) =>
      tx.lesson.update({
        where: {
          id: lesson.id,
        },
        data: {
          position: index + 1,
        },
      }),
    ),
  );
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
    authorId: getOptionalValue(formData, "authorId"),
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
      authorId: parsed.authorId ?? null,
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
  const parsed = moduleSchema.parse({
    courseId: getTrimmedValue(formData, "courseId"),
    title: getTrimmedValue(formData, "title"),
  });

  await requireCourseContentEditor(parsed.courseId);

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
  const parsed = updateModuleSchema.parse({
    moduleId: getTrimmedValue(formData, "moduleId"),
    courseId: getTrimmedValue(formData, "courseId"),
    title: getTrimmedValue(formData, "title"),
  });

  await requireCourseContentEditor(parsed.courseId);

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
  const moduleId = getTrimmedValue(formData, "moduleId");
  const courseId = getTrimmedValue(formData, "courseId");

  await requireCourseContentEditor(courseId);

  await prisma.module.delete({
    where: {
      id: moduleId,
    },
  });

  refreshAdminRoutes(courseId);
}

export async function createLesson(formData: FormData) {
  const parsed = lessonSchema.parse({
    moduleId: getTrimmedValue(formData, "moduleId"),
    title: getTrimmedValue(formData, "title"),
    type: (getTrimmedValue(formData, "type") || LessonType.TEXT) as LessonType,
  });

  const [{ moduleRecord }, lastLesson] = await Promise.all([
    requireModuleContentEditor(parsed.moduleId),
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
  const hasVideoFields =
    formData.has("videoSourceType") ||
    formData.has("videoUrl") ||
    formData.has("videoPlaybackId");

  const parsed = updateLessonSchema.parse({
    lessonId: getTrimmedValue(formData, "lessonId"),
    moduleId: getTrimmedValue(formData, "moduleId"),
    title: getTrimmedValue(formData, "title"),
    excerpt: getOptionalValue(formData, "excerpt"),
    type: (getTrimmedValue(formData, "type") || LessonType.TEXT) as LessonType,
    isPreview: formData.get("isPreview") === "on",
    accessAfterDays: getOptionalNumber(formData, "accessAfterDays"),
    blocksJson: getOptionalValue(formData, "blocksJson"),
    requiresCuratorReview: formData.get("requiresCuratorReview") === "on",
    unlockNextModuleOnApproval: formData.get("unlockNextModuleOnApproval") === "on",
    allowTextSubmission: formData.get("allowTextSubmission") === "on",
    allowLinkSubmission: formData.get("allowLinkSubmission") === "on",
    allowFileUpload: formData.get("allowFileUpload") === "on",
    videoSourceType: getOptionalValue(formData, "videoSourceType") ?? null,
    videoUrl: getOptionalValue(formData, "videoUrl"),
    videoPlaybackId: getOptionalValue(formData, "videoPlaybackId"),
  });

  const { moduleRecord } = await requireModuleContentEditor(parsed.moduleId);

  const blocks = parseLessonBlocksJson(parsed.blocksJson);
  const contentPayload = buildLessonContentFromBlocks(blocks);
  const resolvedType = resolveLessonTypeFromBlocks(blocks, parsed.type);
  const homeworkBlock = blocks.find((block) => block.type === "HOMEWORK");

  await prisma.$transaction(async (tx) => {
    await tx.lesson.update({
      where: {
        id: parsed.lessonId,
      },
      data: {
        title: parsed.title,
        excerpt: parsed.excerpt,
        type: resolvedType,
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

    if (homeworkBlock) {
      await tx.homeworkAssignment.upsert({
        where: {
          lessonId: parsed.lessonId,
        },
        create: {
          lessonId: parsed.lessonId,
          instructions: homeworkBlock.body || null,
          requiresCuratorReview: parsed.requiresCuratorReview,
          unlockNextModuleOnApproval: parsed.unlockNextModuleOnApproval,
          allowTextSubmission: parsed.allowTextSubmission,
          allowLinkSubmission: parsed.allowLinkSubmission,
          allowFileUpload: parsed.allowFileUpload,
        },
        update: {
          instructions: homeworkBlock.body || null,
          requiresCuratorReview: parsed.requiresCuratorReview,
          unlockNextModuleOnApproval: parsed.unlockNextModuleOnApproval,
          allowTextSubmission: parsed.allowTextSubmission,
          allowLinkSubmission: parsed.allowLinkSubmission,
          allowFileUpload: parsed.allowFileUpload,
        },
      });
    } else {
      await tx.homeworkAssignment.deleteMany({
        where: {
          lessonId: parsed.lessonId,
        },
      });
    }
  });

  refreshAdminRoutes(moduleRecord.courseId);
}

export async function deleteLesson(formData: FormData) {
  const lessonId = getTrimmedValue(formData, "lessonId");
  const courseId = getTrimmedValue(formData, "courseId");

  await requireCourseContentEditor(courseId);

  await prisma.lesson.delete({
    where: {
      id: lessonId,
    },
  });

  refreshAdminRoutes(courseId);
}

export async function moveLessonToModule(formData: FormData) {
  const parsed = moveLessonSchema.parse({
    lessonId: getTrimmedValue(formData, "lessonId"),
    targetModuleId: getTrimmedValue(formData, "targetModuleId"),
  });

  const { lessonRecord } = await requireLessonContentEditor(parsed.lessonId);
  const { moduleRecord: targetModule } = await requireModuleContentEditor(parsed.targetModuleId);

  if (lessonRecord.module.courseId !== targetModule.courseId) {
    throw new Error("Нельзя переносить урок в модуль другого курса.");
  }

  if (lessonRecord.moduleId === targetModule.id) {
    redirect(
      `/admin/courses/${targetModule.courseId}/content?moduleId=${targetModule.id}&lessonId=${parsed.lessonId}`,
    );
  }

  await prisma.$transaction(async (tx) => {
    const lastTargetLesson = await tx.lesson.findFirst({
      where: {
        moduleId: targetModule.id,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });

    await tx.lesson.update({
      where: {
        id: parsed.lessonId,
      },
      data: {
        moduleId: targetModule.id,
        position: (lastTargetLesson?.position ?? 0) + 1,
      },
    });

    await normalizeLessonPositions(tx, lessonRecord.moduleId);
    await normalizeLessonPositions(tx, targetModule.id);
  });

  refreshAdminRoutes(targetModule.courseId);
  redirect(
    `/admin/courses/${targetModule.courseId}/content?moduleId=${targetModule.id}&lessonId=${parsed.lessonId}`,
  );
}
