import type { ReactNode } from "react";
import { CheckCircle2, ShieldCheck, Sparkles, UserRound } from "lucide-react";

import { AuthCard } from "./auth-card";

import { publicGradientCardClassName, publicIconBoxClassName } from "@/components/marketing/public-primitives";
import { formatPublicCopy } from "@/lib/public-copy";
import { cn } from "@/lib/utils";

const benefits = [
  "Один вход для ученика, автора и внутренней команды.",
  "Яндекс работает как быстрый вход и регистрация для студента.",
  "Если email уже есть в системе, новый способ входа привяжется к тому же аккаунту.",
];

/**
 * Purpose: page-level auth layout with a dedicated visual identity, not a generic marketing block.
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
    <section className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
      <div className="space-y-6">
        <AuthCard className="bg-[var(--surface-strong)]">
          <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
            {formatPublicCopy("Доступ в платформу")}
          </p>
          <h1 className="mt-4 max-w-[12ch] text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--foreground)]">
            {formatPublicCopy(title)}
          </h1>
          <p className="mt-4 max-w-[560px] text-[16px] leading-7 text-[var(--muted)]">
            {formatPublicCopy(text)}
          </p>
        </AuthCard>

        <div className={publicGradientCardClassName}>
          <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-white/72">
            {formatPublicCopy("Что получаешь после входа")}
          </p>
          <h2 className="mt-4 max-w-[14ch] text-[30px] font-semibold leading-9 tracking-[-0.02em] text-white">
            {formatPublicCopy(sideTitle)}
          </h2>
          <p className="mt-4 max-w-[560px] text-base leading-7 text-white/84">
            {formatPublicCopy(sideText)}
          </p>

          <div className="mt-6 grid gap-3">
            {benefits.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[16px] border border-white/15 bg-white/10 p-4"
              >
                <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-white" />
                <p className="text-sm leading-6 text-white/88">
                  {formatPublicCopy(item)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: UserRound, label: "Один аккаунт", value: "Учеба, курсы и доступы" },
            { icon: ShieldCheck, label: "Связка по email", value: "Без дублей профиля" },
            { icon: Sparkles, label: "Быстрый вход", value: "Почта или Яндекс" },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <AuthCard key={item.label}>
                <div className={cn(publicIconBoxClassName, "h-10 w-10 rounded-[12px]")}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-4 text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                  {formatPublicCopy(item.label)}
                </p>
                <p className="mt-3 text-lg font-semibold leading-7 text-[var(--foreground)]">
                  {formatPublicCopy(item.value)}
                </p>
              </AuthCard>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}
