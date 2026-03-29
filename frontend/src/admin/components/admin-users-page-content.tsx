import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";
import type { AdminUsersPayload } from "@shared/admin-users/types";

function getRegistryTitle(payload: AdminUsersPayload) {
  if (payload.filters.role === "all") {
    return "Все пользователи";
  }

  return (
    payload.roleOptions.find((item) => item.value === payload.filters.role)?.label ??
    "Пользователи"
  );
}

export function AdminUsersPageContent({
  payload,
}: {
  payload: AdminUsersPayload;
}) {
  const registryTitle = getRegistryTitle(payload);

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Пользователи"
        title="Общая база пользователей"
        description="Фильтруй базу по роли, доступу и способу входа. Здесь админ видит платформу целиком, а не только студентов."
        meta={
          <div className="rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            Найдено: {payload.filteredUsers} из {payload.totalUsers}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <WorkspaceStatCard
          label="Всего пользователей"
          value={payload.totalUsers}
          hint="Все аккаунты в системе."
          icon={Search}
        />
        <WorkspaceStatCard
          label="После фильтра"
          value={payload.filteredUsers}
          hint="Сколько пользователей попало в текущую выборку."
          icon={Search}
        />
        <WorkspaceStatCard
          label="Режим"
          value="Админ"
          hint="Раздел доступен только административному контуру."
          icon={Search}
        />
      </div>

      <WorkspacePanel
        eyebrow="Фильтры"
        title="Найти нужных пользователей"
        description="Форма ниже меняет список без дополнительных служебных экранов."
      >
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px_220px_220px_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Поиск</span>
            <Input
              name="query"
              defaultValue={payload.filters.query}
              placeholder="Имя или почта"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Роль</span>
            <Select name="role" defaultValue={payload.filters.role}>
              {payload.roleOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Доступ</span>
            <Select name="access" defaultValue={payload.filters.access}>
              <option value="all">Любой</option>
              <option value="with-access">С курсами</option>
              <option value="without-access">Без курсов</option>
            </Select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Способ входа</span>
            <Select name="authSource" defaultValue={payload.filters.authSource}>
              <option value="all">Любой</option>
              <option value="credentials">Почта и пароль</option>
              <option value="yandex">Яндекс</option>
              <option value="manual">Внутренний</option>
            </Select>
          </label>

          <Button type="submit">Применить</Button>
        </form>
      </WorkspacePanel>

      <WorkspacePanel
        eyebrow="Реестр"
        title={registryTitle}
        description={`${payload.filteredUsers} пользователей в текущей выборке.`}
      >
        {payload.users.length === 0 ? (
          <WorkspaceEmptyState
            title="Пользователи не найдены"
            description="Смени фильтры или очисти поиск, чтобы увидеть другие аккаунты."
            illustrationKind="thoughtProcess"
            className="border-[var(--border)] bg-[var(--surface)] shadow-none"
          />
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]">
            <div className="overflow-x-auto">
              <div className="min-w-[1120px]">
                <div className="grid grid-cols-[minmax(220px,1.2fr)_160px_240px_170px_100px_160px_120px] gap-4 border-b border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  <span>ФИО</span>
                  <span>Роль</span>
                  <span>Почта</span>
                  <span>Вход</span>
                  <span>Яндекс ID</span>
                  <span>Регистрация</span>
                  <span>Курсы</span>
                </div>

                <div className="divide-y divide-[var(--border)]">
                  {payload.users.map((user) => {
                    const hasYandexAccount = user.authSourceLabel === "Яндекс";

                    return (
                      <article
                        key={user.id}
                        className="grid grid-cols-[minmax(220px,1.2fr)_160px_240px_170px_100px_160px_120px] gap-4 px-5 py-4 transition-colors hover:bg-[var(--surface-strong)]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-[var(--foreground)]">
                            {user.name}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            Прогресс: {user.progressCount}
                          </p>
                          {user.latestCourses.length > 0 ? (
                            <p className="mt-2 truncate text-sm text-[var(--muted)]">
                              Последние курсы: {user.latestCourses.join(", ")}
                            </p>
                          ) : (
                            <p className="mt-2 text-sm text-[var(--muted)]">
                              Пока нет доступов к курсам.
                            </p>
                          )}
                        </div>

                        <div className="flex items-start">
                          <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)]">
                            {user.role}
                          </span>
                        </div>

                        <div className="min-w-0 pt-1">
                          <p className="truncate text-sm text-[var(--foreground)]">{user.email}</p>
                        </div>

                        <div className="pt-1">
                          <p className="text-sm text-[var(--foreground)]">{user.authSourceLabel}</p>
                        </div>

                        <div className="pt-1">
                          <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)]">
                            {hasYandexAccount ? "Да" : "Нет"}
                          </span>
                        </div>

                        <div className="pt-1">
                          <p className="text-sm text-[var(--foreground)]">{user.createdAtLabel}</p>
                        </div>

                        <div className="pt-1">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {user.enrollmentCount}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </WorkspacePanel>
    </section>
  );
}
