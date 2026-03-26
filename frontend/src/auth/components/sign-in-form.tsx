"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  publicButtonClassName,
  publicInputClassName,
} from "@/components/marketing/public-primitives";
import { formatPublicCopy } from "@/lib/public-copy";

/**
 * Purpose: credentials sign-in through NextAuth API without server actions in the page layer.
 */
export function SignInForm({
  defaultEmail,
}: {
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(undefined);

    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
      callbackUrl: "/after-sign-in",
    });

    setPending(false);

    if (!result || result.error) {
      setError("Неверный email или пароль.");
      return;
    }

    router.push(result.url ?? "/after-sign-in");
    router.refresh();
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-5"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="sign-in-email">
          {formatPublicCopy("Почта")}
        </label>
        <input
          id="sign-in-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail || ""}
          placeholder="name@example.com"
          className={publicInputClassName}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="sign-in-password">
          {formatPublicCopy("Пароль")}
        </label>
        <input
          id="sign-in-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={formatPublicCopy("Введите пароль")}
          className={publicInputClassName}
          required
        />
      </div>

      {error ? (
        <p className="rounded-[var(--radius-sm)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formatPublicCopy(error)}
        </p>
      ) : null}

      <button
        type="submit"
        className={`${publicButtonClassName("primary")} w-full justify-center`}
        disabled={pending}
      >
        {pending ? formatPublicCopy("Входим...") : formatPublicCopy("Войти в платформу")}
      </button>
    </form>
  );
}
