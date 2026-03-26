import { BadgeDollarSign, ShoppingBag, UserPlus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";
import { upsertCourseOffer } from "@/features/billing/actions";
import {
  createStudent,
  enrollStudentInCourse,
  removeEnrollment,
  resetCourseProgress,
} from "@/features/admin/user-actions";
import type { AdminCourseAccessPayload } from "@shared/admin-course-access/types";

export function CourseAccessPageContent({
  payload,
}: {
  payload: AdminCourseAccessPayload;
}) {
  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Доступ к курсу"
        title="Студенты, выдача доступа и демо-списания"
        description="Админ управляет доступами вручную: добавляет студента, выдает бесплатный доступ или проводит демо-списание для платного курса."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {payload.stats.map((item, index) => {
          const icons = [Users, ShoppingBag, UserPlus, BadgeDollarSign];
          const Icon = icons[index] ?? Users;

          return (
            <WorkspaceStatCard
              key={item.label}
              label={item.label}
              value={item.value}
              hint={item.hint}
              icon={Icon}
            />
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <WorkspacePanel
          eyebrow="Настройки доступа"
          title="Карточка продажи и цена курса"
          description="Платежный модуль пока не подключаем, но цена курса и выдача доступа должны быть понятны уже сейчас."
        >
          <form action={upsertCourseOffer} className="grid gap-4">
            <input type="hidden" name="courseId" value={payload.courseId} />

            <div className="space-y-2">
              <Label htmlFor="product-name">Название предложения</Label>
              <Input
                id="product-name"
                name="productName"
                defaultValue={payload.courseTitle}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Описание предложения</Label>
              <Textarea
                id="product-description"
                name="description"
                defaultValue={payload.description ?? ""}
                className="min-h-24"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <div className="space-y-2">
                <Label htmlFor="offer-amount">Сумма</Label>
                <Input
                  id="offer-amount"
                  name="amount"
                  defaultValue={payload.amountValue}
                  placeholder="4900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-currency">Валюта</Label>
                <Input
                  id="offer-currency"
                  name="currency"
                  defaultValue={payload.currency}
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={payload.offerActive}
                className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
              />
              Показывать цену и оформление доступа в каталоге.
            </label>

            <div className="flex flex-wrap gap-3">
              <Button type="submit">Сохранить условия доступа</Button>
            </div>
          </form>
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Добавить студента"
          title="Выдать доступ вручную"
          description={
            payload.isPaidCourse
              ? "Для платного курса выбери: выдать доступ бесплатно или провести демо-списание с автоматическим зачислением."
              : "Для бесплатного курса достаточно выбрать или создать студента и выдать доступ."
          }
        >
          <div className="grid gap-6">
            <form action={createStudent} className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <input type="hidden" name="courseId" value={payload.courseId} />
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Новый студент
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Создать аккаунт и сразу открыть курс.
                  </p>
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

                {payload.isPaidCourse ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="new-student-grant-mode">Сценарий доступа</Label>
                      <Select
                        id="new-student-grant-mode"
                        name="grantMode"
                        defaultValue="free"
                      >
                        <option value="free">Выдать бесплатно</option>
                        <option value="demo_charge">Провести демо-списание</option>
                      </Select>
                    </div>

                    <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--foreground)]">
                      <input
                        type="checkbox"
                        name="confirmPaidAccess"
                        required
                        className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
                      />
                      Подтверждаю выдачу доступа для платного курса: либо бесплатно, либо через демо-списание.
                    </label>
                  </>
                ) : null}

                <Button type="submit">Создать и открыть доступ</Button>
              </div>
            </form>

            <form action={enrollStudentInCourse} className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <input type="hidden" name="courseId" value={payload.courseId} />
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Существующий студент
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Найди студента в системе и выдай доступ к этому курсу.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-id">Студент</Label>
                  <Select id="student-id" name="userId" required defaultValue="">
                    <option value="" disabled>
                      Выбери студента
                    </option>
                    {payload.availableStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {payload.isPaidCourse ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="existing-student-grant-mode">Сценарий доступа</Label>
                      <Select
                        id="existing-student-grant-mode"
                        name="grantMode"
                        defaultValue="free"
                      >
                        <option value="free">Выдать бесплатно</option>
                        <option value="demo_charge">Провести демо-списание</option>
                      </Select>
                    </div>

                    <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--foreground)]">
                      <input
                        type="checkbox"
                        name="confirmPaidAccess"
                        required
                        className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
                      />
                      Подтверждаю выбранный сценарий выдачи доступа для платного курса.
                    </label>
                  </>
                ) : null}

                <Button type="submit" variant="outline">
                  Выдать доступ
                </Button>
              </div>
            </form>
          </div>
        </WorkspacePanel>
      </div>

      <WorkspacePanel
        eyebrow="Студенты курса"
        title="Кто уже учится на этой программе"
        description="Можно быстро сбросить прогресс или снять доступ, не заходя в дополнительные служебные экраны."
      >
        <div className="space-y-4">
          {payload.enrollments.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-6 text-sm leading-7 text-[var(--muted)]">
              Пока на этот курс никто не зачислен.
            </div>
          ) : (
            payload.enrollments.map((enrollment) => (
              <article
                key={enrollment.id}
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {enrollment.studentName}
                      </p>
                      <Badge variant={enrollment.statusVariant}>
                        {enrollment.statusLabel}
                      </Badge>
                      <Badge variant="neutral">{enrollment.accessSourceLabel}</Badge>
                    </div>

                    <p className="text-sm text-[var(--muted)]">{enrollment.email}</p>
                    <p className="text-sm leading-7 text-[var(--muted)]">
                      Завершено уроков: {enrollment.completedLessons} из{" "}
                      {enrollment.totalLessons}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <form action={resetCourseProgress}>
                      <input type="hidden" name="courseId" value={payload.courseId} />
                      <input type="hidden" name="userId" value={enrollment.userId} />
                      <Button type="submit" variant="outline">
                        Сбросить прогресс
                      </Button>
                    </form>

                    <form action={removeEnrollment}>
                      <input type="hidden" name="courseId" value={payload.courseId} />
                      <input type="hidden" name="userId" value={enrollment.userId} />
                      <Button type="submit" variant="outline">
                        Снять доступ
                      </Button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </WorkspacePanel>
    </section>
  );
}

