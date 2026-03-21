import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { LearningNav } from "@/components/learning/learning-nav";
import { Button } from "@/components/ui/button";
import { isElevatedUserRole, requireStudentOrElevatedUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function LearningLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireStudentOrElevatedUser();
  const isElevated = isElevatedUserRole(user.role);

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
                Учебный кабинет
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {user.email}
              </p>
            </div>

            <LearningNav />

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Режим доступа
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {isElevated
                  ? "Открыт режим просмотра для команды платформы. Курсы можно проверять без пользовательского логина."
                  : "Здесь студент проходит курсы, открывает уроки и отмечает прогресс."}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {isElevated ? (
                <Button asChild variant="outline">
                  <Link href="/admin">Открыть админку</Link>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href="/catalog">Каталог и demo-оплата</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">На главную</Link>
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
