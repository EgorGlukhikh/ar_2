import { auth } from "@academy/auth";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8faff_0%,_#f2f5ff_100%)] px-6 py-16">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-[0_30px_90px_rgba(111,139,251,0.14)] md:grid-cols-[1.02fr_0.98fr]">
        <div className="flex flex-col justify-between bg-[linear-gradient(180deg,_#eef3ff_0%,_#f8faff_100%)] p-8 text-[var(--foreground)] md:p-10">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Email Auth
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Вход в платформу для администраторов, команды и студентов.
            </h1>
            <p className="max-w-md text-base leading-8 text-[var(--muted)]">
              На текущем этапе работает авторизация по email и паролю с ролями в
              базе. После входа пользователь автоматически попадает в нужный
              кабинет.
            </p>
          </div>

          <div className="rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
            <p className="text-sm text-[var(--muted)]">Тестовый администратор</p>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
              Email: <span className="font-semibold">test@mail.ru</span>
              <br />
              Пароль: <span className="font-semibold">12345</span>
            </p>
          </div>
        </div>

        <div className="flex items-center bg-white p-8 md:p-10">
          <div className="w-full rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm md:p-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Sign in
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                Авторизация по email
              </h2>
              <p className="text-sm leading-7 text-[var(--muted)]">
                Для production тестовые данные нужно будет заменить через seed и
                переменные окружения.
              </p>
            </div>

            <div className="mt-8">
              <SignInForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
