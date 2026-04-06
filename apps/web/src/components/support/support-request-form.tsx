"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  initialSupportFormState,
  submitSupportRequestAction,
} from "@/features/support/actions";
import type { SupportFormPrefill } from "@/features/support/service";

export function SupportRequestForm({
  prefill,
}: {
  prefill: SupportFormPrefill;
}) {
  const [state, formAction, pending] = useActionState(
    submitSupportRequestAction,
    initialSupportFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="sourcePath" value="/support" />

      {state.status === "success" ? (
        <div className="rounded-[var(--radius-lg)] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-7 text-emerald-800">
          {state.message}
        </div>
      ) : null}

      {state.status === "error" && state.message ? (
        <div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 px-5 py-4 text-sm leading-7 text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="support-name">Имя</Label>
          <Input
            id="support-name"
            name="name"
            defaultValue={prefill.name}
            placeholder="Как к вам обращаться"
            autoComplete="name"
          />
          {state.fieldErrors?.name ? (
            <p className="text-xs text-red-600">{state.fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="support-email">Email</Label>
          <Input
            id="support-email"
            name="email"
            type="email"
            defaultValue={prefill.email}
            placeholder="name@example.com"
            autoComplete="email"
          />
          {state.fieldErrors?.email ? (
            <p className="text-xs text-red-600">{state.fieldErrors.email}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="support-phone">Телефон</Label>
        <Input
          id="support-phone"
          name="phone"
          type="tel"
          defaultValue={prefill.phone}
          placeholder="+7 900 000-00-00"
          autoComplete="tel"
        />
        {state.fieldErrors?.phone ? (
          <p className="text-xs text-red-600">{state.fieldErrors.phone}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="support-comment">Что случилось</Label>
        <Textarea
          id="support-comment"
          name="comment"
          placeholder="Опишите, с чем столкнулись, что пытались сделать и что именно пошло не так."
          className="min-h-40"
        />
        {state.fieldErrors?.comment ? (
          <p className="text-xs text-red-600">{state.fieldErrors.comment}</p>
        ) : null}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm leading-7 text-[var(--muted)]">
        {prefill.isAuthenticated ? (
          <p>
            Профиль уже найден. Имя, почта и телефон подставлены автоматически, но
            их можно уточнить перед отправкой.
          </p>
        ) : (
          <p>
            Если вы ещё не вошли в аккаунт, просто оставьте контакты вручную -
            техподдержка всё равно получит заявку.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Отправляем..." : "Отправить в техподдержку"}
        </Button>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Ответ придёт на указанный email или по указанному контакту.
        </p>
      </div>
    </form>
  );
}
