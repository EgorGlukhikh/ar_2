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
            Сейчас подключен демонстрационный сценарий оплаты. Здесь задается
            цена, после чего курс появляется в каталоге и становится доступен
            для тестовой покупки.
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
                  Определяет, как курс выглядит в витрине и checkout.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-4">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <ShoppingBag className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Доступ после оплаты
                </p>
                <p className="text-sm text-[var(--muted)]">
                  После успешной покупки студент попадает в учебный кабинет.
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
                : "Предложение еще не настроено. После сохранения у курса появится цена и кнопка оплаты в каталоге."}
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
                  defaultValue={
                    price ? String((price.amount / 100).toFixed(2)) : ""
                  }
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
                className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
              />
              Показывать курс в каталоге и разрешить оплату
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit">Сохранить цену</Button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <form
            action={enrollStudentInCourse}
            className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
          >
            <input type="hidden" name="courseId" value={course.id} />

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Доступ к курсу
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Выдать доступ существующему студенту
            </h2>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-4">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <Users className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Используй этот блок, если студент уже есть в базе, и ему нужно
                просто открыть доступ к курсу.
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <Label htmlFor="enroll-user">Студент</Label>
              <Select
                id="enroll-user"
                name="userId"
                defaultValue=""
                required
                disabled={availableStudents.length === 0}
              >
                <option value="" disabled>
                  {availableStudents.length === 0
                    ? "Все студенты уже зачислены"
                    : "Выбери студента"}
                </option>
                {availableStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name
                      ? `${student.name} · ${student.email}`
                      : student.email}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={availableStudents.length === 0}>
                Выдать доступ
              </Button>
            </div>
          </form>

          <form
            action={createStudent}
            className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
          >
            <input type="hidden" name="courseId" value={course.id} />

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Быстрое создание
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Создать нового студента и сразу выдать доступ
            </h2>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-4">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <UserPlus className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Этот сценарий удобен, когда нужно быстро зарегистрировать нового
                ученика и сразу открыть ему курс.
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="inline-student-name">Имя</Label>
                <Input
                  id="inline-student-name"
                  name="name"
                  placeholder="Анна Иванова"
                  required
                />
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Имя, которое будет видно в списках и прогрессе курса.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inline-student-email">Email</Label>
                <Input
                  id="inline-student-email"
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                />
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Этот email студент будет использовать для входа в платформу.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inline-student-password">Пароль</Label>
                <Input
                  id="inline-student-password"
                  name="password"
                  type="password"
                  placeholder="Минимум 5 символов"
                  required
                />
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Временный пароль, который потом можно будет заменить.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit">Создать студента</Button>
            </div>
          </form>
        </div>

        <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Студенты курса
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Доступы и прогресс
              </h2>
            </div>

            <div className="rounded-full bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">
              Всего уроков: {lessonCount}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {course.enrollments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--muted)]">
                Пока никто не зачислен на этот курс.
              </div>
            ) : (
              course.enrollments.map((enrollment) => {
                const completedLessons = enrollment.user.progress.length;
                const progressLabel =
                  lessonCount > 0
                    ? `${completedLessons} / ${lessonCount}`
                    : "0 / 0";

                return (
                  <div
                    key={enrollment.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[var(--foreground)]">
                          {enrollment.user.name || enrollment.user.email}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {enrollment.user.email}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={enrollmentStatusVariantMap[enrollment.status]}
                        >
                          {enrollmentStatusLabelMap[enrollment.status]}
                        </Badge>
                        <Badge
                          variant={
                            completedLessons === lessonCount && lessonCount > 0
                              ? "success"
                              : "default"
                          }
                        >
                          Прогресс {progressLabel}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <form action={resetCourseProgress}>
                        <input type="hidden" name="userId" value={enrollment.userId} />
                        <input type="hidden" name="courseId" value={course.id} />
                        <Button type="submit" variant="outline">
                          Сбросить прогресс
                        </Button>
                      </form>

                      <form action={removeEnrollment}>
                        <input type="hidden" name="userId" value={enrollment.userId} />
                        <input type="hidden" name="courseId" value={course.id} />
                        <Button
                          type="submit"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Отозвать доступ
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>
    </section>
  );
}
