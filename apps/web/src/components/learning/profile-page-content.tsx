"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfile } from "@/features/profile/actions";
import {
  SystemActionRow,
  SystemInfoItem,
  systemCardInsetClassName,
} from "@/components/system/system-ui";
import { WorkspacePanel } from "@/components/workspace/workspace-primitives";

type ProfileData = {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
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
    <SystemInfoItem
      label={label}
      value={
        value || <span className="text-[var(--muted)]">{placeholder ?? "—"}</span>
      }
    />
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
      <WorkspacePanel
        eyebrow="Учётная запись"
        title="Мой профиль"
        description="Контакты, имя и персональные настройки писем собраны в одном месте."
        actions={
          !editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Редактировать
            </Button>
          ) : undefined
        }
      >
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={profile.firstName ?? ""}
                  placeholder="Егор"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={profile.lastName ?? ""}
                  placeholder="Глухих"
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

            <div className={`${systemCardInsetClassName} px-5 py-4`}>
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

            <SystemActionRow className="pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Сохраняем..." : "Сохранить"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={pending}
              >
                Отмена
              </Button>
            </SystemActionRow>
          </form>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Email" value={profile.email} />
            <Field label="Имя" value={profile.firstName} placeholder="Не указано" />
            <Field label="Фамилия" value={profile.lastName} placeholder="Не указана" />
            <Field label="Телефон" value={profile.phone} placeholder="Не указан" />
            <Field label="Telegram" value={profile.telegram} placeholder="Не указан" />
            <Field label="Город" value={profile.city} placeholder="Не указан" />
            <SystemInfoItem
              label="Маркетинговые письма"
              value={profile.marketingEnabled ? "Включены" : "Выключены"}
            />
          </div>
        )}
      </WorkspacePanel>

      <WorkspacePanel
        eyebrow="Письма платформы"
        title="Как устроены уведомления"
        description="Мы разделяем сервисные письма и маркетинговые письма. Сервисные сообщают о доступе, оплате и изменениях в аккаунте. Маркетинговые рассказывают о новых курсах, потоках и полезных сценариях платформы."
      />
    </div>
  );
}
