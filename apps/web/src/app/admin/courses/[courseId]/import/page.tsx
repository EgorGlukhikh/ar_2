import { notFound } from "next/navigation";

import { prisma } from "@academy/db";

import { LessonImportTable } from "@frontend/admin/components/lesson-import-table";

import {
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/workspace/workspace-primitives";
import { requireCourseCreator } from "@/lib/admin";

type ImportPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function ImportLessonsPage({ params }: ImportPageProps) {
  const { courseId } = await params;

  await requireCourseCreator();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      modules: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          _count: { select: { lessons: true } },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const firstModule = course.modules[0];

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Импорт уроков"
        title="Массовое добавление уроков"
        description="Заполни таблицу: каждая строка станет отдельным уроком. Достаточно названия и Rutube-ссылки. Аудио и файл можно добавить позже через редактор урока."
      />

      {course.modules.length === 0 ? (
        <WorkspaceEmptyState
          title="Сначала нужен хотя бы один модуль"
          description="Создай первый модуль в разделе «Программа», и после этого здесь можно будет импортировать уроки пакетно."
        />
      ) : (
        <div className="space-y-6">
          {course.modules.length > 1 ? (
            <div className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              В курсе несколько модулей. Уроки добавятся в первый модуль:
              {" "}
              <span className="font-semibold">«{firstModule?.title}»</span>.
              Чтобы импортировать в другой модуль, сначала упрости структуру или
              потом перемести уроки вручную.
            </div>
          ) : null}

          <WorkspacePanel
            eyebrow={`Модуль: ${firstModule?.title ?? "не выбран"}`}
            title="Таблица импорта"
            description={`Уже в модуле: ${firstModule?._count.lessons ?? 0} уроков.`}
          >
            <LessonImportTable courseId={courseId} moduleId={firstModule?.id ?? ""} />
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Подсказки"
            title="Как подготовить строки"
            description="Несколько правил, чтобы импорт сработал без ручной чистки."
          >
            <ul className="space-y-2 text-sm leading-7 text-[var(--muted)]">
              <li>
                <span className="font-medium text-[var(--foreground)]">Rutube URL</span>:
                вставляй полную ссылку, включая параметр <code className="text-xs">?p=...</code>
                {" "}для приватных видео.
              </li>
              <li>
                <span className="font-medium text-[var(--foreground)]">Аудио URL</span>:
                прямая ссылка на MP3.
              </li>
              <li>
                <span className="font-medium text-[var(--foreground)]">Файл (PDF)</span>:
                ссылка на презентацию в Яндекс Диске или Google Drive.
              </li>
              <li>Пустые строки без названия и ссылки будут пропущены.</li>
              <li>После импорта каждый урок можно донастроить отдельно в «Программе».</li>
            </ul>
          </WorkspacePanel>
        </div>
      )}
    </section>
  );
}
