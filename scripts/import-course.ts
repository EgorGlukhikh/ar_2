/**
 * Скрипт массового импорта уроков курса.
 *
 * Использование:
 *   npx tsx scripts/import-course.ts --manifest=./data/manifest.json
 *
 * Формат manifest.json — см. data/manifest-example.json
 */

import * as fs from "fs";
import * as path from "path";

import { LessonType, MediaSourceType, prisma } from "@academy/db";

// ─── Типы манифеста ─────────────────────────────────────────────────────────

type ManifestBlock =
  | { type: "VIDEO"; title?: string; rutube: string }
  | { type: "AUDIO"; title?: string; url: string }
  | { type: "TEXT"; title?: string; textFile?: string; body?: string }
  | { type: "FILE"; title: string; url: string; note?: string };

type ManifestLesson = {
  position: number;
  title: string;
  excerpt?: string;
  lessonImageUrl?: string;
  blocks: ManifestBlock[];
};

type Manifest = {
  courseId: string;
  moduleId: string;
  lessons: ManifestLesson[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseArgs(): { manifestPath: string } {
  const arg = process.argv.find((a) => a.startsWith("--manifest="));
  if (!arg) {
    console.error("❌  Укажи путь к манифесту: --manifest=./data/manifest.json");
    process.exit(1);
  }
  return { manifestPath: arg.replace("--manifest=", "") };
}

function readManifest(filePath: string): Manifest {
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) {
    console.error(`❌  Файл манифеста не найден: ${absolute}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(absolute, "utf-8")) as Manifest;
}

function readTextFile(filePath: string, baseDir: string): string {
  const absolute = path.resolve(baseDir, filePath);
  if (!fs.existsSync(absolute)) {
    console.warn(`⚠️  Текстовый файл не найден: ${absolute}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf-8");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { manifestPath } = parseArgs();
  const manifest = readManifest(manifestPath);
  const baseDir = path.dirname(path.resolve(manifestPath));

  console.log(`\n📋  Манифест: ${manifestPath}`);
  console.log(`🏫  Курс: ${manifest.courseId}`);
  console.log(`📦  Модуль: ${manifest.moduleId}`);
  console.log(`📝  Уроков для импорта: ${manifest.lessons.length}\n`);

  // Проверяем, существует ли модуль
  const moduleRecord = await prisma.module.findUnique({
    where: { id: manifest.moduleId },
    select: { id: true, courseId: true, title: true },
  });

  if (!moduleRecord) {
    console.error(`❌  Модуль не найден: ${manifest.moduleId}`);
    process.exit(1);
  }

  if (moduleRecord.courseId !== manifest.courseId) {
    console.error(`❌  Модуль не принадлежит курсу ${manifest.courseId}`);
    process.exit(1);
  }

  console.log(`✅  Модуль найден: «${moduleRecord.title}»\n`);

  let created = 0;
  let skipped = 0;

  for (const lessonData of manifest.lessons) {
    // Проверяем — не существует ли уже урок на этой позиции
    const existing = await prisma.lesson.findUnique({
      where: { moduleId_position: { moduleId: manifest.moduleId, position: lessonData.position } },
      select: { id: true, title: true },
    });

    if (existing) {
      console.log(`⏭️  [${lessonData.position}] Уже есть: «${existing.title}» — пропускаю`);
      skipped++;
      continue;
    }

    // Создаём урок
    const lesson = await prisma.lesson.create({
      data: {
        moduleId: manifest.moduleId,
        title: lessonData.title,
        excerpt: lessonData.excerpt ?? null,
        lessonImageUrl: lessonData.lessonImageUrl ?? null,
        type: LessonType.TEXT,
        position: lessonData.position,
        isPreview: false,
      },
      select: { id: true },
    });

    // Создаём блоки
    const blocks: {
      lessonId: string;
      blockKey: string;
      type: string;
      position: number;
      title: string;
      body: string | null;
      url: string | null;
      note: string | null;
      submissionHint: string | null;
    }[] = [];

    let blockPos = 0;

    for (const blockData of lessonData.blocks) {
      blockPos++;
      const blockKey = `${lesson.id}-block-${blockPos}`;

      if (blockData.type === "VIDEO") {
        blocks.push({
          lessonId: lesson.id,
          blockKey,
          type: "VIDEO",
          position: blockPos,
          title: blockData.title ?? "Видео урока",
          body: blockData.rutube,
          url: null,
          note: null,
          submissionHint: null,
        });

        // Также сохраняем Rutube embed в поля урока
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: {
            videoSourceType: MediaSourceType.RUTUBE_EMBED,
            videoUrl: blockData.rutube,
          },
        });
        continue;
      }

      if (blockData.type === "AUDIO") {
        blocks.push({
          lessonId: lesson.id,
          blockKey,
          type: "AUDIO",
          position: blockPos,
          title: blockData.title ?? "Аудио-версия",
          body: null,
          url: blockData.url,
          note: null,
          submissionHint: null,
        });
        continue;
      }

      if (blockData.type === "TEXT") {
        const body = blockData.textFile
          ? readTextFile(blockData.textFile, baseDir)
          : (blockData.body ?? "");
        blocks.push({
          lessonId: lesson.id,
          blockKey,
          type: "TEXT",
          position: blockPos,
          title: blockData.title ?? "Транскрипция",
          body,
          url: null,
          note: null,
          submissionHint: null,
        });
        continue;
      }

      if (blockData.type === "FILE") {
        blocks.push({
          lessonId: lesson.id,
          blockKey,
          type: "FILE",
          position: blockPos,
          title: blockData.title,
          body: null,
          url: blockData.url,
          note: blockData.note ?? null,
          submissionHint: null,
        });
        continue;
      }
    }

    // Bulk insert блоков
    const lessonBlockTx = prisma as typeof prisma & {
      lessonBlock: { createMany(args: unknown): Promise<{ count: number }> };
    };
    await lessonBlockTx.lessonBlock.createMany({ data: blocks });

    console.log(`✅  [${lessonData.position}] «${lessonData.title}» — ${blocks.length} блоков`);
    created++;
  }

  console.log(`\n🎉  Готово! Создано: ${created}, пропущено: ${skipped}\n`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("❌  Ошибка:", err);
  process.exit(1);
});
