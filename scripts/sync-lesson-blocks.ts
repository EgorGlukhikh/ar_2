import { LessonType, prisma } from "@academy/db";

import {
  buildPersistedLessonBlocks,
  extractLessonBlocks,
  type LessonBlock,
} from "../apps/web/src/lib/lesson-content.ts";

function buildLegacyFallbackBlocks(lesson: {
  type: LessonType;
  content: unknown;
  videoSourceType: unknown;
  videoUrl: string | null;
  videoPlaybackId: string | null;
  homeworkAssignment: {
    instructions: string | null;
  } | null;
}) {
  const extractedBlocks = extractLessonBlocks(lesson.content);

  if (extractedBlocks.length > 0) {
    return extractedBlocks;
  }

  if (lesson.videoSourceType || lesson.videoUrl || lesson.videoPlaybackId) {
    return [
      {
        id: "legacy-video",
        type: "VIDEO",
        title: "Видео",
        body: "",
      } satisfies LessonBlock,
    ];
  }

  if (lesson.type === LessonType.HOMEWORK) {
    return [
      {
        id: "legacy-homework",
        type: "HOMEWORK",
        title: "Домашнее задание",
        body: lesson.homeworkAssignment?.instructions ?? "",
        submissionHint: "",
      } satisfies LessonBlock,
    ];
  }

  return [];
}

async function main() {
  const lessonBlockPrisma = prisma as typeof prisma & {
    lessonBlock: {
      createMany(args: unknown): Promise<unknown>;
    };
  };
  const lessons = await prisma.lesson.findMany({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      title: true,
      type: true,
      content: true,
      videoSourceType: true,
      videoUrl: true,
      videoPlaybackId: true,
      lessonBlocks: {
        select: {
          id: true,
        },
        take: 1,
      },
      homeworkAssignment: {
        select: {
          instructions: true,
        },
      },
    },
  });

  let migratedLessons = 0;
  let skippedLessons = 0;

  for (const lesson of lessons) {
    if (lesson.lessonBlocks.length > 0) {
      skippedLessons += 1;
      continue;
    }

    const blocks = buildLegacyFallbackBlocks(lesson);
    const persistedBlocks = buildPersistedLessonBlocks(blocks);

    if (persistedBlocks.length === 0) {
      skippedLessons += 1;
      continue;
    }

    await lessonBlockPrisma.lessonBlock.createMany({
      data: persistedBlocks.map((block) => ({
        lessonId: lesson.id,
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

    migratedLessons += 1;
    console.log(
      `[sync-lesson-blocks] Migrated ${persistedBlocks.length} block(s) for lesson "${lesson.title}" (${lesson.id}).`,
    );
  }

  console.log(
    `[sync-lesson-blocks] Done. Migrated lessons: ${migratedLessons}. Skipped lessons: ${skippedLessons}.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("[sync-lesson-blocks] Failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
