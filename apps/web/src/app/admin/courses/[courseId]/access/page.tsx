import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";
import { BadgeDollarSign, ShoppingBag, UserPlus, Users } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createStudent,
  enrollStudentInCourse,
  removeEnrollment,
  resetCourseProgress,
} from "@/features/admin/user-actions";
import { upsertCourseOffer } from "@/features/billing/actions";
import { requireAdminUser } from "@/lib/admin";
import { enrollmentStatusLabelMap, enrollmentStatusVariantMap } from "@/lib/labels";
import { formatMinorUnits } from "@/lib/money";

type CourseAccessPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseAccessPage({
  params,
}: CourseAccessPageProps) {
  await requireAdminUser();

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      enrollments: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              progress: {
                where: {
                  completedAt: {
                    not: null,
                  },
                  lesson: {
                    module: {
                      courseId,
                    },
                  },
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      modules: {
        select: {
          lessons: {
            select: {
              id: true,
            },
          },
        },
      },
      products: {
        include: {
          prices: {
            where: {
              isDefault: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        take: 1,
      },
    },
  });

  if (!course) {
    notFound();
  }

  const availableStudents = await prisma.user.findMany({
    where: {
      role: USER_ROLES.STUDENT,
      enrollments: {
        none: {
          courseId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  const lessonCount = course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0,
  );
  const offer = course.products[0];
  const price = offer?.prices[0];

  return (
    <section className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Продажа курса
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Цена и публикация в каталоге
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Здесь задается стоимость курса, его описание в витрине и доступность для покупки через каталог.
          </p>

          <div className="mt-6 grid gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-4">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <BadgeDollarSign className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Цена для каталога
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Определяет, как курс выглядит в витрине и на шаге оформления доступа.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-4">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <ShoppingBag className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Доступ после покупки
                </p>
                <p className="text-sm text-[var(--muted)]">
                  После успешной оплаты студент попадает в учебный кабинет и получает доступ к программе.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-[var(--surface)] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={offer?.isActive ? "success" : "neutral"}>
                {offer?.isActive ? "Показывается в каталоге" : "Скрыт из каталога"}
              </Badge>
              {price ? (
                <Badge variant="neutral">
                  {formatMinorUnits(price.amount, price.currency)}
                </Badge>
              ) : null}
            </div>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {offer
                ? "Предложение уже создано. Можно обновить сумму, описание или временно скрыть курс из каталога."
                : "Предложение еще не настроено. После сохранения у курса появится цена и кнопка оформления доступа в каталоге."}
            </p>
          </div>
        </article>

        <form
          action={upsertCourseOffer}
          className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="courseId" value={course.id} />

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Название предложения</Label>
              <Input
                id="product-name"
                name="productName"
                defaultValue={offer?.name ?? course.title}
                required
              />
              <p className="text-sm leading-6 text-[var(--muted)]">
                Это название увидит пользователь в заказе и в карточке оплаты.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Описание предложения</Label>
              <Textarea
                id="product-description"
                name="description"
                defaultValue={offer?.description ?? course.description ?? ""}
                className="min-h-24"
              />
              <p className="text-sm leading-6 text-[var(--muted)]">
                Короткое пояснение, что именно входит в покупку курса.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <div className="space-y-2">
                <Label htmlFor="offer-amount">Сумма</Label>
                <Input
                  id="offer-amount"
                  name="amount"
                  defaultValue={price ? String((price.amount / 100).toFixed(2)) : ""}
                  placeholder="4900"
                  required
                />
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Полная стоимость курса в выбранной валюте.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-currency">Валюта</Label>
                <Input
                  id="offer-currency"
                  name="currency"
                  defaultValue={price?.currency ?? "RUB"}
                  required
                />
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Обычно для текущего проекта это `RUB`.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={offer?.isActive ?? true}
                className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
              />
              Показывать курс в каталоге и открывать оформление доступа.
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit">Сохранить условия продажи</Button>
            </div>
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Зачисления
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Доступы и прогресс студентов
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Здесь видно, кто уже учится на курсе, сколько уроков завершено и кому можно сбросить прогресс или снять доступ.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <Users className="h-5 w-5 text-[var(--primary)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                Студентов на курсе
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                {course.enrollments.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <UserPlus className="h-5 w-5 text-[var(--primary)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                Уроков в программе
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                {lessonCount}
              </p>
            </div>
          </div>
        </article>

        <div className="space-y-6">
          <form
            action={createStudent}
            className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
          >
            <input type="hidden" name="courseId" value={course.id} />

            <div className="grid gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Новый студент
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  Создать студента и сразу зачислить
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Имя</Label>
                  <Input id="student-name" name="name" placeholder="Анна Смирнова" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-email">Почта</Label>
                  <Input
                    id="student-email"
                    name="email"
                    type="email"
                    placeholder="anna@example.com"
                    required
                  />
                </div>
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

              <Button type="submit">Создать и зачислить</Button>
            </div>
          </form>

          <form
            action={enrollStudentInCourse}
            className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
          >
            <input type="hidden" name="courseId" value={course.id} />

            <div className="grid gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Зачисление
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  Добавить существующего студента
                </h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-id">Студент</Label>
                <Select id="student-id" name="studentId" required defaultValue="">
                  <option value="" disabled>
                    Выбери студента
                  </option>
                  {availableStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name || student.email} ({student.email})
                    </option>
                  ))}
                </Select>
              </div>

              <Button type="submit" variant="outline">
                Зачислить на курс
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Список студентов
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Кто уже учится на этом курсе
            </h2>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {course.enrollments.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-6 text-sm leading-7 text-[var(--muted)]">
              Пока на этот курс никто не зачислен.
            </div>
          ) : (
            course.enrollments.map((enrollment) => {
              const completedLessons = enrollment.user.progress.length;
              const studentName = enrollment.user.name || enrollment.user.email;

              return (
                <article
                  key={enrollment.id}
                  className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-[var(--foreground)]">
                          {studentName}
                        </p>
                        <Badge variant={enrollmentStatusVariantMap[enrollment.status]}>
                          {enrollmentStatusLabelMap[enrollment.status]}
                        </Badge>
                      </div>

                      <p className="text-sm text-[var(--muted)]">{enrollment.user.email}</p>
                      <p className="text-sm leading-7 text-[var(--muted)]">
                        Завершено уроков: {completedLessons} из {lessonCount}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <form action={resetCourseProgress}>
                        <input type="hidden" name="courseId" value={course.id} />
                        <input type="hidden" name="studentId" value={enrollment.user.id} />
                        <Button type="submit" variant="outline">
                          Сбросить прогресс
                        </Button>
                      </form>

                      <form action={removeEnrollment}>
                        <input type="hidden" name="enrollmentId" value={enrollment.id} />
                        <Button type="submit" variant="outline">
                          Снять доступ
                        </Button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </section>
  );
}
