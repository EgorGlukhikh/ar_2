import { auth } from "@academy/auth";
import { CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { PublicButton, SectionLead } from "@/components/marketing/public-primitives";
import {
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";

const accessPoints = [
  "Один логин для администратора, автора, куратора и студента.",
  "Автоматический перевод в нужный кабинет в зависимости от роли.",
  "Вход выглядит как часть продукта, а не как отдельный технический экран.",
];

type SignInPageProps = {
  searchParams?: Promise<{
    email?: string;
    invited?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const defaultEmail = resolvedSearchParams.email ?? "";
  const showInviteSuccess = resolvedSearchParams.invited === "1";

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <header className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,_#182036_0%,_#2c4279_100%)] text-sm font-semibold text-white shadow-[0_16px_34px_rgba(24,32,54,0.2)]">
                  AR
                </div>
                <div>
                  <p className="font-[family:var(--font-landing-display)] text-lg font-semibold text-[#182036]">
                    Вход в платформу
                  </p>
                  <p className="max-w-sm text-sm leading-6 text-[#5f6982]">
                    Один экран авторизации для команды, авторов и студентов.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <PublicButton href="/" tone="secondary">
                  На главную
                </PublicButton>
                <PublicButton href="/catalog">Открыть каталог</PublicButton>
              </div>
            </header>

            <section className="grid gap-8 py-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
              <div className="space-y-8">
                <SectionLead
                  eyebrow="Авторизация"
                  title="Войти в академию без ощущения служебного экрана."
                  text="Страница входа сохраняет тот же визуальный язык, что и публичная витрина. Это мелочь, но именно она делает продукт цельным на демонстрации."
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { icon: Mail, label: "Формат", value: "Почта и пароль" },
                    { icon: ShieldCheck, label: "Роли", value: "Автор, админ, студент" },
                    { icon: KeyRound, label: "Маршрут", value: "Редирект по роли" },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <article
                        key={item.label}
                        className="rounded-[28px] border border-white/85 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97)_0%,_rgba(249,250,253,0.94)_100%)] p-5 shadow-[0_18px_50px_rgba(24,32,54,0.07)]"
                      >
                        <div className="inline-flex rounded-[18px] bg-[linear-gradient(135deg,_rgba(38,80,216,0.16)_0%,_rgba(79,111,240,0.08)_100%)] p-3">
                          <Icon className="h-5 w-5 text-[#2650d8]" />
                        </div>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#7a6548]">
                          {item.label}
                        </p>
                        <p className="mt-3 text-lg font-semibold leading-tight text-[#182036]">
                          {item.value}
                        </p>
                      </article>
                    );
                  })}
                </div>

                <div className="rounded-[34px] bg-[linear-gradient(145deg,_#182036_0%,_#2240a3_54%,_#f08f68_100%)] p-6 text-white shadow-[0_32px_90px_rgba(24,32,54,0.2)] md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/58">
                    Что важно
                  </p>
                  <div className="mt-5 space-y-3">
                    {accessPoints.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/8 p-4"
                      >
                        <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-[#ffd7b5]" />
                        <p className="text-sm leading-7 text-white/84">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="rounded-[34px] border border-white/85 bg-white p-5 shadow-[0_26px_80px_rgba(24,32,54,0.1)] md:p-6">
                <div className="rounded-[28px] bg-[linear-gradient(180deg,_#f6efe7_0%,_#eef2ff_100%)] p-6">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7a6548]">
                      Доступ
                    </p>
                    <h2 className="font-[family:var(--font-landing-display)] text-3xl font-semibold leading-[0.98] tracking-tight text-[#182036]">
                      Войти по почте
                    </h2>
                    <p className="text-sm leading-7 text-[#5f6982]">
                      Для теста можно использовать админский аккаунт или авторский аккаунт
                      Юры. После входа система сама отправит пользователя в нужный кабинет.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] border border-[#e5dacc] bg-white p-5 shadow-[0_12px_28px_rgba(24,32,54,0.05)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a6548]">
                        Администратор
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#182036]">
                        Почта: <span className="font-semibold">test@mail.ru</span>
                        <br />
                        Пароль: <span className="font-semibold">12345</span>
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-[#dbe3fb] bg-white p-5 shadow-[0_12px_28px_rgba(24,32,54,0.05)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a6548]">
                        Автор
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#182036]">
                        Почта: <span className="font-semibold">hp@mail.ru</span>
                        <br />
                        Пароль: <span className="font-semibold">123456789</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[24px] border border-white/80 bg-white p-5 shadow-[0_14px_32px_rgba(24,32,54,0.06)]">
                    {showInviteSuccess ? (
                      <div className="mb-4 rounded-[18px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        Приглашение активировано. Теперь можно войти в платформу.
                      </div>
                    ) : null}

                    <SignInForm defaultEmail={defaultEmail} />
                  </div>
                </div>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
