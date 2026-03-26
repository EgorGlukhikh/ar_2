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
  "Один вход для ученика, автора курса и команды платформы.",
  "После авторизации система сама открывает нужный кабинет.",
  "Вход выглядит как часть продукта, а не как служебный экран.",
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
            <header className="flex flex-col gap-4 border-b border-black/5 pb-4 sm:pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(145deg,_#182036_0%,_#2c4279_100%)] text-sm font-semibold text-white shadow-[0_16px_34px_rgba(24,32,54,0.2)] sm:h-12 sm:w-12 sm:rounded-[18px]">
                  AR
                </div>
                <div>
                  <p className="font-[family:var(--font-landing-display)] text-base font-semibold text-[#182036] sm:text-lg">
                    Вход в академию
                  </p>
                  <p className="max-w-sm text-sm leading-6 text-[#5f6982]">
                    Личный вход для обучения, работы с курсами и управления программами.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                <PublicButton href="/" tone="secondary">
                  На главную
                </PublicButton>
                <PublicButton href="/catalog">Открыть каталог</PublicButton>
              </div>
            </header>

            <section className="grid gap-6 py-6 sm:gap-8 sm:py-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
              <div className="space-y-6 sm:space-y-8">
                <SectionLead
                  eyebrow="Авторизация"
                  title="Войти в платформу и продолжить обучение или работу с курсами."
                  text="На телефоне и на десктопе экран входа остается коротким, понятным и без служебных подсказок, которые мешают обычному пользователю."
                />

                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                  {[
                    { icon: Mail, label: "Вход", value: "Почта и пароль" },
                    { icon: ShieldCheck, label: "Безопасность", value: "Личный доступ" },
                    { icon: KeyRound, label: "Дальше", value: "Переход в свой кабинет" },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <article
                        key={item.label}
                        className="rounded-[24px] border border-white/85 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97)_0%,_rgba(249,250,253,0.94)_100%)] p-4 shadow-[0_16px_40px_rgba(24,32,54,0.07)] sm:rounded-[28px] sm:p-5"
                      >
                        <div className="inline-flex rounded-[18px] bg-[linear-gradient(135deg,_rgba(38,80,216,0.16)_0%,_rgba(79,111,240,0.08)_100%)] p-3">
                          <Icon className="h-5 w-5 text-[#2650d8]" />
                        </div>
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a6548] sm:mt-4 sm:text-xs sm:tracking-[0.24em]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-base font-semibold leading-tight text-[#182036] sm:mt-3 sm:text-lg">
                          {item.value}
                        </p>
                      </article>
                    );
                  })}
                </div>

                <div className="rounded-[26px] bg-[linear-gradient(145deg,_#182036_0%,_#2240a3_54%,_#f08f68_100%)] p-5 text-white shadow-[0_26px_70px_rgba(24,32,54,0.2)] sm:rounded-[34px] sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58 sm:text-xs sm:tracking-[0.34em]">
                    Что важно
                  </p>
                  <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                    {accessPoints.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/8 p-4 sm:rounded-[22px]"
                      >
                        <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-[#ffd7b5]" />
                        <p className="text-sm leading-6 text-white/84 sm:leading-7">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="rounded-[26px] border border-white/85 bg-white p-4 shadow-[0_22px_64px_rgba(24,32,54,0.1)] sm:rounded-[34px] sm:p-6">
                <div className="rounded-[22px] bg-[linear-gradient(180deg,_#f6efe7_0%,_#eef2ff_100%)] p-5 sm:rounded-[28px] sm:p-6">
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7a6548] sm:text-xs sm:tracking-[0.34em]">
                      Доступ
                    </p>
                    <h2 className="font-[family:var(--font-landing-display)] text-[1.9rem] font-semibold leading-[0.98] tracking-tight text-[#182036] sm:text-3xl">
                      Войти по почте
                    </h2>
                    <p className="text-sm leading-7 text-[#5f6982]">
                      Используй свою почту и пароль, чтобы продолжить обучение, открыть кабинет автора или перейти к управлению курсами.
                    </p>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-white/80 bg-white p-4 shadow-[0_14px_32px_rgba(24,32,54,0.06)] sm:mt-6 sm:rounded-[24px] sm:p-5">
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
