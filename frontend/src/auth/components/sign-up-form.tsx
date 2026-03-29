"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPublicCopy } from "@/lib/public-copy";
import type {
  RegisterFieldErrors,
  RegisterResponse,
} from "@shared/public-auth/types";

/**
 * Purpose: credentials registration via API, then immediate login through NextAuth.
 */
export function SignUpForm({
  defaultEmail,
}: {
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setFormError(undefined);
    setFieldErrors({});

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email,
        password,
        passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
        marketingEnabled: formData.get("marketingEnabled") === "on",
      }),
    });

    const payload = (await response.json()) as RegisterResponse;

    if (!payload.ok) {
      setPending(false);
      setFormError(payload.formError);
      setFieldErrors(payload.fieldErrors ?? {});
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/after-sign-in",
    });

    setPending(false);

    if (!signInResult || signInResult.error) {
      setFormError(
        "Аккаунт создан, но автоматический вход не сработал. Попробуй войти вручную.",
      );
      return;
    }

    router.push(signInResult.url ?? "/after-sign-in");
    router.refresh();
  }

  function renderError(fieldName: keyof RegisterFieldErrors) {
    const message = fieldErrors[fieldName];
    if (!message) return null;
    return <p className="text-sm text-red-700">{formatPublicCopy(message)}</p>;
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="register-first-name">{formatPublicCopy("Имя")}</Label>
          <Input
            id="register-first-name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder={formatPublicCopy("Как к тебе обращаться")}
            required
          />
          {renderError("firstName")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-last-name">{formatPublicCopy("Фамилия")}</Label>
          <Input
            id="register-last-name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder={formatPublicCopy("Можно оставить пустым")}
          />
          {renderError("lastName")}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">{formatPublicCopy("Почта")}</Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail || ""}
          placeholder="name@example.com"
          required
        />
        {renderError("email")}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">{formatPublicCopy("Пароль")}</Label>
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={formatPublicCopy("Не короче 8 символов")}
          required
        />
        {renderError("password")}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password-confirmation">
          {formatPublicCopy("Повтори пароль")}
        </Label>
        <Input
          id="register-password-confirmation"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          placeholder={formatPublicCopy("Повтори пароль")}
          required
        />
        {renderError("passwordConfirmation")}
      </div>

      <label className="flex items-start gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
        <input
          type="checkbox"
          name="marketingEnabled"
          className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] text-[var(--primary)] focus:ring-[var(--focus)]"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--foreground)]">
            {formatPublicCopy(
              "Даю согласие на получение информационных и рекламных рассылок от Академии риэлторов",
            )}
          </p>
          <p className="text-sm leading-6 text-[var(--muted)]">
            {formatPublicCopy(
              "Включая новости о новых курсах, акциях, специальных предложениях и мероприятиях. Согласие можно отозвать в любой момент в письме или в личном кабинете.",
            )}
          </p>
        </div>
      </label>

      {formError ? (
        <p className="rounded-[var(--radius-sm)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formatPublicCopy(formError)}
        </p>
      ) : null}

      <Button type="submit" className="w-full justify-center" disabled={pending}>
        {pending
          ? formatPublicCopy("Создаём аккаунт...")
          : formatPublicCopy("Создать аккаунт")}
      </Button>
    </form>
  );
}
