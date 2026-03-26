"use client";

import { useActionState } from "react";

import {
  publicButtonClassName,
  publicInputClassName,
} from "@/components/marketing/public-primitives";
import { authenticate, type SignInState } from "@/features/auth/actions";
import { formatPublicCopy } from "@/lib/public-copy";

const initialState: SignInState = {};

type SignInFormProps = {
  defaultEmail?: string;
};

export function SignInForm({ defaultEmail }: SignInFormProps) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    authenticate,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="email">
          {formatPublicCopy("Почта")}
        </label>
        <input
          id="email"
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
        <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="password">
          {formatPublicCopy("Пароль")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={formatPublicCopy("Введите пароль")}
          className={publicInputClassName}
          required
        />
      </div>

      {state.error ? (
        <p className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
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
