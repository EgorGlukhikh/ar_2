import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default:
          "border-[#dce4ff] bg-[var(--primary-soft)] text-[var(--primary)]",
        neutral: "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted)]",
        success: "border-[#d7f0e1] bg-[#ebfbf1] text-[#0f7a47]",
        warning: "border-[#ffe0b3] bg-[#fff4df] text-[#9a5a00]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
