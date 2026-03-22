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
    return "inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfd7f3] bg-white px-6 py-3 text-sm font-semibold text-[#1c2442] transition hover:border-[#2840db] hover:text-[#2840db] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2840db] focus-visible:ring-offset-2";
  }

  if (tone === "ghost") {
    return "inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c2442]";
  }

  if (tone === "dark") {
    return "inline-flex min-h-12 items-center justify-center rounded-full bg-[#1c2442] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#141a31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c2442] focus-visible:ring-offset-2";
  }

  return "inline-flex min-h-12 items-center justify-center rounded-full bg-[#2840db] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(40,64,219,0.24)] transition hover:bg-[#1f34bf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2840db] focus-visible:ring-offset-2";
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
          light ? "text-white/60" : "text-[#697088]",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "max-w-[24ch] text-balance font-[family:var(--font-landing-display)] text-[clamp(2.2rem,4vw,3.7rem)] font-semibold leading-[0.98] tracking-tight",
          light ? "text-white" : "text-[#1c2442]",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "max-w-2xl text-base leading-8",
          light ? "text-white/82" : "text-[#596177]",
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
    <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm">
      <p className="text-sm text-[#697088]">{label}</p>
      <p className="mt-2 max-w-[14ch] text-balance text-xl font-semibold leading-tight md:text-2xl">
        {value}
      </p>
    </div>
  );
}
