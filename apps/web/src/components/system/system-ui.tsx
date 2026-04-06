import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const systemCardClassName =
  "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]";

export const systemCardAltClassName =
  "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-strong)] shadow-[var(--shadow-sm)]";

export const systemCardInsetClassName =
  "rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)]";

export const systemHeaderCardClassName =
  "rounded-[var(--radius-xl)] border border-[var(--border)] bg-[rgba(255,255,255,0.92)] shadow-[var(--shadow-sm)] backdrop-blur";

export const systemSectionSpacingClassName = "space-y-6";
export const systemActionRowClassName = "flex flex-wrap items-center gap-3";
export const systemCompactActionRowClassName = "flex flex-wrap items-center gap-2";
export const systemEyebrowClassName =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]";
export const systemTitleClassName =
  "text-[24px] font-semibold tracking-[-0.02em] text-[var(--foreground)]";
export const systemHeroTitleClassName =
  "text-[clamp(1.75rem,3.4vw,2.35rem)] font-semibold tracking-[-0.02em] text-[var(--foreground)]";
export const systemBodyTextClassName =
  "max-w-[var(--content-max)] text-sm leading-7 text-[var(--muted)]";
export const systemTopbarClassName =
  "sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80";
export const systemTopbarInnerClassName = "px-4 md:px-6";
export const systemTopbarPrimaryRowClassName =
  "flex items-center justify-between gap-4 py-3";
export const systemTopbarSecondaryRowClassName =
  "flex flex-wrap items-center justify-between gap-3 pb-3";
export const systemTopbarActionsClassName =
  "flex shrink-0 flex-wrap items-center gap-2";
export const systemBrandMarkShellClassName =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--foreground)] text-white shadow-sm";

export const systemIconTileClassName =
  "flex h-11 w-11 items-center justify-center rounded-[var(--icon-radius)] bg-[var(--primary-soft)] text-[var(--primary)]";

export function systemNavItemClassName(isActive: boolean) {
  return cn(
    "inline-flex min-h-[var(--control-height)] shrink-0 items-center gap-2 whitespace-nowrap rounded-[var(--control-radius)] border px-4 py-3 text-sm font-semibold transition duration-200 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-current",
    isActive
      ? "border-transparent bg-[var(--primary)] !text-[var(--primary-foreground)] shadow-[var(--shadow-brand)] hover:!text-[var(--primary-foreground)] [&_svg]:!text-[var(--primary-foreground)]"
      : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]",
  );
}

export function SystemContainer({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[var(--container-max)] px-6 md:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SystemSection({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn(systemSectionSpacingClassName, className)} {...props}>
      {children}
    </section>
  );
}

export function SystemGrid({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-8 xl:grid-cols-12", className)} {...props}>
      {children}
    </div>
  );
}

export function SystemFormGroup({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
      {children}
      {hint ? <span className="text-sm leading-6 text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

export function SystemActionRow({
  dense = false,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  dense?: boolean;
}) {
  return (
    <div
      className={cn(
        dense ? systemCompactActionRowClassName : systemActionRowClassName,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SystemInfoItem({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] p-4", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-3 text-sm font-medium text-[var(--foreground)]">{value}</div>
      {hint ? <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{hint}</div> : null}
    </div>
  );
}

export function SystemNotice({
  tone = "neutral",
  title,
  description,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: "neutral" | "info" | "warning";
  title: string;
  description?: ReactNode;
}) {
  const toneClassName =
    tone === "info"
      ? "border-[rgba(59,130,246,0.18)] bg-[rgba(239,246,255,0.88)]"
      : tone === "warning"
        ? "border-[rgba(245,158,11,0.24)] bg-[rgba(255,251,235,0.92)]"
        : "border-[var(--border)] bg-[var(--surface-strong)]";

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border p-4 shadow-[var(--shadow-sm)]",
        toneClassName,
        className,
      )}
      {...props}
    >
      <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
      {description ? (
        <div className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</div>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
