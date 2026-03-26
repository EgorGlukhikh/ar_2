"use client";

import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Purpose: provider or auth-method button with consistent auth-page styling.
 */
export function AuthMethodButton({
  label,
  hint,
  icon,
  onClick,
  disabled = false,
  pending = false,
  tone = "secondary",
}: {
  label: string;
  hint?: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  pending?: boolean;
  tone?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className={cn(
        "group flex min-h-[72px] w-full items-center justify-between gap-4 rounded-[20px] border px-5 py-4 text-left transition",
        tone === "primary"
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-brand)]"
          : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
        (disabled || pending) && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-[14px] text-sm font-semibold",
            tone === "primary"
              ? "bg-white/16 text-white"
              : "bg-[#FC3F1D] text-white",
          )}
        >
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon ?? "Я"}
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold leading-6">{label}</p>
          {hint ? (
            <p
              className={cn(
                "text-sm leading-5",
                tone === "primary" ? "text-white/78" : "text-[var(--muted)]",
              )}
            >
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
