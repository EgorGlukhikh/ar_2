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
  "Вход по email и паролю без лишнего сценария регистрации.",
  "Автоматический переход в нужный кабинет в зависимости от роли.",
  "Один логин для администратора, автора, куратора и студента.",
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
            <header className="flex flex-col gap-4 border-b border-black/5 pb-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c2442] text-sm font-semibold text-white">
                  AR
                </div>
                <div>
                  <p className="font-[family:var(--font-landing-display)] text-lg font-semibold">
                    Академия риэлторов
                  </p>
                  <p className="text-sm leading-6 text-[#667087]">
                    Вход в платформу для команды, авторов и студентов.
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

            <div className="grid gap-8 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
              <div className="space-y-8">
                <SectionLead
                  eyebrow="Вход"
                  title="Открытый доступ в академию без лишнего служебного шума."
                  text="Страница авторизации должна ощущаться частью продукта, а не отдельным техническим экраном. Поэтому вход сохраняет тот же визуальный язык, что и лендинг."
                />

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { icon: Mail, label: "Формат", value: "Email + пароль" },
                    { icon: ShieldCheck, label: "Роли", value: "Админ, автор, студент" },
                    { icon: KeyRound, label: "Маршрут", value: "Авто-редирект по роли" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <article
                        key={item.label}
                        className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm"
                      >
                        <div className="inline-flex rounded-2xl bg-[#eef2ff] p-3">
                          <Icon className="h-5 w-5 text-[#2840db]" />
                        </div>
                        <p className="mt-4 text-sm text-[#697088]">{item.label}</p>
                        <p className="mt-2 text-xl font-semibold text-[#1c2442]">{item.value}</p>
                      </article>
                    );
                  })}
                </div>

                <div className="rounded-[32px] bg-[linear-gradient(135deg,_#18213d_0%,_#3146b6_56%,_#ff8f6d_100%)] p-6 text-white shadow-[0_30px_90px_rgba(38,43,101,0.22)] md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/60">
                    Что важно
                  </p>
                  <div className="mt-5 space-y-3">
                    {accessPoints.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/8 p-4"
                      >
                        <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-[#ffd6be]" />
                        <p className="text-sm leading-7 text-white/84">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="rounded-[32px] border border-black/5 bg-white p-5 shadow-[0_24px_80px_rgba(28,36,66,0.1)] md:p-6">
                <div className="rounded-[28px] border border-black/5 bg-[linear-gradient(180deg,_#f6f8ff_0%,_#fffaf7_100%)] p-6">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7b8296]">
                      Авторизация
                    </p>
                    <h2 className="font-[family:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-[#1c2442]">
                      Войти по email
                    </h2>
                    <p className="text-sm leading-7 text-[#596177]">
                      Для теста можно использовать админскую учетку. После входа платформа сама
                      отправит пользователя в нужный кабинет.
                    </p>
                  </div>

                  <div className="mt-6 rounded-[24px] border border-[#dfe5f7] bg-white p-5 shadow-sm">
                    <p className="text-sm text-[#697088]">Тестовый администратор</p>
                    <p className="mt-3 text-sm leading-7 text-[#1c2442]">
                      Email: <span className="font-semibold">test@mail.ru</span>
                      <br />
                      Пароль: <span className="font-semibold">12345</span>
                    </p>
                  </div>

                  <div className="mt-6">
                    {showInviteSuccess ? (
                      <div className="mb-4 rounded-[22px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        Приглашение активировано. Теперь можно войти в платформу.
                      </div>
                    ) : null}

                    <SignInForm defaultEmail={defaultEmail} />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
