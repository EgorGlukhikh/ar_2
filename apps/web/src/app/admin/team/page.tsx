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

export default async function TeamPage() {
  await requireAdminUser();

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
  const salesCount = teamMembers.filter((user) => user.role === USER_ROLES.SALES_MANAGER).length;

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Команда платформы"
        title="Роли, доступы и приглашения"
        description="Здесь администратор управляет внутренней командой: может сразу создать участника или выпустить ссылку-приглашение, по которой автор, куратор или менеджер подключится сам."
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
          label="Продажи"
          value={salesCount}
          hint="Операционный контур для продаж и коммуникаций."
          icon={Briefcase}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_420px_minmax(0,1fr)]">
        <WorkspacePanel
          eyebrow="Прямое создание"
          title="Завести участника сразу"
          description="Используй этот сценарий, если команда уже согласована и учетку можно выдать вручную."
          className="self-start"
        >
          <form action={createWorkspaceMember} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="team-name">Имя</Label>
              <Input id="team-name" name="name" placeholder="Анна Иванова" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-email">Почта</Label>
              <Input id="team-email" name="email" type="email" placeholder="author@example.com" required />
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
          className="self-start"
        >
          <form action={createWorkspaceInvite} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Почта</Label>
              <Input id="invite-email" name="email" type="email" placeholder="curator@example.com" required />
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

        <WorkspacePanel
          eyebrow="Текущая команда"
          title="Кто уже работает в системе"
          description="Карточки ниже помогают понять, кто уже редактирует курсы, проверяет домашние задания или работает с операционным контуром."
        >
          {teamMembers.length === 0 ? (
            <WorkspaceEmptyState
              title="Пока нет участников команды"
              description="Как только появится автор или куратор, он отобразится здесь."
              className="border-[var(--border)] bg-[var(--surface)] shadow-none"
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {teamMembers.map((member) => (
                <article
                  key={member.id}
                  className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                          {member.name || member.email}
                        </h2>
                        <Badge variant="neutral">{roleLabelMap[member.role]}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">{member.email}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {member.role === USER_ROLES.AUTHOR ? (
                        <Badge variant="neutral">Курсов {member._count.authored}</Badge>
                      ) : null}
                      {member.role === USER_ROLES.CURATOR ? (
                        <Badge variant="neutral">
                          Проверок {member._count.reviewedHomeworkSubmissions}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </WorkspacePanel>
      </div>

      <WorkspacePanel
        eyebrow="Приглашения"
        title="Последние ссылки-приглашения"
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
    </section>
  );
}

