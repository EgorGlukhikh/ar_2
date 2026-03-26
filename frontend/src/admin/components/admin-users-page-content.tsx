import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

export function AdminUsersPageContent({
  payload,
}: {
  payload: AdminUsersPayload;
}) {
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
        eyebrow="Список"
        title="Кого админ реально видит в системе"
        description="Карточки показывают роль, способ входа, последние курсы и общую активность."
      >
        {payload.users.length === 0 ? (
          <WorkspaceEmptyState
            title="Пользователи не найдены"
            description="Смени фильтры или очисти поиск, чтобы увидеть другие аккаунты."
            illustrationKind="thoughtProcess"
            className="border-[var(--border)] bg-[var(--surface)] shadow-none"
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {payload.users.map((user) => (
              <article
                key={user.id}
                className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--foreground)]">{user.name}</h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="neutral">{user.role}</Badge>
                      <Badge variant="neutral">{user.authSourceLabel}</Badge>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Курсы</p>
                      <p className="mt-2 font-semibold text-[var(--foreground)]">{user.enrollmentCount}</p>
                    </div>
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Активность</p>
                      <p className="mt-2 font-semibold text-[var(--foreground)]">{user.progressCount}</p>
                    </div>
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Создан</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{user.createdAtLabel}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Последние курсы</p>
                    {user.latestCourses.length === 0 ? (
                      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--muted)]">
                        Пока нет доступов к курсам.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.latestCourses.map((course) => (
                          <span
                            key={`${user.id}-${course}`}
                            className="rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--foreground)]"
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </WorkspacePanel>
    </section>
  );
}

