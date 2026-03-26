import { auth } from "@academy/auth";
import { CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import {
  PublicButton,
  SectionLead,
  publicCardClassName,
  publicGradientCardClassName,
  publicIconBoxClassName,
} from "@/components/marketing/public-primitives";
import {
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";
import { formatPublicCopy } from "@/lib/public-copy";

const accessPoints = [
  "Один вход для ученика и автора: продолжить обучение или открыть свои курсы.",
  "После авторизации платформа сама открывает нужный раздел без лишних шагов.",
  "Если тебя пригласили в курс или в рабочий кабинет, вход уже привязан к твоей почте.",
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
            <header className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.9)] px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur md:px-6">
              <div className="flex min-h-20 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[var(--foreground)] text-sm font-semibold text-white">
                    AR
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatPublicCopy("Вход в академию")}
                    </p>
                    <p className="max-w-[560px] text-sm leading-6 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Войди, чтобы продолжить обучение, открыть кабинет автора или вернуться к своим программам.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <PublicButton href="/" tone="secondary">
                    {formatPublicCopy("На главную")}
                  </PublicButton>
                  <PublicButton href="/catalog">
                    {formatPublicCopy("Открыть каталог")}
                  </PublicButton>
                </div>
              </div>
            </header>

            <section className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
              <div className="space-y-8">
                <SectionLead
                  eyebrow="Доступ"
                  title="Войди и продолжи с того места, где остановился"
                  text="Если у тебя уже есть курс, приглашение или кабинет автора, здесь достаточно почты и пароля. После входа система сама переведёт в нужный раздел."
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { icon: Mail, label: "Вход", value: "Почта и пароль" },
                    { icon: ShieldCheck, label: "Доступ", value: "Личный кабинет" },
                    { icon: KeyRound, label: "После входа", value: "Сразу в свой раздел" },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <article key={item.label} className={publicCardClassName}>
                        <div className={publicIconBoxClassName}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                          {formatPublicCopy(item.label)}
                        </p>
                        <p className="mt-3 text-lg font-semibold leading-7 text-[var(--foreground)]">
                          {formatPublicCopy(item.value)}
                        </p>
                      </article>
                    );
                  })}
                </div>

                <div className={publicGradientCardClassName}>
                  <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-white/70">
                    {formatPublicCopy("Что важно")}
                  </p>
                  <div className="mt-5 space-y-3">
                    {accessPoints.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-[16px] border border-white/15 bg-white/10 p-4"
                      >
                        <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-white" />
                        <p className="text-sm leading-6 text-white/88">{formatPublicCopy(item)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className={publicCardClassName}>
                <div className="rounded-[20px] bg-[var(--surface-strong)] p-6">
                  <div className="space-y-3">
                    <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                      {formatPublicCopy("Вход")}
                    </p>
                    <h2 className="text-[32px] font-semibold leading-10 tracking-[-0.02em] text-[var(--foreground)]">
                      {formatPublicCopy("Открыть свой кабинет")}
                    </h2>
                    <p className="max-w-[560px] text-base leading-7 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Используй свою почту и пароль, чтобы вернуться к урокам, открыть кабинет автора или продолжить работу с курсами.",
                      )}
                    </p>
                  </div>

                  <div className="mt-6 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-5">
                    {showInviteSuccess ? (
                      <div className="mb-4 rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {formatPublicCopy(
                          "Приглашение активировано. Теперь можно войти и открыть свой раздел.",
                        )}
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
