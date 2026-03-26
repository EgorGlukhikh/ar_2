import { BookOpen, Compass, GraduationCap } from "lucide-react";
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
import { WorkspaceCourseCard } from "@/components/workspace/workspace-course-card";
import {
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";

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
        lessons.length === 0 ? 0 : Math.round((completedLessons / lessons.length) * 100);
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

  const averageProgress =
    courseCards.length === 0
      ? 0
      : Math.round(
          courseCards.reduce((sum, course) => sum + course.progressPercent, 0) /
            courseCards.length,
        );

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Учебный кабинет"
        title={isElevated ? "Проверка студенческого контура" : "Мои курсы"}
        description={
          isElevated
            ? "Команда платформы может быстро проверить учебный путь и убедиться, что курс, видео и материалы открываются так, как увидит их студент."
            : "Здесь собраны ваши активные курсы, текущий прогресс и понятный переход к следующему уроку."
        }
        meta={
          <div className="rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            Курсов в кабинете: {courseCards.length}
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
          value={courseCards.length}
          hint="Все программы, доступные в текущем кабинете."
          icon={BookOpen}
        />
        <WorkspaceStatCard
          label="Средний прогресс"
          value={`${averageProgress}%`}
          hint="Средний уровень прохождения по доступным курсам."
          icon={Compass}
        />
        <WorkspaceStatCard
          label="Следующий шаг"
          value={courseCards.find((course) => course.nextLessonTitle) ? "Есть" : "Нет"}
          hint="Показывает, есть ли уже открытый следующий урок для прохождения."
          icon={GraduationCap}
        />
      </div>

      <WorkspacePanel
        eyebrow="Доступные программы"
        title={isElevated ? "Так выглядит учебный контур" : "Ваши активные курсы"}
        description={
          isElevated
            ? "Открывай любой курс и проверяй, как выглядят уроки, блокировки доступа и вложенные материалы."
            : "Карточки ниже показывают прогресс, следующий ориентир и быстрый вход в обучение."
        }
      >
        {courseCards.length === 0 ? (
          <WorkspaceEmptyState
            title="Пока нет доступных курсов"
            description={
              isElevated
                ? "Добавь курс в админке или опубликуй программу, чтобы проверить реальный студенческий сценарий."
                : "Когда администратор выдаст доступ или вы оплатите курс, он появится здесь."
            }
            action={
              <Button asChild>
                <Link href="/catalog">Открыть каталог</Link>
              </Button>
            }
            className="border-[var(--border)] bg-[var(--surface)] shadow-none"
          />
        ) : (
          <div className="grid gap-5">
            {courseCards.map((course) => (
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
                  <>
                    <Button asChild>
                      <Link href={`/learning/courses/${course.id}`}>Открыть курс</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/catalog">Каталог</Link>
                    </Button>
                  </>
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
                  <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                    {course.nextLessonTitle
                      ? `Следующий ориентир: ${course.nextLessonTitle}`
                      : "Курс пока пустой. Добавь уроки в админке, чтобы появился маршрут прохождения."}
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
