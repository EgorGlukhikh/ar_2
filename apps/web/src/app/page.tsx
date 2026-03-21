import { auth } from "@academy/auth";
import {
  BookOpenText,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8faff_0%,_#f1f5ff_45%,_#eef3ff_100%)] px-6 py-16">
      <section className="grid w-full max-w-6xl gap-8 rounded-[28px] border border-[var(--border)] bg-[var(--surface-strong)] p-8 shadow-[0_30px_90px_rgba(111,139,251,0.12)] md:grid-cols-[1.1fr_0.9fr] md:p-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Академия риэлторов
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-6xl">
              Онлайн-платформа для курсов, обучения и сопровождения учеников.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              На платформе уже доступны авторизация по email, каталог курсов,
              личный кабинет ученика, админский контур и базовая логика оплаты
              доступа к обучению.
            </p>
          </div>

          <div className="grid gap-4 rounded-[24px] bg-[var(--primary-soft)] p-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="inline-flex rounded-2xl bg-white p-3 shadow-sm">
                <BookOpenText className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
                Курсы
              </p>
              <p className="text-xl font-semibold text-[var(--foreground)]">
                Структура обучения
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Курсы, модули, уроки, роли доступа и управление контентом.
              </p>
            </div>
            <div className="space-y-3">
              <div className="inline-flex rounded-2xl bg-white p-3 shadow-sm">
                <GraduationCap className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
                Ученики
              </p>
              <p className="text-xl font-semibold text-[var(--foreground)]">
                Учебный кабинет
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Прохождение уроков, прогресс по курсу и доступ к материалам.
              </p>
            </div>
            <div className="space-y-3">
              <div className="inline-flex rounded-2xl bg-white p-3 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
                Доступ
              </p>
              <p className="text-xl font-semibold text-[var(--foreground)]">
                Вход по email
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Авторизация для администраторов, команды и студентов.
              </p>
            </div>
          </div>
        </div>

        <aside className="relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-[var(--primary-soft)] blur-3xl" />
          <div className="relative space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Доступ к платформе
            </p>

            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--primary-soft)] p-3">
                  <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Быстрый вход
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    Используйте email и пароль, выданные вашей командой.
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-[var(--foreground)]">
                После авторизации пользователь автоматически попадает в нужный
                кабинет в зависимости от своей роли.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/sign-in">Войти в платформу</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/catalog">Открыть каталог</Link>
              </Button>
            </div>
          </div>

          <p className="relative mt-8 text-sm leading-7 text-[var(--muted)]">
            Текущий стенд уже позволяет создавать курсы, выдавать доступ,
            проходить уроки и проверять базовый сценарий покупки курса.
          </p>
        </aside>
      </section>
    </main>
  );
}
