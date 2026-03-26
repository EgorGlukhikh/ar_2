import Link from "next/link";
import { BookOpen, LayoutTemplate, PlusCircle, WalletCards } from "lucide-react";

import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceCourseCard } from "@/components/workspace/workspace-course-card";
import {
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/workspace/workspace-primitives";
import { canCreateCourses } from "@/lib/admin";
import { courseStatusLabelMap, courseStatusVariantMap } from "@/lib/labels";
import { requireAdminViewer } from "@/lib/viewer";

export default async function CoursesPage() {
  const viewer = await requireAdminViewer();
  const isAuthorMode = viewer.effectiveRole === USER_ROLES.AUTHOR;
  const isAdminMode = viewer.effectiveRole === USER_ROLES.ADMIN;
  const canCreateCourse = canCreateCourses({
    ...viewer.user,
    role: viewer.effectiveRole,
  });

  const courses = await prisma.course.findMany({
    where: isAuthorMode ? { authorId: viewer.user.id } : undefined,
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      modules: {
        select: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
    },
  });

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow={isAuthorMode ? "Мои курсы" : "Каталог курсов"}
        title={isAuthorMode ? "Программы автора" : "Все программы академии"}
        description={
          isAuthorMode
            ? "Здесь автор создает свои программы, открывает структуру курса и наполняет уроки контентом."
            : "Здесь создаются новые курсы и открываются их рабочие разделы: карточка, программа, доступы и продажи."
        }
        meta={
          <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            Всего курсов: {courses.length}
          </div>
        }
        actions={
          canCreateCourse ? (
            <Button asChild>
              <Link href="/admin/courses/new">
                {isAuthorMode ? "Создать курс" : "Новый курс"}
              </Link>
            </Button>
          ) : undefined
        }
      />

      {courses.length === 0 ? (
        <WorkspaceEmptyState
          title={isAuthorMode ? "Пока нет ваших курсов" : "Пока нет ни одного курса"}
          description={
            isAuthorMode
              ? "Создай первый курс и сразу переходи к программе: внутри можно собирать модули, уроки и материалы."
              : "Создай первую программу, затем открой вкладку «Программа» и собери внутри нее модули, уроки и материалы."
          }
          action={
            canCreateCourse ? (
              <Button asChild>
                <Link href="/admin/courses/new">Создать курс</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-5">
          {courses.map((course) => {
            const lessonCount = course.modules.reduce(
              (sum, module) => sum + module._count.lessons,
              0,
            );

            return (
              <WorkspaceCourseCard
                key={course.id}
                title={course.title}
                slug={course.slug}
                description={course.description}
                badges={
                  <>
                    <Badge variant={courseStatusVariantMap[course.status]}>
                      {courseStatusLabelMap[course.status]}
                    </Badge>
                    <Badge variant="neutral">Модулей {course._count.modules}</Badge>
                    <Badge variant="neutral">Уроков {lessonCount}</Badge>
                    {isAdminMode ? (
                      <Badge variant="neutral">Зачислений {course._count.enrollments}</Badge>
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
                        {isAuthorMode ? "Карточка курса" : "Настройки"}
                      </Link>
                    </Button>
                    {isAdminMode ? (
                      <Button asChild variant="outline">
                        <Link href={`/admin/courses/${course.id}/access`}>Доступ и продажи</Link>
                      </Button>
                    ) : null}
                  </>
                }
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
                    <LayoutTemplate className="h-4 w-4 text-[var(--primary)]" />
                    <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Карточка</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Название, описание и статус.
                    </p>
                  </div>
                  <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
                    <BookOpen className="h-4 w-4 text-[var(--primary)]" />
                    <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Программа</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Модули, уроки и контент.
                    </p>
                  </div>
                  {isAdminMode ? (
                    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
                      <WalletCards className="h-4 w-4 text-[var(--primary)]" />
                      <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Продажи</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        Цена, доступ и выдача курса.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
                      <BookOpen className="h-4 w-4 text-[var(--primary)]" />
                      <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Наполнение</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        Собирай программу без коммерческих показателей.
                      </p>
                    </div>
                  )}
                </div>

                {course.author ? (
                  <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--muted)]">
                    Автор:{" "}
                    <span className="font-medium text-[var(--foreground)]">
                      {course.author.name || course.author.email}
                    </span>
                  </div>
                ) : null}
              </WorkspaceCourseCard>
            );
          })}
        </div>
      )}

      {courses.length > 0 && canCreateCourse ? (
        <WorkspacePanel
          eyebrow="Быстрое действие"
          title="Нужен еще один курс?"
          description={
            isAuthorMode
              ? "Создай отдельную программу под новый поток или продукт, а не смешивай материалы в одном курсе."
              : "Если методисты начинают новую программу, лучше сразу заводить отдельный курс, а не смешивать материалы внутри существующего."
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
