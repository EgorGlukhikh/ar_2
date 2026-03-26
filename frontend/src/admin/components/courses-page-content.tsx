import Link from "next/link";
import { BookOpen, LayoutTemplate, PlusCircle, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceCourseCard } from "@/components/workspace/workspace-course-card";
import {
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/workspace/workspace-primitives";
import type { AdminCoursesPayload } from "@shared/admin-courses/types";

export function CoursesPageContent({
  payload,
}: {
  payload: AdminCoursesPayload;
}) {
  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow={payload.isAuthorMode ? "Мои курсы" : "Каталог курсов"}
        title={payload.isAuthorMode ? "Программы автора" : "Все программы академии"}
        description={
          payload.isAuthorMode
            ? "Здесь автор открывает свои программы, собирает структуру курса и наполняет уроки."
            : "Здесь команда управляет курсами, карточками программ, доступами и публикацией."
        }
        meta={
          <div className="rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            Всего курсов: {payload.totalCourses}
          </div>
        }
        actions={
          payload.canCreateCourse ? (
            <Button asChild>
              <Link href="/admin/courses/new">
                {payload.isAuthorMode ? "Создать курс" : "Новый курс"}
              </Link>
            </Button>
          ) : undefined
        }
      />

      {payload.courses.length === 0 ? (
        <WorkspaceEmptyState
          title={payload.isAuthorMode ? "Пока нет ваших курсов" : "Пока нет ни одного курса"}
          description={
            payload.isAuthorMode
              ? "Создай первый курс и сразу переходи к программе: внутри можно собирать модули, уроки и материалы."
              : "Создай первую программу, затем открой ее структуру и собери модули, уроки и материалы."
          }
          illustrationKind={payload.isAuthorMode ? "thoughtProcess" : "designProcess"}
          action={
            payload.canCreateCourse ? (
              <Button asChild>
                <Link href="/admin/courses/new">Создать курс</Link>
              </Button>
            ) : undefined
          }
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
                  <Badge variant="neutral">Модулей {course.moduleCount}</Badge>
                  <Badge variant="neutral">Уроков {course.lessonCount}</Badge>
                  {payload.isAdminMode ? (
                    <Badge variant="neutral">Зачислений {course.enrollmentCount}</Badge>
                  ) : null}
                </>
              }
              actions={
                <>
                  <Button asChild>
                    <Link href={`/admin/courses/${course.id}/content`}>Открыть программу</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/admin/courses/${course.id}`}>
                      {payload.isAuthorMode ? "Карточка курса" : "Настройки"}
                    </Link>
                  </Button>
                  {payload.isAdminMode ? (
                    <Button asChild variant="outline">
                      <Link href={`/admin/courses/${course.id}/access`}>Доступ и продажи</Link>
                    </Button>
                  ) : null}
                </>
              }
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
                  <LayoutTemplate className="h-4 w-4 text-[var(--primary)]" />
                  <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Карточка</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Название, описание и статус.
                  </p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
                  <BookOpen className="h-4 w-4 text-[var(--primary)]" />
                  <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Программа</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Модули, уроки и контент.
                  </p>
                </div>
                {payload.isAdminMode ? (
                  <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
                    <WalletCards className="h-4 w-4 text-[var(--primary)]" />
                    <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Доступы</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Цена, выдача курса и сценарии доступа.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
                    <BookOpen className="h-4 w-4 text-[var(--primary)]" />
                    <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Наполнение</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Автор работает только с контентом и структурой курса.
                    </p>
                  </div>
                )}
              </div>

              {course.authorLabel ? (
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--muted)]">
                  Автор:{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {course.authorLabel}
                  </span>
                </div>
              ) : null}
            </WorkspaceCourseCard>
          ))}
        </div>
      )}

      {payload.courses.length > 0 && payload.canCreateCourse ? (
        <WorkspacePanel
          eyebrow="Быстрое действие"
          title="Нужен еще один курс?"
          description={
            payload.isAuthorMode
              ? "Создай отдельную программу под новый поток или продукт, а не смешивай материалы внутри одного курса."
              : "Если методисты запускают новую программу, лучше сразу заводить отдельный курс."
          }
          actions={
            <Button asChild>
              <Link href="/admin/courses/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Создать курс
              </Link>
            </Button>
          }
        />
      ) : null}
    </section>
  );
}

