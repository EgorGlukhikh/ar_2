/**
 * Создаёт курс "Базовый курс риэлтора 2.0" с 5 уроками.
 *
 * Запуск (подставь свою DATABASE_URL из Railway):
 *   $env:DATABASE_URL="postgresql://postgres:...@postgres.railway.internal:5432/railway"
 *   npx tsx scripts/create-base-course.ts
 *
 * Или в одну строку:
 *   $env:DATABASE_URL="..."; npx tsx scripts/create-base-course.ts
 */

import { CourseDeliveryFormat, CourseStatus, LessonType, MediaSourceType, prisma } from "@academy/db";

const AUTHOR_EMAIL = "hp@mail.ru"; // автор курса

const LESSONS = [
  {
    position: 1,
    title: "Урок 1",
    rutube: "https://rutube.ru/video/private/f0bd5d947d6a52bac47742331fd05c23/?p=5EOpLa6joSAplcfswBPk7g",
  },
  {
    position: 2,
    title: "Урок 2",
    rutube: "https://rutube.ru/video/private/4770992faa1052e59b2a81e664bb8717/?p=2oago8vW-LTbDOQcSCpdmQ",
  },
  {
    position: 3,
    title: "Урок 3",
    rutube: "https://rutube.ru/video/private/add7affcc4107bce00607b0f956f0679/?p=5aMr1X0pEjVAbxldOvGmJA",
  },
  {
    position: 4,
    title: "Урок 4",
    rutube: "https://rutube.ru/video/private/dccc08011b135f0c3dfdb66792986d5d/?p=p7mSP6K0Ol9dQoNoLEXqTw",
  },
  {
    position: 5,
    title: "Урок 5",
    rutube: "https://rutube.ru/video/private/4ff3f259fbfd61ee9d2a18e20fa19f2a/?p=Qpx1OOO3FD5U1Gqfl6mYBQ",
  },
];

async function main() {
  console.log("\n🚀  Создаю курс «Базовый курс риэлтора 2.0»...\n");

  // Найти автора
  const author = await prisma.user.findUnique({
    where: { email: AUTHOR_EMAIL },
    select: { id: true, name: true },
  });

  if (!author) {
    console.error(`❌  Пользователь ${AUTHOR_EMAIL} не найден. Проверь email автора.`);
    process.exit(1);
  }

  console.log(`👤  Автор: ${author.name ?? AUTHOR_EMAIL}`);

  // Создать курс
  const course = await prisma.course.create({
    data: {
      slug: "base-realtor-course-2",
      title: "Базовый курс риэлтора 2.0",
      description: "Полный базовый курс для риэлторов: 28 уроков с видео, аудио, транскрипциями и материалами.",
      status: CourseStatus.DRAFT,
      deliveryFormat: CourseDeliveryFormat.CLASSIC,
      scheduleTimezone: "Europe/Moscow",
      authorId: author.id,
    },
    select: { id: true, slug: true },
  });

  console.log(`✅  Курс создан: ${course.id} (/${course.slug})`);

  // Создать единственный модуль
  const module_ = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Базовый курс риэлтора 2.0",
      position: 1,
    },
    select: { id: true },
  });

  console.log(`✅  Модуль создан: ${module_.id}`);

  // Создать 5 уроков с видео-блоками
  for (const lessonData of LESSONS) {
    const lesson = await prisma.lesson.create({
      data: {
        moduleId: module_.id,
        title: lessonData.title,
        type: LessonType.TEXT,
        position: lessonData.position,
        isPreview: false,
        videoSourceType: MediaSourceType.RUTUBE_EMBED,
        videoUrl: lessonData.rutube,
      },
      select: { id: true },
    });

    // Создать VIDEO блок
    const lessonBlockTx = prisma as typeof prisma & {
      lessonBlock: { create(args: unknown): Promise<unknown> };
    };

    await lessonBlockTx.lessonBlock.create({
      data: {
        lessonId: lesson.id,
        blockKey: `${lesson.id}-video`,
        type: "VIDEO",
        position: 1,
        title: "Видео урока",
        body: "",
        url: null,
        note: null,
        submissionHint: null,
      },
    });

    console.log(`  📹  [${lessonData.position}] «${lessonData.title}» — создан`);
  }

  console.log(`\n🎉  Готово!`);
  console.log(`\n🔗  Управление курсом:`);
  console.log(`    https://academyweb-production-b94b.up.railway.app/admin/courses/${course.id}`);
  console.log(`\n📝  Запиши moduleId для импорта остальных 23 уроков:`);
  console.log(`    courseId:  ${course.id}`);
  console.log(`    moduleId:  ${module_.id}\n`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("❌  Ошибка:", err);
  process.exit(1);
});
