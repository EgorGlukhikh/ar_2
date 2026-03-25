import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function PublicButton({
  href,
  children,
  tone = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: "primary" | "secondary" | "ghost" | "dark";
  className?: string;
}) {
  return (
    <Link href={href} className={cn(publicButtonClassName(tone), className)}>
      {children}
    </Link>
  );
}

export function publicButtonClassName(
  tone: "primary" | "secondary" | "ghost" | "dark" = "primary",
) {
  if (tone === "secondary") {
    return "inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfd7e8] bg-[rgba(255,255,255,0.88)] px-6 py-3 text-sm font-semibold text-[#182036] shadow-[0_10px_24px_rgba(24,32,54,0.06)] transition hover:-translate-y-[1px] hover:border-[#2650d8] hover:text-[#2650d8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2650d8] focus-visible:ring-offset-2";
  }

  if (tone === "ghost") {
    return "inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#182036]";
  }

  if (tone === "dark") {
    return "inline-flex min-h-12 items-center justify-center rounded-full bg-[#182036] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(24,32,54,0.24)] transition hover:-translate-y-[1px] hover:bg-[#10182c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#182036] focus-visible:ring-offset-2";
  }

  return "inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#2650d8_0%,_#4f6ff0_55%,_#7893ff_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(38,80,216,0.24)] transition hover:-translate-y-[1px] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2650d8] focus-visible:ring-offset-2";
}

export function SectionLead({
  eyebrow,
  title,
  text,
  light = false,
  className,
}: {
  eyebrow: string;
  title: string;
  text: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.34em]",
          light ? "text-white/60" : "text-[#7a6548]",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "max-w-[24ch] text-balance font-[family:var(--font-landing-display)] text-[clamp(2.2rem,4vw,3.7rem)] font-semibold leading-[0.98] tracking-tight",
          light ? "text-white" : "text-[#182036]",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "max-w-2xl text-base leading-8",
          light ? "text-white/82" : "text-[#5f6982]",
        )}
      >
        {text}
      </p>
    </div>
  );
}

export function MetricChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,255,0.94)_100%)] p-4 shadow-[0_18px_45px_rgba(24,32,54,0.08)]">
      <p className="text-sm uppercase tracking-[0.18em] text-[#7a6548]">{label}</p>
      <p className="mt-3 max-w-[14ch] text-balance text-xl font-semibold leading-tight text-[#182036] md:text-2xl">
        {value}
      </p>
    </div>
  );
}
