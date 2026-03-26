import { OrderStatus, PaymentProviderType, prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

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

function getCourseLessonCount(modules: Array<{ lessons: unknown[] }>) {
  return modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

export async function getAdminCourseAccessSnapshot(courseId: string) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      enrollments: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              progress: {
                where: {
                  completedAt: {
                    not: null,
                  },
                  lesson: {
                    module: {
                      courseId,
                    },
                  },
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      modules: {
        select: {
          lessons: {
            select: {
              id: true,
            },
          },
        },
      },
      products: {
        include: {
          prices: {
            where: {
              isDefault: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        take: 1,
      },
    },
  });

  if (!course) {
    return null;
  }

  const [availableStudents, paidOrders] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: USER_ROLES.STUDENT,
        enrollments: {
          none: {
            courseId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    }),
    prisma.order.findMany({
      where: {
        status: OrderStatus.PAID,
        paymentProvider: PaymentProviderType.DEMO,
        userId: {
          not: null,
        },
        items: {
          some: {
            product: {
              courseId,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        userId: true,
      },
    }),
  ]);

  const paidUserIds = new Set(
    paidOrders
      .map((order) => order.userId)
      .filter((userId): userId is string => Boolean(userId)),
  );

  return {
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
    },
    lessonCount: getCourseLessonCount(course.modules),
    enrollmentCount: course.enrollments.length,
    offer: {
      isActive: course.products[0]?.isActive ?? false,
      priceAmount: course.products[0]?.prices[0]?.amount ?? null,
      currency: course.products[0]?.prices[0]?.currency ?? null,
    },
    availableStudents: availableStudents.map((student) => ({
      id: student.id,
      label: student.name
        ? `${student.name} · ${student.email}`
        : student.email,
    })),
    enrollments: course.enrollments.map((enrollment) => ({
      id: enrollment.id,
      userId: enrollment.user.id,
      studentName: enrollment.user.name || enrollment.user.email,
      email: enrollment.user.email,
      statusLabel: enrollmentStatusLabelMap[enrollment.status],
      statusVariant: enrollmentStatusVariantMap[enrollment.status],
      completedLessons: enrollment.user.progress.length,
      accessSourceLabel: paidUserIds.has(enrollment.user.id)
        ? "Демо-оплата"
        : "Бесплатно или вручную",
    })),
  };
}
