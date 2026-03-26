import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { CourseThumb } from "@/components/workspace/workspace-primitives";

type WorkspaceCourseCardProps = {
  title: string;
  slug: string;
  description?: string | null;
  badges?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function WorkspaceCourseCard({
  title,
  slug,
  description,
  badges,
  children,
  actions,
  className,
}: WorkspaceCourseCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <CourseThumb title={title} subtitle={`/${slug}`} compact />

        <div className="flex min-w-0 flex-col gap-5">
          <div className="space-y-4">
            {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}

            <div className="space-y-3">
              <h2 className="text-[24px] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--foreground)]">
                {title}
              </h2>
              <p className="text-sm leading-7 text-[var(--muted)]">
                {description || "Описание курса пока не заполнено."}
              </p>
            </div>

            {children}
          </div>

          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </article>
  );
}
