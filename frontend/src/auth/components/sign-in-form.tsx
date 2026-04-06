"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPublicCopy } from "@/lib/public-copy";

function getAuthCallbackUrl() {
  if (typeof window === "undefined") {
    return "/after-sign-in";
  }

  return new URL("/after-sign-in", window.location.origin).toString();
}

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
      callbackUrl: getAuthCallbackUrl(),
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
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="sign-in-email">{formatPublicCopy("Почта")}</Label>
        <Input
          id="sign-in-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail || ""}
          placeholder="name@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sign-in-password">{formatPublicCopy("Пароль")}</Label>
        <Input
          id="sign-in-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={formatPublicCopy("Введи пароль от платформы")}
          required
        />
      </div>

      {error ? (
        <p className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formatPublicCopy(error)}
        </p>
      ) : null}

      <Button type="submit" className="w-full justify-center" disabled={pending}>
        {pending ? formatPublicCopy("Входим...") : formatPublicCopy("Войти")}
      </Button>
    </form>
  );
}
