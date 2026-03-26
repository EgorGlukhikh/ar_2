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
      className={cn("mx-auto w-full max-w-[1400px] px-4 md:px-6", className)}
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
    <div className={cn("grid gap-6", className)} {...props}>
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
