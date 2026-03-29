import Link from "next/link";
import { Briefcase, Link2, ShieldCheck, UserCog, Users2 } from "lucide-react";

import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { InviteLinkCopy } from "@/components/admin/invite-link-copy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";
import {
  createWorkspaceInvite,
  revokeWorkspaceInvite,
} from "@/features/admin/invite-actions";
import { createWorkspaceMember } from "@/features/admin/user-actions";
import { requireAdminUser } from "@/lib/admin";
import { buildWorkspaceInviteUrl } from "@/lib/invites";
import { cn } from "@/lib/utils";

const roleLabelMap = {
  ADMIN: "Администратор",
  AUTHOR: "Автор",
  CURATOR: "Куратор",
  SALES_MANAGER: "Продажи",
  STUDENT: "Студент",
} as const;

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

type TeamPageProps = {
  searchParams?: Promise<{
    tab?: string;
  }>;
};

function formatDate(value?: Date | null) {
  if (!value) {
    return "—";
  }

  return dateFormatter.format(value);
}

function getInviteStatus(invite: {
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
}) {
  if (invite.revokedAt) {
    return { label: "Отозвано", variant: "warning" as const };
  }

  if (invite.acceptedAt) {
    return { label: "Активировано", variant: "success" as const };
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    return { label: "Истекло", variant: "warning" as const };
  }

  return { label: "Ожидает активации", variant: "neutral" as const };
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  await requireAdminUser();

  const resolvedSearchParams = (searchParams ? await searchParams : {}) ?? {};
  const activeTab = resolvedSearchParams.tab === "invites" ? "invites" : "members";

  const [teamMembers, invites] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: {
          in: [USER_ROLES.ADMIN, USER_ROLES.AUTHOR, USER_ROLES.CURATOR, USER_ROLES.SALES_MANAGER],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            authored: true,
            reviewedHomeworkSubmissions: true,
          },
        },
      },
    }),
    prisma.workspaceInvite.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const authorCount = teamMembers.filter((user) => user.role === USER_ROLES.AUTHOR).length;
  const curatorCount = teamMembers.filter((user) => user.role === USER_ROLES.CURATOR).length;
  const pendingInvites = invites.filter(
    (invite) => !invite.acceptedAt && !invite.revokedAt && invite.expiresAt.getTime() >= Date.now(),
  ).length;

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Команда платформы"
        title="Роли, доступы и приглашения"
        description="Разделен на два рабочих контура: действующая команда и приглашения. Так проще отдельно управлять людьми в системе и всеми сценариями подключения."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          label="Команда"
          value={teamMembers.length}
          hint="Все внутренние участники платформы."
          icon={Users2}
        />
        <WorkspaceStatCard
          label="Авторы"
          value={authorCount}
          hint="Могут работать с закрепленными курсами."
          icon={UserCog}
        />
        <WorkspaceStatCard
          label="Кураторы"
          value={curatorCount}
          hint="Проверяют домашние задания и следят за студентами."
          icon={ShieldCheck}
        />
        <WorkspaceStatCard
          label="Открытые приглашения"
          value={pendingInvites}
          hint="Еще не активированные ссылки и доступы."
          icon={Briefcase}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <WorkspacePanel
          eyebrow="Навигация"
          title="Контур команды"
          description="Слева переключение между действующими участниками и приглашениями."
          className="self-start"
        >
          <div className="space-y-2">
            <Link
              href="/admin/team"
              className={cn(
                "flex items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 text-sm font-medium transition",
                activeTab === "members"
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
              )}
            >
              <span>Действующие</span>
              <span className="text-xs">{teamMembers.length}</span>
            </Link>

            <Link
              href="/admin/team?tab=invites"
              className={cn(
                "flex items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 text-sm font-medium transition",
                activeTab === "invites"
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
              )}
            >
              <span>Приглашения</span>
              <span className="text-xs">{invites.length}</span>
            </Link>
          </div>
        </WorkspacePanel>

        <div className="space-y-6">
          {activeTab === "members" ? (
            <WorkspacePanel
              eyebrow="Действующая команда"
              title="Кто уже работает в системе"
              description="Список показывает текущих авторов, кураторов, продажи и администраторов без смешивания с формами приглашений."
            >
              {teamMembers.length === 0 ? (
                <WorkspaceEmptyState
                  title="Пока нет участников команды"
                  description="Как только появится автор или куратор, он отобразится здесь."
                  className="border-[var(--border)] bg-[var(--surface)] shadow-none"
                />
              ) : (
                <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]">
                  <div className="overflow-x-auto">
                    <div className="min-w-[920px]">
                      <div className="grid grid-cols-[minmax(220px,1.4fr)_160px_240px_140px_140px_160px] gap-4 border-b border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        <span>Участник</span>
                        <span>Роль</span>
                        <span>Почта</span>
                        <span>Курсы</span>
                        <span>Проверки</span>
                        <span>Создан</span>
                      </div>

                      <div className="divide-y divide-[var(--border)]">
                        {teamMembers.map((member) => (
                          <article
                            key={member.id}
                            className="grid grid-cols-[minmax(220px,1.4fr)_160px_240px_140px_140px_160px] gap-4 px-5 py-4 transition-colors hover:bg-[var(--surface-strong)]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-[var(--foreground)]">
                                {member.name || member.email}
                              </p>
                              <p className="mt-1 text-sm text-[var(--muted)]">
                                Аккаунт команды платформы
                              </p>
                            </div>

                            <div className="pt-1">
                              <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)]">
                                {roleLabelMap[member.role]}
                              </span>
                            </div>

                            <div className="min-w-0 pt-1">
                              <p className="truncate text-sm text-[var(--foreground)]">{member.email}</p>
                            </div>

                            <div className="pt-1 text-sm text-[var(--foreground)]">
                              {member.role === USER_ROLES.AUTHOR ? member._count.authored : "—"}
                            </div>

                            <div className="pt-1 text-sm text-[var(--foreground)]">
                              {member.role === USER_ROLES.CURATOR
                                ? member._count.reviewedHomeworkSubmissions
                                : "—"}
                            </div>

                            <div className="pt-1 text-sm text-[var(--foreground)]">
                              {formatDate(member.createdAt)}
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </WorkspacePanel>
          ) : (
            <>
              <div className="grid gap-6 xl:grid-cols-2">
                <WorkspacePanel
                  eyebrow="Прямое создание"
                  title="Завести участника сразу"
                  description="Используй этот сценарий, если команда уже согласована и учетку можно выдать вручную."
                >
                  <form action={createWorkspaceMember} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Имя</Label>
                      <Input id="team-name" name="name" placeholder="Анна Иванова" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team-email">Почта</Label>
                      <Input
                        id="team-email"
                        name="email"
                        type="email"
                        placeholder="author@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team-password">Пароль</Label>
                      <Input
                        id="team-password"
                        name="password"
                        type="password"
                        placeholder="Минимум 5 символов"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team-role">Роль</Label>
                      <Select id="team-role" name="role" defaultValue={USER_ROLES.AUTHOR}>
                        <option value={USER_ROLES.AUTHOR}>Автор</option>
                        <option value={USER_ROLES.CURATOR}>Куратор</option>
                        <option value={USER_ROLES.SALES_MANAGER}>Продажи</option>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full">
                      Создать участника
                    </Button>
                  </form>
                </WorkspacePanel>

                <WorkspacePanel
                  eyebrow="Приглашения"
                  title="Выпустить ссылку-приглашение"
                  description="Этот сценарий удобнее, когда человек должен сам активировать доступ, придумать пароль и зайти в платформу по ссылке."
                >
                  <form action={createWorkspaceInvite} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Почта</Label>
                      <Input
                        id="invite-email"
                        name="email"
                        type="email"
                        placeholder="curator@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Роль</Label>
                      <Select id="invite-role" name="role" defaultValue={USER_ROLES.AUTHOR}>
                        <option value={USER_ROLES.AUTHOR}>Автор</option>
                        <option value={USER_ROLES.CURATOR}>Куратор</option>
                        <option value={USER_ROLES.SALES_MANAGER}>Продажи</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invite-days">Срок действия</Label>
                      <Select id="invite-days" name="expiresInDays" defaultValue="7">
                        <option value="3">3 дня</option>
                        <option value="7">7 дней</option>
                        <option value="14">14 дней</option>
                        <option value="30">30 дней</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invite-note">Комментарий</Label>
                      <Input
                        id="invite-note"
                        name="note"
                        placeholder="Например, доступ к двум курсам по новому запуску"
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Создать приглашение
                    </Button>
                  </form>
                </WorkspacePanel>
              </div>

              <WorkspacePanel
                eyebrow="Приглашения"
                title="История ссылок и статусов"
                description="Сюда попадают свежие приглашения. Ссылку можно скопировать и отправить человеку вручную, даже если почтовый контур пока отключен."
              >
                {invites.length === 0 ? (
                  <WorkspaceEmptyState
                    title="Пока нет приглашений"
                    description="Создай первое приглашение, и оно появится в этом списке."
                    className="border-[var(--border)] bg-[var(--surface)] shadow-none"
                  />
                ) : (
                  <div className="space-y-4">
                    {invites.map((invite) => {
                      const status = getInviteStatus(invite);
                      const inviteUrl = buildWorkspaceInviteUrl(invite.token);

                      return (
                        <article
                          key={invite.id}
                          className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5"
                        >
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={status.variant}>{status.label}</Badge>
                                <Badge variant="neutral">{roleLabelMap[invite.role]}</Badge>
                              </div>
                              <div>
                                <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                                  {invite.email}
                                </h2>
                                <p className="mt-1 text-sm text-[var(--muted)]">
                                  Выдал {invite.invitedBy.name || invite.invitedBy.email}
                                </p>
                              </div>
                              <div className="grid gap-2 text-sm text-[var(--muted)] md:grid-cols-2">
                                <p>Создано: {formatDate(invite.createdAt)}</p>
                                <p>Действует до: {formatDate(invite.expiresAt)}</p>
                                <p>Активировано: {formatDate(invite.acceptedAt)}</p>
                                <p>Отозвано: {formatDate(invite.revokedAt)}</p>
                              </div>
                              {invite.note ? (
                                <p className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-7 text-[var(--muted)]">
                                  {invite.note}
                                </p>
                              ) : null}
                            </div>

                            <div className="flex w-full max-w-[420px] flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-4">
                              <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                                <Link2 className="h-4 w-4 text-[var(--primary)]" />
                                Ссылка приглашения
                              </div>
                              <Input readOnly value={inviteUrl} />
                              <div className="flex flex-wrap gap-2">
                                <InviteLinkCopy url={inviteUrl} />
                                <Button asChild variant="outline" size="sm">
                                  <a href={inviteUrl} target="_blank" rel="noreferrer">
                                    Открыть приглашение
                                  </a>
                                </Button>
                                {!invite.revokedAt && !invite.acceptedAt ? (
                                  <form action={revokeWorkspaceInvite}>
                                    <input type="hidden" name="inviteId" value={invite.id} />
                                    <Button type="submit" variant="outline" size="sm">
                                      Отозвать
                                    </Button>
                                  </form>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </WorkspacePanel>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
