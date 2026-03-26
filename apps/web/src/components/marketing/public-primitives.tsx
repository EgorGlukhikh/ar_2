import type { ReactNode } from "react";
import Link from "next/link";

import { formatPublicCopy } from "@/lib/public-copy";
import { cn } from "@/lib/utils";

export const publicCardClassName =
  "rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]";

export const publicSoftCardClassName =
  "rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] p-6 shadow-[var(--shadow-sm)]";

export const publicGradientCardClassName =
  "rounded-[24px] bg-[var(--brand-gradient)] p-7 text-white shadow-[var(--shadow-brand)]";

export const publicBadgeClassName =
  "inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 text-[13px] font-medium leading-[18px] tracking-[0.06em] text-[var(--foreground)]";

export const publicIconBoxClassName =
  "flex h-11 w-11 items-center justify-center rounded-[14px] bg-[var(--primary-soft)] text-[var(--primary)]";

export const publicInputClassName =
  "h-[var(--control-height)] w-full rounded-[var(--control-radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(79,70,229,0.14)] placeholder:text-[var(--muted-soft)]";

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
    return "inline-flex min-h-[var(--control-height)] items-center justify-center gap-2 rounded-[var(--control-radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3 text-base font-semibold text-[var(--foreground)] shadow-[var(--shadow-sm)] transition duration-200 hover:bg-[#f8fafc] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,70,229,0.16)] focus-visible:ring-offset-2 [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-current";
  }

  if (tone === "ghost") {
    return "inline-flex min-h-[var(--control-height)] items-center justify-center gap-2 rounded-[var(--control-radius)] border border-white/30 bg-transparent px-5 py-3 text-base font-semibold text-white transition duration-200 hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-current";
  }

  if (tone === "dark") {
    return "inline-flex min-h-[var(--control-height)] items-center justify-center gap-2 rounded-[var(--control-radius)] bg-[var(--foreground)] px-5 py-3 text-base font-semibold text-white shadow-[var(--shadow-md)] transition duration-200 hover:bg-[#020617] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,23,42,0.18)] focus-visible:ring-offset-2 [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-current";
  }

  return "inline-flex min-h-[var(--control-height)] items-center justify-center gap-2 rounded-[var(--control-radius)] bg-[var(--primary)] px-5 py-3 text-base font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-brand)] transition duration-200 hover:bg-[var(--primary-hover)] hover:text-[var(--primary-foreground)] active:bg-[var(--primary-active)] active:text-[var(--primary-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,70,229,0.16)] focus-visible:ring-offset-2 [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-current";
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
    <div className={cn("max-w-[560px] space-y-4", className)}>
      <p
        className={cn(
          "text-[12px] font-medium uppercase leading-4 tracking-[0.18em]",
          light ? "text-white/70" : "text-[var(--muted)]",
        )}
      >
        {formatPublicCopy(eyebrow)}
      </p>
      <h2
        className={cn(
          "max-w-[18ch] text-[clamp(1.75rem,4.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em]",
          light ? "text-white" : "text-[var(--foreground)]",
        )}
      >
        {formatPublicCopy(title)}
      </h2>
      <p
        className={cn(
          "max-w-[560px] text-base leading-7",
          light ? "text-white/84" : "text-[var(--muted)]",
        )}
      >
        {formatPublicCopy(text)}
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
    <div className={publicCardClassName}>
      <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
        {formatPublicCopy(label)}
      </p>
      <p className="mt-3 text-lg font-semibold leading-7 text-[var(--foreground)]">
        {formatPublicCopy(value)}
      </p>
    </div>
  );
}
