import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { formatPublicCopy } from "@/lib/public-copy";

const benefits = [
  "Один вход для ученика, автора и внутренней команды.",
  "Яндекс работает как быстрый вход или регистрация без отдельного пароля.",
  "Если почта уже есть в системе, новый вход подтянется к тому же аккаунту.",
];

/**
 * Purpose: auth layout with a clear split-screen composition for marketing-style entry pages.
 */
export function AuthShell({
  title,
  text,
  sideTitle,
  sideText,
  children,
}: {
  title: string;
  text: string;
  sideTitle: string;
  sideText: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-[rgba(148,163,184,0.18)] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] xl:grid xl:min-h-[760px] xl:grid-cols-[1.06fr_0.94fr]">
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#6f84f5_0%,#8ea2ff_100%)] px-7 py-7 text-white sm:px-10 sm:py-10 xl:flex xl:flex-col xl:justify-between xl:px-12 xl:py-12">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/14 text-2xl font-semibold tracking-[-0.04em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur">
              AR
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
                {formatPublicCopy("Обучающая платформа")}
              </p>
              <h1 className="text-[clamp(1.6rem,3vw,2.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-white">
                {formatPublicCopy("Академия риэлторов")}
              </h1>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white/88 transition hover:bg-white/16"
            aria-label="Вернуться на главную"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="relative z-10 mt-10 max-w-[520px] space-y-5 xl:mt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
            {formatPublicCopy("Доступ в систему")}
          </p>
          <h2 className="max-w-[10ch] text-[clamp(2.4rem,6vw,4.75rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-white">
            {formatPublicCopy(title)}
          </h2>
          <p className="max-w-[46ch] text-[15px] leading-7 text-white/78 sm:text-base">
            {formatPublicCopy(text)}
          </p>
        </div>

        <div className="relative z-10 mt-10 flex justify-center xl:mt-6 xl:justify-start">
          <div className="relative w-full max-w-[620px]">
            <div className="absolute inset-0 translate-y-10 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.26),rgba(255,255,255,0)_72%)] blur-2xl" />
            <Image
              src="/illustrations/continuous-learning.svg"
              alt="Иллюстрация обучения"
              width={620}
              height={552}
              priority
              className="relative h-auto w-full drop-shadow-[0_28px_60px_rgba(34,39,92,0.38)]"
            />
          </div>
        </div>

        <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3 xl:mt-6 xl:max-w-[700px]">
          {benefits.map((item) => (
            <div
              key={item}
              className="rounded-[22px] border border-white/14 bg-white/10 px-4 py-4 backdrop-blur-[8px]"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 flex-none text-white" />
                <p className="text-sm leading-6 text-white/84">
                  {formatPublicCopy(item)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] px-5 py-6 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
        <div className="mx-auto w-full max-w-[520px]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {formatPublicCopy("Авторизация")}
          </p>
          <h3 className="max-w-[12ch] text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--foreground)]">
            {formatPublicCopy(sideTitle)}
          </h3>
          <p className="mt-4 max-w-[44ch] text-[15px] leading-7 text-[var(--muted)]">
            {formatPublicCopy(sideText)}
          </p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
