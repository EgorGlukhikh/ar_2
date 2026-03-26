import { CourseStatus, EnrollmentStatus, prisma } from "@academy/db";

const courseStatusLabelMap = {
  DRAFT: "Черновик",
  PUBLISHED: "Опубликован",
  ARCHIVED: "Архив",
} as const;

const courseStatusVariantMap = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  ARCHIVED: "warning",
} as const;

const enrollmentStatusLabelMap = {
  ACTIVE: "Активен",
  COMPLETED: "Завершен",
  EXPIRED: "Истек",
  CANCELED: "Отменен",
} as const;

const enrollmentStatusVariantMap = {
  ACTIVE: "default",
  COMPLETED: "success",
  EXPIRED: "warning",
  CANCELED: "warning",
} as const;

export async function getElevatedLearningDashboardSnapshot() {
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
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return courses.map((course) => {
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
}

export async function getStudentLearningDashboardSnapshot(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
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
                      userId,
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

  return enrollments.map((enrollment) => {
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
