import Link from "next/link";
import { BarChart3, CreditCard, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";
import type { AdminDashboardPayload } from "@shared/admin-dashboard/types";

const dashboardIcons = [Users, Users, BarChart3, Users, CreditCard, CreditCard];

export function AdminDashboardPageContent({
  payload,
}: {
  payload: AdminDashboardPayload;
}) {
  const hasRevenueData = payload.demoRevenueSeries.some((item) => item.amount > 0);
  const maxAmount = Math.max(
    ...payload.demoRevenueSeries.map((item) => item.amount),
    1,
  );

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Панель"
        title="Операционный дашборд"
        description="Пользователи, курсы, доступы и демонстрационные оплаты."
        actions={
          <>
            <Button asChild>
              <Link href="/admin/courses/new">Новый курс</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/users">Пользователи</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {payload.stats.map((item, index) => {
          const Icon = dashboardIcons[index] ?? BarChart3;

          return (
            <WorkspaceStatCard
              key={item.label}
              label={item.label}
              value={item.value}
              hint={item.hint}
              icon={Icon}
            />
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <WorkspacePanel eyebrow="Демо-оплаты" title="Динамика по дням">
          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] p-5">
            {hasRevenueData ? (
              <div className="flex h-52 items-end gap-3">
                {payload.demoRevenueSeries.map((point) => (
                  <div
                    key={point.label}
                    className="flex min-w-0 flex-1 flex-col items-center gap-3"
                  >
                    <div className="flex h-40 w-full items-end">
                      <div
                        className="w-full rounded-t-[14px] bg-[var(--primary)]"
                        style={{
                          height: `${Math.max(
                            14,
                            Math.round((point.amount / maxAmount) * 100),
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-center text-xs font-medium text-[var(--muted)]">
                      {point.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-52 items-center justify-center rounded-[16px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-8 text-center text-sm leading-7 text-[var(--muted)]">
                За выбранный период еще нет демо-оплат. Как только появятся данные, график заполнится автоматически.
              </div>
            )}
          </div>
        </WorkspacePanel>

        <WorkspacePanel eyebrow="Роли" title="Распределение по системе">
          <div className="grid gap-3">
            {payload.roleShare.map((item) => (
              <div
                key={item.label}
                className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--muted)]">{item.label}</span>
                  <span className="text-lg font-semibold text-[var(--foreground)]">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkspacePanel eyebrow="Последние оплаты" title="Свежие демо-заказы">
          <div className="space-y-3">
            {payload.recentOrders.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                Демо-оплат пока нет.
              </div>
            ) : (
              payload.recentOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {order.courseTitle}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {order.studentName} • {order.createdAtLabel}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral">{order.amountLabel}</Badge>
                      <Badge variant="success">{order.statusLabel}</Badge>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </WorkspacePanel>

        <WorkspacePanel eyebrow="Новые пользователи" title="Последние регистрации">
          <div className="space-y-3">
            {payload.recentUsers.map((user) => (
              <article
                key={user.id}
                className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{user.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {user.email} • {user.createdAtLabel}
                    </p>
                  </div>
                  <Badge variant="neutral">{user.roleLabel}</Badge>
                </div>
              </article>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </section>
  );
}
