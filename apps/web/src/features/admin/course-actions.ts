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
  getWorkspaceHomePath,
  requireAdminUser,
  requireCourseCreator,
  requireWorkspaceUser,
} from "@/lib/admin";
import {
  buildPersistedLessonBlocks,
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

const repositionLessonSchema = z.object({
  lessonId: z.string().trim().min(1),
  targetModuleId: z.string().trim().min(1),
  targetLessonId: z.string().trim().optional(),
  placement: z.enum(["before", "after", "end"]).default("end"),
});

const repositionModuleSchema = z.object({
  moduleId: z.string().trim().min(1),
  targetModuleId: z.string().trim().optional(),
  placement: z.enum(["before", "after", "end"]).default("end"),
});

const updateLessonSchema = z.object({
  lessonId: z.string().trim().min(1),
  moduleId: z.string().trim().min(1),
  title: z.string().trim().min(2),
  excerpt: z.string().trim().optional(),
  type: z.nativeEnum(LessonType).default(LessonType.TEXT),
  isPreview: z.boolean().default(false),
  accessAfterDays: z.number().int().min(0).nullable(),
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

function parseLessonBlocks(formData: FormData): LessonBlock[] {
  const ids = formData.getAll("lessonBlockId").map((value) => String(value));
  const types = formData.getAll("lessonBlockType").map((value) => String(value));
  const titles = formData.getAll("lessonBlockTitle").map((value) => String(value));
  const bodies = formData.getAll("lessonBlockBody").map((value) => String(value));
  const urls = formData.getAll("lessonBlockUrl").map((value) => String(value));
  const notes = formData.getAll("lessonBlockNote").map((value) => String(value));
  const submissionHints = formData
    .getAll("lessonBlockSubmissionHint")
    .map((value) => String(value));
  const positions = formData
    .getAll("lessonBlockPosition")
    .map((value) => Number(String(value)));

  if (ids.length === 0) {
    return parseLessonBlocksJson(getOptionalValue(formData, "blocksJson"));
  }

  const lengths = [
    types.length,
    titles.length,
    bodies.length,
    urls.length,
    notes.length,
    submissionHints.length,
    positions.length,
  ];

  if (lengths.some((length) => length !== ids.length)) {
    throw new Error("Структура блоков урока повреждена: поля блоков пришли неполностью.");
  }

  const blocksWithPosition = ids.map((id, index) => {
    const type = types[index];
    const position = positions[index];

    if (!Number.isFinite(position)) {
      throw new Error("Не удалось определить порядок блоков урока.");
    }

    const parsedBlock = lessonBlockSchema.parse({
      id,
      type,
      title: titles[index],
      body: bodies[index],
      url: urls[index],
      note: notes[index],
      submissionHint: submissionHints[index],
    });

    return {
      position,
      block: parsedBlock,
    };
  });

  return blocksWithPosition
    .sort((left, right) => left.position - right.position)
    .map((entry) => entry.block);
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

async function normalizeModulePositions(
  tx: Prisma.TransactionClient,
  courseId: string,
) {
  const modules = await tx.module.findMany({
    where: {
      courseId,
    },
    orderBy: {
      position: "asc",
    },
    select: {
      id: true,
    },
  });

  await Promise.all(
    modules.map((moduleItem, index) =>
      tx.module.update({
        where: {
          id: moduleItem.id,
        },
        data: {
          position: index + 1,
        },
      }),
    ),
  );
}

function resolveInsertIndex(args: {
  orderedIds: string[];
  targetId?: string;
  placement: "before" | "after" | "end";
}) {
  if (!args.targetId || args.placement === "end") {
    return args.orderedIds.length;
  }

  const targetIndex = args.orderedIds.findIndex((id) => id === args.targetId);

  if (targetIndex === -1) {
    return args.orderedIds.length;
  }

  return args.placement === "after" ? targetIndex + 1 : targetIndex;
}

export async function createCourse(formData: FormData) {
  const user = await requireCourseCreator();

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
      authorId: user.role === "AUTHOR" ? user.id : null,
    },
    select: {
      id: true,
    },
  });

  refreshAdminRoutes(course.id);
  redirect(`/admin/courses/${course.id}/content`);
}

export async function updateCourse(formData: FormData) {
  const parsed = updateCourseSchema.parse({
    courseId: getTrimmedValue(formData, "courseId"),
    title: getTrimmedValue(formData, "title"),
    slug: getOptionalValue(formData, "slug"),
    description: getOptionalValue(formData, "description"),
    status: getTrimmedValue(formData, "status"),
    authorId: getOptionalValue(formData, "authorId"),
  });

  const user = await requireWorkspaceUser();
  const course = await prisma.course.findUnique({
    where: {
      id: parsed.courseId,
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
    redirect(getWorkspaceHomePath(user.role));
  }

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
      ...(user.role === "ADMIN"
        ? {
            status: parsed.status,
            authorId: parsed.authorId ?? null,
          }
        : {}),
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

  const blocks = parseLessonBlocks(formData);
  const persistedBlocks = buildPersistedLessonBlocks(blocks);
  const contentPayload = buildLessonContentFromBlocks(blocks);
  const resolvedType = resolveLessonTypeFromBlocks(blocks, parsed.type);
  const homeworkBlock = blocks.find((block) => block.type === "HOMEWORK");

  await prisma.$transaction(async (tx) => {
    const lessonBlockTx = tx as Prisma.TransactionClient & {
      lessonBlock: {
        deleteMany(args: unknown): Promise<unknown>;
        createMany(args: unknown): Promise<unknown>;
      };
    };

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

    await lessonBlockTx.lessonBlock.deleteMany({
      where: {
        lessonId: parsed.lessonId,
      },
    });

    if (persistedBlocks.length > 0) {
      await lessonBlockTx.lessonBlock.createMany({
        data: persistedBlocks.map((block) => ({
          lessonId: parsed.lessonId,
          blockKey: block.blockKey,
          type: block.type,
          position: block.position,
          title: block.title,
          body: block.body,
          url: block.url,
          note: block.note,
          submissionHint: block.submissionHint,
        })),
      });
    }

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

export async function repositionLesson(formData: FormData) {
  const parsed = repositionLessonSchema.parse({
    lessonId: getTrimmedValue(formData, "lessonId"),
    targetModuleId: getTrimmedValue(formData, "targetModuleId"),
    targetLessonId: getOptionalValue(formData, "targetLessonId"),
    placement: (getTrimmedValue(formData, "placement") || "end") as
      | "before"
      | "after"
      | "end",
  });

  const { lessonRecord } = await requireLessonContentEditor(parsed.lessonId);
  const { moduleRecord: targetModule } = await requireModuleContentEditor(parsed.targetModuleId);

  if (lessonRecord.module.courseId !== targetModule.courseId) {
    throw new Error("Нельзя переносить урок в модуль другого курса.");
  }

  await prisma.$transaction(async (tx) => {
    const [sourceLessons, targetLessons] = await Promise.all([
      tx.lesson.findMany({
        where: {
          moduleId: lessonRecord.moduleId,
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
        },
      }),
      lessonRecord.moduleId === targetModule.id
        ? Promise.resolve([])
        : tx.lesson.findMany({
            where: {
              moduleId: targetModule.id,
            },
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
            },
          }),
    ]);

    if (lessonRecord.moduleId === targetModule.id) {
      const nextOrder = sourceLessons
        .map((lesson) => lesson.id)
        .filter((id) => id !== parsed.lessonId);

      const insertIndex = resolveInsertIndex({
        orderedIds: nextOrder,
        targetId: parsed.targetLessonId,
        placement: parsed.placement,
      });

      nextOrder.splice(insertIndex, 0, parsed.lessonId);

      await Promise.all(
        nextOrder.map((lessonId, index) =>
          tx.lesson.update({
            where: {
              id: lessonId,
            },
            data: {
              position: index + 1,
            },
          }),
        ),
      );

      return;
    }

    const nextSourceOrder = sourceLessons
      .map((lesson) => lesson.id)
      .filter((id) => id !== parsed.lessonId);
    const nextTargetOrder = targetLessons.map((lesson) => lesson.id);

    const insertIndex = resolveInsertIndex({
      orderedIds: nextTargetOrder,
      targetId: parsed.targetLessonId,
      placement: parsed.placement,
    });

    nextTargetOrder.splice(insertIndex, 0, parsed.lessonId);

    await tx.lesson.update({
      where: {
        id: parsed.lessonId,
      },
      data: {
        moduleId: targetModule.id,
      },
    });

    await Promise.all(
      nextSourceOrder.map((lessonId, index) =>
        tx.lesson.update({
          where: {
            id: lessonId,
          },
          data: {
            position: index + 1,
          },
        }),
      ),
    );

    await Promise.all(
      nextTargetOrder.map((lessonId, index) =>
        tx.lesson.update({
          where: {
            id: lessonId,
          },
          data: {
            position: index + 1,
          },
        }),
      ),
    );
  });

  refreshAdminRoutes(targetModule.courseId);

  return {
    courseId: targetModule.courseId,
    moduleId: targetModule.id,
    lessonId: parsed.lessonId,
  };
}

export async function repositionModule(formData: FormData) {
  const parsed = repositionModuleSchema.parse({
    moduleId: getTrimmedValue(formData, "moduleId"),
    targetModuleId: getOptionalValue(formData, "targetModuleId"),
    placement: (getTrimmedValue(formData, "placement") || "end") as
      | "before"
      | "after"
      | "end",
  });

  const { moduleRecord } = await requireModuleContentEditor(parsed.moduleId);

  if (parsed.targetModuleId) {
    const { moduleRecord: targetModule } = await requireModuleContentEditor(
      parsed.targetModuleId,
    );

    if (targetModule.courseId !== moduleRecord.courseId) {
      throw new Error("Нельзя переносить модуль в другой курс.");
    }
  }

  await prisma.$transaction(async (tx) => {
    const orderedModuleIds = (
      await tx.module.findMany({
        where: {
          courseId: moduleRecord.courseId,
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
        },
      })
    )
      .map((item) => item.id)
      .filter((id) => id !== parsed.moduleId);

    const insertIndex = resolveInsertIndex({
      orderedIds: orderedModuleIds,
      targetId: parsed.targetModuleId,
      placement: parsed.placement,
    });

    orderedModuleIds.splice(insertIndex, 0, parsed.moduleId);

    await Promise.all(
      orderedModuleIds.map((moduleId, index) =>
        tx.module.update({
          where: {
            id: moduleId,
          },
          data: {
            position: index + 1,
          },
        }),
      ),
    );

    await normalizeModulePositions(tx, moduleRecord.courseId);
  });

  refreshAdminRoutes(moduleRecord.courseId);

  return {
    courseId: moduleRecord.courseId,
    moduleId: parsed.moduleId,
  };
}
