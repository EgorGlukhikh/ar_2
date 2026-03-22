"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { authenticate, type SignInState } from "@/features/auth/actions";

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
        <label className="text-sm font-medium text-[#4f5870]" htmlFor="email">
          Почта
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail || "test@mail.ru"}
          className="h-12 w-full rounded-2xl border border-[#d9e1f2] bg-white px-4 text-[#1c2442] outline-none transition focus:border-[#2840db] focus:ring-4 focus:ring-[#2840db]/10"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#4f5870]" htmlFor="password">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          defaultValue="12345"
          className="h-12 w-full rounded-2xl border border-[#d9e1f2] bg-white px-4 text-[#1c2442] outline-none transition focus:border-[#2840db] focus:ring-4 focus:ring-[#2840db]/10"
          required
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full rounded-full" disabled={pending}>
        {pending ? "Входим..." : "Войти в платформу"}
      </Button>
    </form>
  );
}
