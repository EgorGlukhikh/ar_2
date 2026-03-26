import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageContainer({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[var(--container-max)] px-6 md:px-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageGrid({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-8 md:gap-6 xl:grid-cols-12 xl:gap-[var(--grid-gutter)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GridSection({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("space-y-8 md:space-y-10", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionShell({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] md:p-8",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionLead({
  className,
  eyebrow,
  title,
  description,
  actions,
  light = false,
}: {
  className?: string;
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
  light?: boolean;
}) {
  return (
    <div className={cn("max-w-[var(--content-max)] space-y-5", className)}>
      <p
        className={cn(
          "text-[12px] font-semibold uppercase leading-4 tracking-[0.2em]",
          light ? "text-white/72" : "text-[var(--text-muted)]",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "max-w-[20ch] text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.06] tracking-[-0.03em]",
          light ? "text-white" : "text-[var(--text)]",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "max-w-[var(--content-max)] text-[16px] leading-8",
          light ? "text-white/84" : "text-[var(--text-muted)]",
        )}
      >
        {description}
      </p>
      {actions ? <div className="flex flex-wrap gap-3 pt-1">{actions}</div> : null}
    </div>
  );
}

export function CardGrid({
  className,
  children,
  columns = "3",
}: {
  className?: string;
  children: ReactNode;
  columns?: "2" | "3" | "4";
}) {
  const columnsClassName =
    columns === "2"
      ? "grid-cols-1 md:grid-cols-2"
      : columns === "4"
        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return <div className={cn("grid gap-6", columnsClassName, className)}>{children}</div>;
}

export function SectionVisual({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      {children}
    </div>
  );
}
