"use client";

import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Purpose: auth provider button with consistent styling for the standalone auth screen.
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
  tone?: "primary" | "secondary" | "yandex";
}) {
  const isLocked = disabled || pending;
  const isYandex = tone === "yandex";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "group flex min-h-[72px] w-full items-center justify-between gap-4 rounded-[var(--radius-lg)] border px-5 py-4 text-left transition",
        tone === "primary" &&
          "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-brand)]",
        tone === "secondary" &&
          "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
        isYandex &&
          "border-[#111827] bg-[#111827] text-white shadow-[0_18px_45px_rgba(15,23,42,0.22)] hover:bg-[#0b1220]",
        isLocked && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-[var(--icon-radius)] text-sm font-semibold",
            tone === "primary" && "bg-white/16 text-white",
            tone === "secondary" && "bg-[#FC3F1D] text-white",
            isYandex && "bg-white text-[#FC3F1D]",
          )}
        >
          {pending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            icon ?? "Я"
          )}
        </div>

        <div className="space-y-1">
          <p className="text-base font-semibold leading-6">{label}</p>
          {hint ? (
            <p
              className={cn(
                "text-sm leading-5",
                tone === "primary" && "text-white/78",
                tone === "secondary" && "text-[var(--muted)]",
                isYandex && "text-white/72",
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

