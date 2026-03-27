import { notFound } from "next/navigation";
import { prisma } from "@academy/db";

import { LessonImportTable } from "@frontend/admin/components/lesson-import-table";
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
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Импорт уроков
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Массовое добавление уроков
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Заполни таблицу — каждая строка станет отдельным уроком. Достаточно названия и Rutube-ссылки.
          Аудио и файл (PDF) можно добавить позже через редактор урока.
        </p>
      </div>

      {/* Module selector */}
      {course.modules.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
          Сначала создай хотя бы один модуль в разделе «Программа».
        </div>
      ) : (
        <div className="space-y-6">
          {course.modules.length > 1 ? (
            <div className="rounded-[var(--radius-xl)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              В курсе несколько модулей. Уроки добавятся в первый модуль —{" "}
              <span className="font-semibold">«{firstModule?.title}»</span>.
              Чтобы импортировать в другой модуль, удали лишние перед импортом или перемести уроки вручную.
            </div>
          ) : null}

          {/* Import table */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Модуль: {firstModule?.title}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Уже в модуле: {firstModule?._count.lessons ?? 0} уроков
                </p>
              </div>
            </div>

            <LessonImportTable courseId={courseId} moduleId={firstModule?.id ?? ""} />
          </div>

          {/* Tips */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-semibold text-[var(--foreground)]">Подсказки</p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
              <li>• <span className="font-medium text-[var(--foreground)]">Rutube URL</span> — вставляй полную ссылку включая параметр <code className="text-xs">?p=...</code> для приватных видео</li>
              <li>• <span className="font-medium text-[var(--foreground)]">Аудио URL</span> — прямая ссылка на MP3 (Яндекс Диск → «Поделиться» → прямая ссылка)</li>
              <li>• <span className="font-medium text-[var(--foreground)]">Файл (PDF)</span> — ссылка на презентацию на Яндекс Диске или Google Drive</li>
              <li>• Пустые строки (без названия и ссылки) будут пропущены</li>
              <li>• После импорта можно отредактировать каждый урок отдельно в «Программе»</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
