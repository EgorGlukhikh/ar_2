import Link from "next/link";

import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { courseStatusLabelMap, courseStatusVariantMap } from "@/lib/labels";

export default async function AdminPage() {
  const [courseCount, studentCount, enrollmentCount, progressCount, recentCourses] =
    await Promise.all([
      prisma.course.count(),
      prisma.user.count({
        where: {
          role: USER_ROLES.STUDENT,
        },
      }),
      prisma.enrollment.count(),
      prisma.lessonProgress.count(),
      prisma.course.findMany({
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
        include: {
          _count: {
            select: {
              modules: true,
              enrollments: true,
            },
          },
        },
      }),
    ]);

  const stats = [
    {
      label: "Курсы",
      value: courseCount,
      hint: "Управление программами, модулями и уроками.",
    },
    {
      label: "Студенты",
      value: studentCount,
      hint: "Пользователи с ролью student и доступом к обучению.",
    },
    {
      label: "Зачисления",
      value: enrollmentCount,
      hint: "Активные и завершенные прохождения по курсам.",
    },
    {
      label: "Активности",
      value: progressCount,
      hint: "Прогресс уроков, который админ может контролировать и сбрасывать.",
    },
  ];

  return (
    <section className="space-y-6">
      <header className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Обзор платформы
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              Панель администратора
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
              Здесь собран рабочий центр платформы: создание курсов, модулей,
              уроков, управление студентами и доступами. Следующие блоки поверх
              этого контура — видео, оплаты и домашние задания.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/courses/new">Создать курс</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/courses">Открыть все курсы</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
              {item.label}
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              {item.value}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.hint}</p>
          </article>
        ))}
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Последние курсы
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Быстрый вход в управление контентом
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/courses">Все курсы</Link>
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {recentCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-sm leading-7 text-[var(--muted)]">
                Курсов пока нет. Начни с первого курса, затем добавь в него
                модули и уроки.
              </div>
            ) : (
              recentCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/admin/courses/${course.id}`}
                  className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--primary)] hover:bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {course.title}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        /{course.slug}
                      </p>
                    </div>
                    <Badge variant={courseStatusVariantMap[course.status]}>
                      {courseStatusLabelMap[course.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                    <span>Модулей: {course._count.modules}</span>
                    <span>Зачислений: {course._count.enrollments}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Контур развития
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Что еще усиливает продукт
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-[var(--muted)]">
            <li>Видео, проверка воспроизведения и импорт материалов.</li>
            <li>Роли авторов, кураторов и менеджеров.</li>
            <li>Домашние задания и сценарии проверки.</li>
            <li>Реальные платежи и webhook-статусы.</li>
            <li>Операционный контроль прогресса и продаж.</li>
          </ul>
        </article>
      </section>
    </section>
  );
}
