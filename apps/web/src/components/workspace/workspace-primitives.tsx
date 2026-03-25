import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpenText } from "lucide-react";

import { cn } from "@/lib/utils";

type WorkspacePageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
};

type WorkspacePanelProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

type WorkspaceStatCardProps = {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  className?: string;
};

type WorkspaceEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

type CourseThumbProps = {
  title: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
};

const posterThemes = [
  {
    shell: "bg-[linear-gradient(145deg,_#182036_0%,_#2447b8_52%,_#f08f68_100%)]",
    glow: "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.3),_transparent_45%)]",
    text: "text-white",
    chip: "bg-white/12 text-white/72 border-white/10",
  },
  {
    shell: "bg-[linear-gradient(145deg,_#1d3147_0%,_#2e6fa8_50%,_#9ac7ff_100%)]",
    glow: "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_45%)]",
    text: "text-white",
    chip: "bg-white/12 text-white/72 border-white/10",
  },
  {
    shell: "bg-[linear-gradient(145deg,_#221b3c_0%,_#5a47b2_48%,_#d68495_100%)]",
    glow: "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_45%)]",
    text: "text-white",
    chip: "bg-white/12 text-white/72 border-white/10",
  },
  {
    shell: "bg-[linear-gradient(145deg,_#3d2f20_0%,_#b5772f_48%,_#f0c484_100%)]",
    glow: "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_45%)]",
    text: "text-white",
    chip: "bg-white/14 text-white/78 border-white/10",
  },
];

function hashSeed(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getPosterTheme(seed: string) {
  return posterThemes[hashSeed(seed) % posterThemes.length];
}

function getInitials(value: string) {
  const words = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return "AR";
  }

  return words
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function WorkspacePageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: WorkspacePageHeaderProps) {
  return (
    <header
      className={cn(
        "rounded-[34px] border border-white/85 bg-[linear-gradient(180deg,_rgba(255,252,247,0.98)_0%,_rgba(255,255,255,0.94)_100%)] p-8 shadow-[0_28px_80px_rgba(24,32,54,0.08)]",
        className,
      )}
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7a6548]">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">{description}</p>
        </div>

        {(actions || meta) && (
          <div className="flex flex-col gap-3 xl:items-end">
            {meta}
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        )}
      </div>
    </header>
  );
}

export function WorkspacePanel({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: WorkspacePanelProps) {
  return (
    <article
      className={cn(
        "rounded-[30px] border border-white/85 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97)_0%,_rgba(249,250,253,0.94)_100%)] p-6 shadow-[0_22px_65px_rgba(24,32,54,0.07)]",
        className,
      )}
    >
      {(eyebrow || title || description || actions) && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7a6548]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">{description}</p>
            ) : null}
          </div>

          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      )}

      {children ? <div className={title || eyebrow || description ? "mt-6" : ""}>{children}</div> : null}
    </article>
  );
}

export function WorkspaceStatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: WorkspaceStatCardProps) {
  return (
    <article
      className={cn(
        "rounded-[28px] border border-white/85 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(246,248,252,0.94)_100%)] p-5 shadow-[0_18px_50px_rgba(24,32,54,0.07)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-[18px] bg-[linear-gradient(135deg,_rgba(38,80,216,0.16)_0%,_rgba(79,111,240,0.08)_100%)] p-3">
          <Icon className="h-5 w-5 text-[var(--primary)]" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a6548]">
          {label}
        </p>
      </div>

      <p className="mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{hint}</p>
    </article>
  );
}

export function WorkspaceEmptyState({
  title,
  description,
  action,
  className,
}: WorkspaceEmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.86)] p-8 shadow-[0_18px_50px_rgba(24,32,54,0.05)]",
        className,
      )}
    >
      <p className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{title}</p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function CourseThumb({
  title,
  subtitle,
  compact = false,
  className,
}: CourseThumbProps) {
  const theme = getPosterTheme(title);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[30px] border border-white/16 shadow-[0_26px_65px_rgba(24,32,54,0.16)]",
        compact ? "min-h-[160px] p-4" : "min-h-[220px] p-5",
        theme.shell,
        className,
      )}
    >
      <div className={cn("absolute inset-0 opacity-90", theme.glow)} />
      <div className="absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-white/12 blur-2xl" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
              theme.chip,
            )}
          >
            <BookOpenText className="h-3.5 w-3.5" />
            Курс
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-sm font-semibold text-white">
            {getInitials(title)}
          </div>
        </div>

        <div className={theme.text}>
          {subtitle ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              {subtitle}
            </p>
          ) : null}
          <p
            className={cn(
              "mt-3 font-semibold leading-[1.02]",
              compact ? "text-2xl" : "text-3xl",
            )}
          >
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
