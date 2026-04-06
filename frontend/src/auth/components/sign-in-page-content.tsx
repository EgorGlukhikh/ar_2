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

function getAuthCallbackUrl() {
  if (typeof window === "undefined") {
    return "/after-sign-in";
  }

  return new URL("/after-sign-in", window.location.origin).toString();
}

/**
 * Purpose: standalone auth experience with explicit login and registration states.
 */
export function SignInPageContent({
  payload,
}: {
  payload: PublicAuthScreenPayload;
}) {
  const [activeTab, setActiveTab] = useState<AuthTab>("sign-in");
  const [yandexPending, setYandexPending] = useState(false);
  const activeTabCopy =
    activeTab === "sign-in"
      ? {
          title: "Уже есть аккаунт",
          text: "Войди по почте или через Яндекс ID, чтобы вернуться в кабинет и к своим курсам.",
        }
      : {
          title: "Новый аккаунт",
          text: "Регистрация нужна один раз. После создания аккаунта ты сразу попадешь на платформу.",
        };

  async function handleYandexSignIn() {
    setYandexPending(true);
    await signIn("yandex", {
      callbackUrl: getAuthCallbackUrl(),
    });
  }

  return (
    <AuthShell>
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="max-w-[12ch] text-[clamp(2.2rem,4vw,4rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--foreground)]">
            {formatPublicCopy("Вход в обучающую платформу")}
          </h1>
          <p className="max-w-[48ch] text-sm leading-7 text-[var(--muted)]">
            {formatPublicCopy(
              "Один экран для двух сценариев: вход для действующих пользователей и быстрая регистрация для новых.",
            )}
          </p>
        </div>

        <AuthCard className="overflow-hidden border-[rgba(148,163,184,0.14)] bg-white p-0 shadow-none">
          <div className="px-5 py-4 sm:px-6">
            <div className="grid grid-cols-2 rounded-[18px] border border-[var(--border)] bg-[var(--surface-strong)] p-1">
              {([
                { id: "sign-in", label: "Вход" },
                { id: "register", label: "Регистрация" },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "min-h-[42px] rounded-[14px] px-4 text-sm font-semibold transition duration-200",
                    activeTab === tab.id
                      ? "bg-[var(--primary)] !text-white shadow-[var(--shadow-brand)]"
                      : "text-[var(--foreground)] hover:bg-[var(--surface)]",
                  )}
                >
                  {formatPublicCopy(tab.label)}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {formatPublicCopy(activeTabCopy.title)}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                {formatPublicCopy(activeTabCopy.text)}
              </p>
            </div>
          </div>

          <div className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
            {payload.errorMessage ? (
              <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {formatPublicCopy(payload.errorMessage)}
              </div>
            ) : null}

            {payload.showInviteSuccess ? (
              <div className="rounded-[var(--radius-md)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                {formatPublicCopy(
                  "Приглашение активировано. Можно войти в существующий аккаунт или завершить регистрацию на эту почту.",
                )}
              </div>
            ) : null}

            {activeTab === "sign-in" ? (
              <SignInForm defaultEmail={payload.defaultEmail} />
            ) : (
              <SignUpForm defaultEmail={payload.defaultEmail} />
            )}

            {payload.isYandexEnabled ? (
              <div className="border-t border-[var(--border)] pt-5">
                <AuthMethodButton
                  label="Войти с Яндекс ID"
                  hint="Быстрый вход без отдельного пароля платформы."
                  icon="Я"
                  onClick={handleYandexSignIn}
                  pending={yandexPending}
                  tone="yandex"
                />
              </div>
            ) : null}
          </div>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
