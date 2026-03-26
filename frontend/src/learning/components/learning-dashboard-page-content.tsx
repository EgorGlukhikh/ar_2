import Link from "next/link";
import { BookOpen, Compass, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceCourseCard } from "@/components/workspace/workspace-course-card";
import {
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";
import type { LearningDashboardPayload } from "@shared/learning-dashboard/types";

export function LearningDashboardPageContent({
  payload,
}: {
  payload: LearningDashboardPayload;
}) {
  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Учебный кабинет"
        title={payload.isElevated ? "Проверка учебного контура" : "Мои курсы"}
        description={
          payload.isElevated
            ? "Команда платформы быстро проверяет, как курс выглядит со стороны ученика."
            : "Здесь собраны ваши курсы, прогресс и прямой переход к следующему шагу в обучении."
        }
        meta={
          <div className="rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            Курсов в кабинете: {payload.totalCourses}
          </div>
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/catalog">Каталог курсов</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <WorkspaceStatCard
          label="Курсы"
          value={payload.totalCourses}
          hint="Все программы, доступные в текущем кабинете."
          icon={BookOpen}
        />
        <WorkspaceStatCard
          label="Средний прогресс"
          value={`${payload.averageProgress}%`}
          hint="Средний уровень прохождения по доступным курсам."
          icon={Compass}
        />
        <WorkspaceStatCard
          label="Следующий шаг"
          value={payload.hasNextLesson ? "Есть" : "Нет"}
          hint="Показывает, есть ли уже открытый следующий урок."
          icon={GraduationCap}
        />
      </div>

      <WorkspacePanel
        eyebrow="Доступные программы"
        title={payload.isElevated ? "Так выглядит учебный путь" : "Ваши активные курсы"}
        description={
          payload.isElevated
            ? "Открывай любой курс и проверяй уроки, материалы и точки перехода по маршруту."
            : "Карточки ниже показывают прогресс, следующий ориентир и быстрый вход в обучение."
        }
      >
        {payload.courses.length === 0 ? (
          <WorkspaceEmptyState
            title="Пока нет доступных курсов"
            description={
              payload.isElevated
                ? "Добавь курс в рабочем кабинете, чтобы проверить реальный учебный сценарий."
                : "Когда администратор выдаст доступ или вы оплатите курс, он появится здесь."
            }
            illustrationKind={payload.isElevated ? "designProcess" : "bookReading"}
            action={
              <Button asChild>
                <Link href="/catalog">Открыть каталог</Link>
              </Button>
            }
            className="border-[var(--border)] bg-[var(--surface)] shadow-none"
          />
        ) : (
          <div className="grid gap-5">
            {payload.courses.map((course) => (
              <WorkspaceCourseCard
                key={course.id}
                title={course.title}
                slug={course.slug}
                description={course.description}
                badges={
                  <>
                    <Badge variant={course.statusVariant}>{course.statusLabel}</Badge>
                    <Badge variant="neutral">Уроков {course.lessonCount}</Badge>
                  </>
                }
                actions={
                  <Button asChild>
                    <Link href={`/learning/courses/${course.id}`}>Открыть курс</Link>
                  </Button>
                }
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                    <span>Прогресс</span>
                    <span>
                      {course.completedLessons} / {course.lessonCount}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--primary-soft)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-all"
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                    {course.nextLessonTitle
                      ? `Следующий ориентир: ${course.nextLessonTitle}`
                      : "Курс пока пустой. Когда в программе появятся уроки, здесь появится учебный маршрут."}
                  </div>
                </div>
              </WorkspaceCourseCard>
            ))}
          </div>
        )}
      </WorkspacePanel>
    </section>
  );
}

