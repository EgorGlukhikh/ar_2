import Link from "next/link";
import { PlusCircle } from "lucide-react";

import type { AdminCoursesPayload } from "@shared/admin-courses/types";

import { Button } from "@/components/ui/button";
import { WorkspaceEmptyState, WorkspacePageHeader, WorkspacePanel } from "@/components/workspace/workspace-primitives";
import { AdminCoursesBrowser } from "@/features/admin/components/admin-courses-browser";

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
            ? "Здесь автор видит свои программы по темам и тегам, быстро открывает карточку курса и рабочую структуру."
            : "Здесь команда управляет курсами как каталогом: раскладывает их по темам, тегам, доступам и публикации."
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
              ? "Создай первый курс и сразу переходи к программе: внутри можно собирать модули, уроки, материалы, темы и теги."
              : "Создай первую программу, затем открой ее структуру и собери модули, уроки, материалы и рабочую таксономию."
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
        <AdminCoursesBrowser payload={payload} />
      )}

      {payload.courses.length > 0 && payload.canCreateCourse ? (
        <WorkspacePanel
          eyebrow="Быстрое действие"
          title="Нужен еще один курс?"
          description={
            payload.isAuthorMode
              ? "Создай отдельную программу под новый поток или продукт, а не смешивай материалы внутри одного курса."
              : "Если методисты запускают новую программу, лучше сразу заводить отдельный курс и помечать его темой и тегами."
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
