import { auth } from "@academy/auth";
import { USER_ROLES } from "@academy/shared";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  const dashboardHref = session?.user
    ? session.user.role === USER_ROLES.STUDENT
      ? "/learning"
      : "/admin"
    : "/sign-in";
  const dashboardLabel = session?.user
    ? session.user.role === USER_ROLES.STUDENT
      ? "Открыть учебный кабинет"
      : "Открыть админку"
    : "Войти по email";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8faff_0%,_#f1f5ff_45%,_#eef3ff_100%)] px-6 py-16">
      <section className="grid w-full max-w-6xl gap-8 rounded-[28px] border border-[var(--border)] bg-[var(--surface-strong)] p-8 shadow-[0_30px_90px_rgba(111,139,251,0.12)] md:grid-cols-[1.2fr_0.8fr] md:p-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Academy Platform
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-6xl">
              Академия риэлторов: рабочий каркас платформы уже собран.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Уже готовы роли, email-авторизация, админка контента, учебный кабинет,
              video foundation и demo-сценарий оплаты курса.
            </p>
          </div>

          <div className="grid gap-4 rounded-[24px] bg-[var(--primary-soft)] p-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
                Auth
              </p>
              <p className="text-xl font-semibold text-[var(--foreground)]">
                Email + password
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Роли, сессии и тестовый админ для локального сценария.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
                Learning
              </p>
              <p className="text-xl font-semibold text-[var(--foreground)]">
                Courses + progress
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Курсы, модули, уроки, video player и прохождение.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
                Billing
              </p>
              <p className="text-xl font-semibold text-[var(--foreground)]">
                Demo checkout
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Цена курса, каталог и демонстрация оплаты с выдачей доступа.
              </p>
            </div>
          </div>
        </div>

        <aside className="flex flex-col justify-between rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Access
            </p>
            {session?.user ? (
              <>
                <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                  <p className="text-sm text-[var(--muted)]">Текущий пользователь</p>
                  <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                    {session.user.email}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Роль: {session.user.role}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button asChild>
                    <Link href={dashboardHref}>{dashboardLabel}</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/catalog">Каталог и demo-оплата</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                  <p className="text-sm text-[var(--muted)]">Тестовая админка</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">
                    Логин: <span className="font-semibold">test@mail.ru</span>
                    <br />
                    Пароль: <span className="font-semibold">12345</span>
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button asChild>
                    <Link href="/sign-in">Войти по email</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/catalog">Открыть каталог</Link>
                  </Button>
                </div>
              </>
            )}
          </div>

          <p className="mt-8 text-sm leading-7 text-[var(--muted)]">
            Полный demo-сценарий уже работает: задать цену, открыть каталог,
            запустить checkout и выдать доступ после оплаты.
          </p>
        </aside>
      </section>
    </main>
  );
}
