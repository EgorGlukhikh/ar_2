import { GraduationCap, KeyRound, Mail, UserPlus, Users } from "lucide-react";

import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { createStudent } from "@/features/admin/user-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: {
      role: USER_ROLES.STUDENT,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          enrollments: true,
          progress: true,
        },
      },
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });

  const studentsWithCourses = students.filter(
    (student) => student._count.enrollments > 0,
  ).length;

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="База студентов"
        title="Управление учениками"
        description="Здесь команда добавляет студентов, выдает им доступы к программам и проверяет, кто уже начал обучение."
        meta={
          <div className="rounded-full bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            Всего студентов: {students.length}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <WorkspaceStatCard
          label="Студенты"
          value={students.length}
          hint="Все созданные ученики платформы."
          icon={Users}
        />
        <WorkspaceStatCard
          label="С доступом"
          value={studentsWithCourses}
          hint="Студенты, у которых уже открыт хотя бы один курс."
          icon={GraduationCap}
        />
        <WorkspaceStatCard
          label="Без доступа"
          value={students.length - studentsWithCourses}
          hint="Пользователи, которым еще не выданы курсы."
          icon={UserPlus}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <WorkspacePanel
          eyebrow="Новый студент"
          title="Создать учетную запись"
          description="Форма нужна для быстрого старта. Дальше доступ к курсам можно выдать внутри карточки конкретного курса."
          className="self-start"
        >
          <form action={createStudent} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="student-name">Имя</Label>
              <Input id="student-name" name="name" placeholder="Иван Петров" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-email">Email</Label>
              <Input
                id="student-email"
                name="email"
                type="email"
                placeholder="student@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-password">Пароль</Label>
              <Input
                id="student-password"
                name="password"
                type="password"
                placeholder="Минимум 5 символов"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                <Mail className="h-4 w-4 text-[var(--primary)]" />
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                  Email для входа
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  Этот адрес студент использует в платформе.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                <KeyRound className="h-4 w-4 text-[var(--primary)]" />
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                  Временный пароль
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  Его можно заменить позже после первого входа.
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Создать студента
            </Button>
          </form>
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Список учеников"
          title="Кого уже можно вести по курсам"
          description="Карточки ниже помогают быстро понять, у кого уже есть доступы и сколько активности зафиксировано в системе."
        >
          {students.length === 0 ? (
            <WorkspaceEmptyState
              title="Пока нет студентов"
              description="Создай первого пользователя слева. После этого его можно будет зачислить на нужный курс из раздела «Доступ и продажи»."
              className="border-[var(--border)] bg-[var(--surface)] shadow-none"
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {students.map((student) => (
                <article
                  key={student.id}
                  className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                            {student.name || student.email}
                          </h2>
                          <Badge variant="neutral">Студент</Badge>
                        </div>
                        <p className="text-sm text-[var(--muted)]">{student.email}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="neutral">
                          Курсов {student._count.enrollments}
                        </Badge>
                        <Badge variant="neutral">
                          Активностей {student._count.progress}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                        Последние доступы
                      </p>
                      {student.enrollments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                          У студента пока нет открытых курсов.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {student.enrollments.map((enrollment) => (
                            <span
                              key={enrollment.id}
                              className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
                            >
                              {enrollment.course.title}
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
      </div>
    </section>
  );
}
