"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { AuthCard } from "./auth-card";
import { AuthMethodButton } from "./auth-method-button";
import { AuthShell } from "./auth-shell";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

import { formatPublicCopy } from "@/lib/public-copy";
import { cn } from "@/lib/utils";
import type { AuthTab, PublicAuthScreenPayload } from "@shared/public-auth/types";

/**
 * Purpose: standalone auth experience with explicit login and registration states.
 * Props:
 * - payload: auth screen state prepared in the backend layer
 */
export function SignInPageContent({
  payload,
}: {
  payload: PublicAuthScreenPayload;
}) {
  const [activeTab, setActiveTab] = useState<AuthTab>("sign-in");
  const [yandexPending, setYandexPending] = useState(false);

  async function handleYandexSignIn() {
    setYandexPending(true);
    await signIn("yandex", {
      callbackUrl: "/after-sign-in",
    });
  }

  return (
    <AuthShell
      title="Вход в обучающую платформу"
      text="Открой учебный кабинет или рабочий контур с одного экрана. Можно войти по почте и паролю или через Яндекс ID."
    >
      <AuthCard className="overflow-hidden border-[rgba(148,163,184,0.18)] bg-white/92 p-0 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="inline-flex rounded-[18px] border border-[var(--border)] bg-[var(--surface-strong)] p-1 shadow-[var(--shadow-sm)]">
            {([
              { id: "sign-in", label: "Вход" },
              { id: "register", label: "Регистрация" },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "min-h-[42px] rounded-[14px] px-5 text-sm font-semibold transition duration-200",
                  activeTab === tab.id
                    ? "bg-[var(--primary)] !text-white shadow-[var(--shadow-brand)]"
                    : "text-[var(--foreground)] hover:bg-[var(--surface)]",
                )}
              >
                {formatPublicCopy(tab.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-6 sm:py-7">
          <div className="space-y-2">
            <h2 className="text-[30px] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--foreground)]">
              {formatPublicCopy(
                activeTab === "sign-in"
                  ? "Войти"
                  : "Создать новый аккаунт",
              )}
            </h2>
            <p className="max-w-[560px] text-[15px] leading-6 text-[var(--muted)]">
              {formatPublicCopy(
                activeTab === "sign-in"
                  ? "Войди по почте и паролю. Если удобнее, можно продолжить через Яндекс ID."
                  : "Регистрация открывает учебный профиль. Роль автора, куратора или администратора назначается отдельно внутри платформы.",
              )}
            </p>
          </div>

          {payload.errorMessage ? (
            <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {formatPublicCopy(payload.errorMessage)}
            </div>
          ) : null}

          {payload.showInviteSuccess ? (
            <div className="rounded-[var(--radius-md)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
              {formatPublicCopy(
                "Приглашение активировано. Можно войти в существующий аккаунт или быстро завершить регистрацию на эту почту.",
              )}
            </div>
          ) : null}

          {activeTab === "sign-in" ? (
            <SignInForm defaultEmail={payload.defaultEmail} />
          ) : (
            <SignUpForm defaultEmail={payload.defaultEmail} />
          )}

          {payload.isYandexEnabled ? (
            <>
              <div className="flex items-center gap-4 pt-1">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-sm uppercase tracking-[0.12em] text-[var(--muted)]">
                  {formatPublicCopy("или")}
                </span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>

              <AuthMethodButton
                label="Войти с Яндекс ID"
                icon="Я"
                onClick={handleYandexSignIn}
                pending={yandexPending}
                tone="yandex"
              />
            </>
          ) : null}
        </div>
      </AuthCard>
    </AuthShell>
  );
}
