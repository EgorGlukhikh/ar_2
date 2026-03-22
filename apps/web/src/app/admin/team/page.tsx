import { Briefcase, ShieldCheck, UserCog, Users2 } from "lucide-react";

import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { createWorkspaceMember } from "@/features/admin/user-actions";
import { requireAdminUser } from "@/lib/admin";
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

const roleLabelMap = {
  ADMIN: "Администратор",
  AUTHOR: "Автор",
  CURATOR: "Куратор",
  SALES_MANAGER: "Продажи",
  STUDENT: "Студент",
} as const;

export default async function TeamPage() {
  await requireAdminUser();

  const teamMembers = await prisma.user.findMany({
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
  });

  const authorCount = teamMembers.filter((user) => user.role === USER_ROLES.AUTHOR).length;
  const curatorCount = teamMembers.filter((user) => user.role === USER_ROLES.CURATOR).length;
  const salesCount = teamMembers.filter((user) => user.role === USER_ROLES.SALES_MANAGER).length;

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Команда платформы"
        title="Роли и доступы"
        description="Здесь администратор создает авторов, кураторов и сотрудников продаж. После этого роли начинают работать в реальном продукте, а не только в preview."
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

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <WorkspacePanel
          eyebrow="Новый участник"
          title="Создать аккаунт для команды"
          description="Для автора и куратора достаточно email, имени, пароля и роли. После создания пользователь сможет войти под своей учетной записью."
          className="self-start"
        >
          <form action={createWorkspaceMember} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="team-name">Имя</Label>
              <Input id="team-name" name="name" placeholder="Анна Иванова" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-email">Email</Label>
              <Input id="team-email" name="email" type="email" placeholder="author@example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-password">Пароль</Label>
              <Input id="team-password" name="password" type="password" placeholder="Минимум 5 символов" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-role">Роль</Label>
              <Select id="team-role" name="role" defaultValue={USER_ROLES.AUTHOR}>
                <option value={USER_ROLES.AUTHOR}>Автор</option>
                <option value={USER_ROLES.CURATOR}>Куратор</option>
                <option value={USER_ROLES.SALES_MANAGER}>Продажи</option>
              </Select>
            </div>

            <Button type="submit" className="w-full">Создать участника</Button>
          </form>
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Текущая команда"
          title="Кто уже работает в системе"
          description="Карточки ниже помогают понять, кто уже может редактировать курсы, проверять работы или работать с операционным контуром."
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
                        <Badge variant="neutral">Review {member._count.reviewedHomeworkSubmissions}</Badge>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </WorkspacePanel>
      </div>
    </section>
  );
}
