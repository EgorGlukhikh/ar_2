import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { requireAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdminUser();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f9ff_0%,_#f1f5ff_100%)] px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="space-y-5">
            <div className="rounded-2xl bg-[var(--primary-soft)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Академия риэлторов
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Админский контур
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {user.email}
              </p>
            </div>

            <AdminNav />

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Права администратора
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Управление курсами, модулями, уроками, студентами и базовыми
                настройками обучения.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild variant="outline">
                <Link href="/">Открыть портал</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/learning">Открыть учебный кабинет</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
