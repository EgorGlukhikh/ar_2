import type { AdminDashboardPayload } from "@shared/admin-dashboard/types";

import { getAdminDashboardSnapshot } from "@database/admin-dashboard/admin-dashboard.repository";

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export async function getAdminDashboardPayload(): Promise<AdminDashboardPayload> {
  const snapshot = await getAdminDashboardSnapshot();

  return {
    stats: [
      {
        label: "Пользователи",
        value: String(snapshot.totals.totalUsers),
        hint: "Все зарегистрированные аккаунты платформы.",
      },
      {
        label: "Студенты",
        value: String(snapshot.totals.studentCount),
        hint: "Аккаунты, которые учатся на курсах.",
      },
      {
        label: "Опубликованные курсы",
        value: String(snapshot.totals.publishedCourses),
        hint: "Программы, которые уже видны в каталоге.",
      },
      {
        label: "Зачисления",
        value: String(snapshot.totals.enrollmentCount),
        hint: "Все выданные доступы к курсам.",
      },
      {
        label: "Демо-оплаты",
        value: String(snapshot.totals.demoPaymentsCount),
        hint: "Временный платежный контур для управленческих проверок.",
      },
      {
        label: "Демо-выручка",
        value: formatAmount(snapshot.totals.demoRevenue, "RUB"),
        hint: "Сумма только по демонстрационным оплатам.",
      },
    ],
    roleShare: snapshot.roleShare,
    demoRevenueSeries: snapshot.demoRevenueSeries,
    recentOrders: snapshot.recentOrders.map((order) => ({
      ...order,
      amountLabel: formatAmount(order.amount, order.currency),
    })),
    recentUsers: snapshot.recentUsers,
  };
}
