import { CourseStatus, EnrollmentStatus, prisma } from "@academy/db";
import Link from "next/link";

import {
  courseStatusLabelMap,
  courseStatusVariantMap,
  enrollmentStatusLabelMap,
  enrollmentStatusVariantMap,
} from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isElevatedUserRole, requireStudentOrElevatedUser } from "@/lib/user";

type CourseCard = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  statusLabel: string;
  statusVariant: "default" | "neutral" | "success" | "warning";
  lessonCount: number;
  completedLessons: number;
  progressPercent: number;
  nextLessonTitle: string | null;
};

export default async function LearningDashboardPage() {
  const user = await requireStudentOrElevatedUser();
  const isElevated = isElevatedUserRole(user.role);

  let courseCards: CourseCard[] = [];

  if (isElevated) {
    const courses = await prisma.course.findMany({
      where: {
        status: {
          not: CourseStatus.ARCHIVED,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        modules: {
          orderBy: {
            position: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
    });

    courseCards = courses.map((course) => {
      const lessons = course.modules.flatMap((module) => module.lessons);

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        statusLabel: courseStatusLabelMap[course.status],
        statusVariant: courseStatusVariantMap[course.status],
        lessonCount: lessons.length,
        completedLessons: 0,
        progressPercent: 0,
        nextLessonTitle: lessons[0]?.title ?? null,
      };
    });
  } else {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: {
          not: EnrollmentStatus.CANCELED,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        course: {
          include: {
            modules: {
              orderBy: {
                position: "asc",
              },
              include: {
                lessons: {
                  orderBy: {
                    position: "asc",
                  },
                  include: {
                    progress: {
                      where: {
                        userId: user.id,
                      },
                      select: {
                        completedAt: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    courseCards = enrollments.map((enrollment) => {
      const lessons = enrollment.course.modules.flatMap((module) => module.lessons);
      const completedLessons = lessons.filter((lesson) =>
        lesson.progress.some((progress) => Boolean(progress.completedAt)),
      ).length;
      const progressPercent =
        lessons.length === 0
          ? 0
          : Math.round((completedLessons / lessons.length) * 100);
      const nextLesson =
        lessons.find(
          (lesson) => !lesson.progress.some((progress) => Boolean(progress.completedAt)),
        ) ?? null;

      return {
        id: enrollment.course.id,
        title: enrollment.course.title,
        slug: enrollment.course.slug,
        description: enrollment.course.description,
        statusLabel: enrollmentStatusLabelMap[enrollment.status],
        statusVariant: enrollmentStatusVariantMap[enrollment.status],
        lessonCount: lessons.length,
        completedLessons,
        progressPercent,
        nextLessonTitle: nextLesson?.title ?? null,
      };
    });
  }

  return (
    <section className="space-y-6">
      <header className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Учебный кабинет
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              {isElevated ? "Просмотр курсов" : "Мои курсы"}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
              {isElevated
                ? "Команда платформы может быстро проверить учебный контур без отдельной студенческой учетной записи."
                : "Здесь видны активные курсы, текущий прогресс и быстрый переход к следующему уроку."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-full bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
              Курсов: {courseCards.length}
            </div>
            <Button asChild variant="outline">
              <Link href="/catalog">Каталог курсов</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        {courseCards.length === 0 ? (
          <article className="rounded-[24px] border border-dashed border-[var(--border)] bg-white p-8 shadow-sm xl:col-span-2">
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Пока нет доступных курсов
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {isElevated
                ? "Добавь курс в админке или открой каталог, чтобы проверить сценарий покупки."
                : "Когда администратор выдаст доступ или ты оплатишь курс, он появится на этом экране."}
            </p>
          </article>
        ) : (
          courseCards.map((course) => (
            <article
              key={course.id}
              className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={course.statusVariant}>{course.statusLabel}</Badge>
                <Badge variant="neutral">Уроков {course.lessonCount}</Badge>
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {course.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">/{course.slug}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {course.description || "Описание курса пока не заполнено."}
              </p>

              <div className="mt-6 space-y-3">
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
              </div>

              <div className="mt-5 rounded-2xl bg-[var(--surface)] p-4 text-sm leading-7 text-[var(--muted)]">
                {course.nextLessonTitle
                  ? `Следующий ориентир: ${course.nextLessonTitle}`
                  : "Курс пока пустой. Добавь в него уроки в админке."}
              </div>

              <div className="mt-6">
                <Button asChild>
                  <Link href={`/learning/courses/${course.id}`}>Открыть курс</Link>
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
