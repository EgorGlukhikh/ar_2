import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { createStudent } from "@/features/admin/user-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  return (
    <section className="space-y-6">
      <header className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Student Management
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          Студенты
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--muted)]">
          Здесь администратор создает учеников, выдает им доступы к курсам и
          контролирует учебную активность.
        </p>
      </header>

      <form
        action={createStudent}
        className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_260px_auto] lg:items-end">
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
          <Button type="submit">Создать студента</Button>
        </div>
      </form>

      <div className="grid gap-4">
        {students.length === 0 ? (
          <article className="rounded-[24px] border border-dashed border-[var(--border)] bg-white p-8 shadow-sm">
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Пока нет студентов
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Создай первого студента и затем выдай ему доступ к курсу из карточки
              курса.
            </p>
          </article>
        ) : (
          students.map((student) => (
            <article
              key={student.id}
              className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      {student.name || student.email}
                    </h2>
                    <Badge variant="neutral">Student</Badge>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{student.email}</p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                  <span className="rounded-full bg-[var(--surface)] px-3 py-2">
                    Курсов: {student._count.enrollments}
                  </span>
                  <span className="rounded-full bg-[var(--surface)] px-3 py-2">
                    Активностей: {student._count.progress}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {student.enrollments.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">
                    Доступы к курсам еще не выданы.
                  </p>
                ) : (
                  student.enrollments.map((enrollment) => (
                    <span
                      key={enrollment.id}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]"
                    >
                      {enrollment.course.title}
                    </span>
                  ))
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
