"use client";

import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Purpose: auth provider button with a dedicated Yandex treatment for the public sign-in screen.
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
        "group flex w-full items-center justify-between gap-4 rounded-[var(--radius-lg)] border px-5 py-4 text-left transition",
        tone === "primary" &&
          "border-[var(--primary)] bg-[var(--primary)] !text-white shadow-[var(--shadow-brand)]",
        tone === "secondary" &&
          "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
        isYandex &&
          "min-h-14 rounded-[20px] border-black bg-black text-white shadow-[0_20px_45px_rgba(15,23,42,0.18)] hover:bg-black",
        isLocked && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex items-center justify-center text-sm font-semibold",
            tone === "primary" && "h-11 w-11 rounded-[var(--icon-radius)] bg-white/16 text-white",
            tone === "secondary" && "h-11 w-11 rounded-[var(--icon-radius)] bg-[#FC3F1D] text-white",
            isYandex && "h-11 w-11 rounded-full bg-[#FC3F1D] text-[26px] leading-none text-white",
          )}
        >
          {pending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            icon ?? "Я"
          )}
        </div>

        <div className="space-y-1">
          <p
            className={cn(
              "text-base font-semibold leading-6",
              isYandex && "text-[17px] font-medium tracking-[-0.01em] text-white sm:text-[18px]",
            )}
          >
            {label}
          </p>
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
