"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfile } from "@/features/profile/actions";

type ProfileData = {
  name: string | null;
  email: string;
  phone: string | null;
  telegram: string | null;
  city: string | null;
  marketingEnabled: boolean;
};

function Field({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string | null;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1.5 text-base text-[var(--foreground)]">
        {value || <span className="text-[var(--muted)]">{placeholder ?? "—"}</span>}
      </p>
    </div>
  );
}

export function ProfilePageContent({ profile }: { profile: ProfileData }) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      await updateUserProfile(fd);
      setEditing(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div
        id="profile-settings"
        className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Учетная запись
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--foreground)]">
              Мой профиль
            </h2>
          </div>
          {!editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Редактировать
            </Button>
          ) : null}
        </div>

        <div className="px-6 py-6">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">ФИО</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={profile.name ?? ""}
                    placeholder="Иванов Иван Иванович"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={profile.phone ?? ""}
                    placeholder="+7 900 000-00-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    name="telegram"
                    defaultValue={profile.telegram ?? ""}
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Город</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={profile.city ?? ""}
                    placeholder="Москва"
                  />
                </div>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="marketingEnabled"
                    defaultChecked={profile.marketingEnabled}
                    className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] text-[var(--primary)] focus:ring-[var(--focus)]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Получать информационные и рекламные письма от Академии риэлторов
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Новости о новых курсах, акциях, специальных предложениях и мероприятиях.
                      Сервисные письма о доступе, оплате и важных событиях приходят всегда.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={pending}>
                  {pending ? "Сохраняем…" : "Сохранить"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={pending}
                >
                  Отмена
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Email" value={profile.email} />
              <Field label="ФИО" value={profile.name} placeholder="Не указано" />
              <Field label="Телефон" value={profile.phone} placeholder="Не указан" />
              <Field label="Telegram" value={profile.telegram} placeholder="Не указан" />
              <Field label="Город" value={profile.city} placeholder="Не указан" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Маркетинговые письма
                </p>
                <p className="mt-1.5 text-base text-[var(--foreground)]">
                  {profile.marketingEnabled ? "Включены" : "Выключены"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-6 py-5 shadow-[var(--shadow-sm)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Письма платформы
        </p>
        <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
          Как устроены уведомления
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Мы разделяем сервисные письма и маркетинговые письма. Сервисные сообщают о доступе,
          оплате и изменениях в аккаунте. Маркетинговые письма рассказывают о новых курсах,
          потоках и полезных сценариях платформы.
        </p>
      </div>
    </div>
  );
}
