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
 * Purpose: standalone auth experience with explicit login/register modes and Yandex entrypoint.
 * Props:
 * - payload: query/env-derived auth screen settings
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
      title="Войди или создай аккаунт без лишних шагов."
      text="Один экран для входа, регистрации и быстрого старта через Яндекс. После авторизации платформа сама переведет тебя в нужный раздел."
      sideTitle="Доступ к курсам и кабинету автора начинается здесь."
      sideText="Если email уже есть в системе, новый способ входа привяжется к тому же аккаунту. Новые Яндекс-пользователи получают обычный STUDENT-профиль и могут сразу начать учиться."
    >
      <AuthCard className="p-0 overflow-hidden">
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
            <h2 className="text-[32px] font-semibold leading-10 tracking-[-0.02em] text-[var(--foreground)]">
              {formatPublicCopy(
                activeTab === "sign-in"
                  ? "Открыть свой кабинет"
                  : "Создать аккаунт студента",
              )}
            </h2>
            <p className="max-w-[560px] text-base leading-7 text-[var(--muted)]">
              {formatPublicCopy(
                activeTab === "sign-in"
                  ? "Войди по почте и паролю или используй Яндекс, если он привязан к твоему email."
                  : "Регистрация сразу создает обычный STUDENT-аккаунт. Если потом понадобится другая роль, ее назначит команда платформы.",
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
                "Приглашение активировано. Теперь можно войти или быстро завершить регистрацию по этой почте.",
              )}
            </div>
          ) : null}

          {payload.isYandexEnabled ? (
            <>
              <AuthMethodButton
                label="Продолжить через Яндекс ID"
                hint="Войдешь в существующий аккаунт по совпавшему email или создашь новый STUDENT-профиль."
                icon="Я"
                onClick={handleYandexSignIn}
                pending={yandexPending}
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
