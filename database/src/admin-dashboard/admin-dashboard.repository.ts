import { OrderStatus, PaymentProviderType, prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

const roleLabelMap = {
  ADMIN: "Администраторы",
  AUTHOR: "Авторы",
  CURATOR: "Кураторы",
  SALES_MANAGER: "Продажи",
  STUDENT: "Студенты",
} as const;

const orderStatusLabelMap = {
  DRAFT: "Черновик",
  PENDING: "Ожидает",
  PAID: "Оплачен",
  CANCELED: "Отменен",
  REFUNDED: "Возврат",
} as const;

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: Date) {
  return dateFormatter.format(value);
}

export async function getAdminDashboardSnapshot() {
  const [
    totalUsers,
    studentCount,
    publishedCourses,
    enrollmentCount,
    paidDemoOrders,
    recentOrders,
    recentUsers,
    roleCounts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        role: USER_ROLES.STUDENT,
      },
    }),
    prisma.course.count({
      where: {
        status: "PUBLISHED",
      },
    }),
    prisma.enrollment.count(),
    prisma.order.findMany({
      where: {
        paymentProvider: PaymentProviderType.DEMO,
        status: OrderStatus.PAID,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        totalAmount: true,
        currency: true,
      },
    }),
    prisma.order.findMany({
      where: {
        paymentProvider: PaymentProviderType.DEMO,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          take: 1,
          include: {
            product: {
              select: {
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    }),
  ]);

  const demoRevenue = paidDemoOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );

  const demoRevenueSeries = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));

    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const dayAmount = paidDemoOrders
      .filter((order) => order.createdAt >= day && order.createdAt < nextDay)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      label: new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      }).format(day),
      amount: dayAmount,
    };
  });

  return {
    totals: {
      totalUsers,
      studentCount,
      publishedCourses,
      enrollmentCount,
      demoRevenue,
      demoPaymentsCount: paidDemoOrders.length,
    },
    roleShare: roleCounts.map((item) => ({
      label: roleLabelMap[item.role],
      value: item._count.role,
    })),
    demoRevenueSeries,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      createdAtLabel: formatDate(order.createdAt),
      studentName:
        order.user?.name || order.user?.email || "Пользователь не указан",
      courseTitle: order.items[0]?.product.course?.title || "Курс не указан",
      amount: order.totalAmount,
      currency: order.currency,
      statusLabel: orderStatusLabelMap[order.status],
    })),
    recentUsers: recentUsers.map((user) => ({
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      roleLabel: roleLabelMap[user.role],
      createdAtLabel: formatDate(user.createdAt),
    })),
  };
}
