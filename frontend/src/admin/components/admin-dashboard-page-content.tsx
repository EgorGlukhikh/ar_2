"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/workspace/workspace-primitives";
import type { AdminDashboardPayload } from "@shared/admin-dashboard/types";

import { AdminStatCard } from "./admin-stat-card";

const STAT_CONFIG = [
  {
    icon: Users,
    href: "/admin/users",
    accentColor: "#4f46e5",
    accentBg: "#eef2ff",
  },
  {
    icon: UserCheck,
    href: "/admin/users",
    accentColor: "#7c3aed",
    accentBg: "#f5f3ff",
  },
  {
    icon: BookOpen,
    href: "/admin/courses",
    accentColor: "#059669",
    accentBg: "#ecfdf5",
  },
  {
    icon: Users,
    href: "/admin/users",
    accentColor: "#d97706",
    accentBg: "#fffbeb",
  },
  {
    icon: CreditCard,
    href: null,
    accentColor: "#ea580c",
    accentBg: "#fff7ed",
  },
  {
    icon: TrendingUp,
    href: null,
    accentColor: "#0d9488",
    accentBg: "#f0fdfa",
  },
] as const;

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
        description="Пользователи, курсы, доступы и оплаты."
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
          const cfg = STAT_CONFIG[index] ?? {
            icon: BarChart3,
            href: null,
            accentColor: "var(--primary)",
            accentBg: "var(--primary-soft)",
          };

          return (
            <AdminStatCard
              key={item.label}
              label={item.label}
              value={item.value}
              hint={item.hint}
              icon={cfg.icon}
              href={cfg.href}
              accentColor={cfg.accentColor}
              accentBg={cfg.accentBg}
            />
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <WorkspacePanel eyebrow="Оплаты" title="Динамика по дням">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-strong)] p-5">
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
              <div className="flex min-h-52 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-8 text-center text-sm leading-7 text-[var(--muted)]">
                За выбранный период еще нет оплат. Как только появятся данные, график заполнится автоматически.
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
        <WorkspacePanel eyebrow="Последние оплаты" title="Свежие заказы">
          <div className="space-y-3">
            {payload.recentOrders.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                Оплат пока нет.
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
