"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { authenticate, type SignInState } from "@/features/auth/actions";

const initialState: SignInState = {};

export function SignInForm() {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    authenticate,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue="test@mail.ru"
          className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700" htmlFor="password">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          defaultValue="12345"
          className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
          required
        />
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Входим..." : "Войти в платформу"}
      </Button>
    </form>
  );
}
