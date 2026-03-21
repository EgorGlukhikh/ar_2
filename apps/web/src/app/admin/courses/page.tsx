import Link from "next/link";

import { prisma } from "@academy/db";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  courseStatusLabelMap,
  courseStatusVariantMap,
} from "@/lib/labels";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
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
      <header className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Каталог курсов
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
            Курсы
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
            Здесь создаются курсы и открываются их рабочие разделы: настройки,
            программа, доступы и продажи.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/courses/new">Новый курс</Link>
        </Button>
      </header>

      <div className="grid gap-4">
        {courses.length === 0 ? (
          <article className="rounded-[24px] border border-dashed border-[var(--border)] bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Пока нет ни одного курса
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Создай первый курс, затем открой вкладку программы и собери внутри
              него модули и уроки.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/admin/courses/new">Создать курс</Link>
              </Button>
            </div>
          </article>
        ) : (
          courses.map((course) => {
            const lessonCount = course.modules.reduce(
              (sum, module) => sum + module._count.lessons,
              0,
            );

            return (
              <article
                key={course.id}
                className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                        {course.title}
                      </h2>
                      <Badge variant={courseStatusVariantMap[course.status]}>
                        {courseStatusLabelMap[course.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--muted)]">/{course.slug}</p>
                    <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
                      {course.description || "Описание курса пока не заполнено."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href={`/admin/courses/${course.id}`}>Настройки</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/admin/courses/${course.id}/content`}>
                        Программа
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                  <span className="rounded-full bg-[var(--surface)] px-3 py-2">
                    Модулей: {course._count.modules}
                  </span>
                  <span className="rounded-full bg-[var(--surface)] px-3 py-2">
                    Уроков: {lessonCount}
                  </span>
                  <span className="rounded-full bg-[var(--surface)] px-3 py-2">
                    Зачислений: {course._count.enrollments}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
