import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Purpose: reusable surface for auth panels and form containers.
 */
export function AuthCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {children}
    </article>
  );
}

