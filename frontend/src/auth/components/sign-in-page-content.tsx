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
      title="Вход и регистрация без лишних шагов."
      text="Открой учебный кабинет или рабочий контур с одного экрана. Можно войти по почте и паролю или через Яндекс."
      sideTitle="После входа платформа сама откроет нужный раздел."
      sideText="Если почта уже есть в системе, вход через Яндекс подключится к тому же аккаунту. Новый вход через Яндекс создает обычный учебный профиль."
    >
      <AuthCard className="overflow-hidden p-0">
        <div className="border-b border-[var(--border)] p-3">
          <div className="inline-flex rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-strong)] p-1 shadow-[var(--shadow-sm)]">
            {([
              { id: "sign-in", label: "Вход" },
              { id: "register", label: "Регистрация" },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "min-h-[calc(var(--control-height)-8px)] rounded-[calc(var(--control-radius)-4px)] px-5 text-sm font-semibold transition duration-200",
                  activeTab === tab.id
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-brand)]"
                    : "text-[var(--foreground)] hover:bg-[var(--surface)]",
                )}
              >
                {formatPublicCopy(tab.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
              {formatPublicCopy(activeTab === "sign-in" ? "Вход" : "Регистрация")}
            </p>
            <h2 className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[var(--foreground)]">
              {formatPublicCopy(
                activeTab === "sign-in"
                  ? "Открыть свой кабинет"
                  : "Создать новый аккаунт",
              )}
            </h2>
            <p className="max-w-[560px] text-[15px] leading-6 text-[var(--muted)]">
              {formatPublicCopy(
                activeTab === "sign-in"
                  ? "Войди по почте и паролю или используй Яндекс, если он привязан к твоей почте."
                  : "Регистрация открывает учебный профиль. Роль автора, куратора или администратора назначается отдельно внутри платформы.",
              )}
            </p>
          </div>

          {payload.errorMessage ? (
            <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {formatPublicCopy(payload.errorMessage)}
            </div>
          ) : null}

          {payload.showInviteSuccess ? (
            <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
              {formatPublicCopy(
                "Приглашение активировано. Можно войти в существующий аккаунт или быстро завершить регистрацию на эту почту.",
              )}
            </div>
          ) : null}

          {payload.isYandexEnabled ? (
            <>
              <AuthMethodButton
                label="Войти через Яндекс"
                hint="Быстрый вход без отдельного пароля, если почта уже известна системе."
                icon="Я"
                onClick={handleYandexSignIn}
                pending={yandexPending}
                tone="yandex"
              />

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-sm text-[var(--muted)]">
                  {formatPublicCopy("или")}
                </span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>
            </>
          ) : null}

          {activeTab === "sign-in" ? (
            <SignInForm defaultEmail={payload.defaultEmail} />
          ) : (
            <SignUpForm defaultEmail={payload.defaultEmail} />
          )}
        </div>
      </AuthCard>
    </AuthShell>
  );
}
