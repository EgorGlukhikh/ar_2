import { CourseStatus, LessonType, prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";
import { notFound } from "next/navigation";

import {
  createLesson,
  createModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  updateCourse,
  updateLesson,
  updateModule,
} from "@/features/admin/course-actions";
import {
  createStudent,
  enrollStudentInCourse,
  removeEnrollment,
  resetCourseProgress,
} from "@/features/admin/user-actions";
import { upsertCourseOffer } from "@/features/billing/actions";
import { formatMinorUnits } from "@/lib/money";
import { AdminLessonVideoManager } from "@/components/admin/admin-lesson-video-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function extractLessonBody(content: unknown) {
  if (
    content &&
    typeof content === "object" &&
    "body" in content &&
    typeof content.body === "string"
  ) {
    return content.body;
  }

  return "";
}

type CoursePageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      modules: {
        orderBy: {
          position: "asc",
        },
        include: {
          lessons: {
            orderBy: {
              position: "asc",
            },
            include: {
              videoAsset: true,
            },
          },
        },
      },
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
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
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
  const demoOffer = course.products[0];
  const demoPrice = demoOffer?.prices[0];

  return (
    <section className="space-y-6">
      <header className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Course Editor
              </p>
              <Badge>{course.status}</Badge>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              {course.title}
            </h1>
            <p className="text-sm text-[var(--muted)]">/{course.slug}</p>
            <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
              {course.description ||
                "Описание курса пока пустое. Его можно заполнить в основной форме ниже."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span className="rounded-full bg-[var(--surface)] px-3 py-2">
              Модулей: {course._count.modules}
            </span>
            <span className="rounded-full bg-[var(--surface)] px-3 py-2">
              Уроков: {lessonCount}
            </span>
            <span className="rounded-full bg-[var(--surface)] px-3 py-2">
              Зачислений: {course._count.enrollments}
            </span>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <form
          action={updateCourse}
          className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="courseId" value={course.id} />

          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Основные настройки
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Редактирование курса
            </h2>
          </div>

          <div className="mt-6 grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="title">Название курса</Label>
              <Input id="title" name="title" defaultValue={course.title} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={course.slug} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={course.description ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select id="status" name="status" defaultValue={course.status}>
                {Object.values(CourseStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="submit">Сохранить курс</Button>
          </div>
        </form>

        <form
          action={deleteCourse}
          className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="courseId" value={course.id} />

          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Опасная зона
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Удаление курса
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Удаление курса каскадно удалит модули, уроки и данные прогресса по
            этому курсу. Для production позже лучше заменить это на архивирование,
            но на текущем этапе админке нужен прямой рабочий сценарий.
          </p>

          <div className="mt-8">
            <Button
              type="submit"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Удалить курс
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Demo offer
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Настройка цены курса
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Этот блок управляет демонстрационным сценарием оплаты. Здесь задается
            сумма, после чего курс появляется в каталоге и его можно оплатить в
            demo checkout.
          </p>

          <div className="mt-6 rounded-[24px] bg-[var(--surface)] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={demoOffer?.isActive ? "success" : "neutral"}>
                {demoOffer?.isActive ? "Активно" : "Не настроено"}
              </Badge>
              {demoPrice ? (
                <Badge variant="neutral">
                  {formatMinorUnits(demoPrice.amount, demoPrice.currency)}
                </Badge>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {demoOffer
                ? "Предложение уже создано. Его можно обновить, изменить сумму или временно скрыть из каталога."
                : "У курса еще нет настроенного предложения. После сохранения появится цена и кнопка оплаты в каталоге."}
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
                defaultValue={demoOffer?.name ?? course.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Описание предложения</Label>
              <Textarea
                id="product-description"
                name="description"
                defaultValue={demoOffer?.description ?? course.description ?? ""}
                className="min-h-24"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <div className="space-y-2">
                <Label htmlFor="offer-amount">Сумма</Label>
                <Input
                  id="offer-amount"
                  name="amount"
                  defaultValue={
                    demoPrice ? String((demoPrice.amount / 100).toFixed(2)) : ""
                  }
                  placeholder="4900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-currency">Валюта</Label>
                <Input
                  id="offer-currency"
                  name="currency"
                  defaultValue={demoPrice?.currency ?? "RUB"}
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={demoOffer?.isActive ?? true}
                className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
              />
              Показывать курс в demo-каталоге и разрешить оплату
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit">Сохранить сумму</Button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
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
                    {student.name ? `${student.name} · ${student.email}` : student.email}
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

            <div className="mt-5 grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="inline-student-name">Имя</Label>
                <Input
                  id="inline-student-name"
                  name="name"
                  placeholder="Анна Иванова"
                  required
                />
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
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit">Создать студента</Button>
            </div>
          </form>
        </div>

        <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Зачисленные студенты
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Текущий доступ к курсу
          </h2>

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
                        <Badge variant="neutral">{enrollment.status}</Badge>
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

      <section className="space-y-6">
        <form
          action={createModule}
          className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="courseId" value={course.id} />

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="new-module-title">Добавить модуль</Label>
              <Input
                id="new-module-title"
                name="title"
                placeholder="Например, Модуль 1. Введение в профессию"
                required
              />
            </div>

            <Button type="submit">Создать модуль</Button>
          </div>
        </form>

        <div className="space-y-4">
          {course.modules.length === 0 ? (
            <article className="rounded-[24px] border border-dashed border-[var(--border)] bg-white p-8 shadow-sm">
              <p className="text-lg font-semibold text-[var(--foreground)]">
                Модулей пока нет
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Добавь первый модуль, после чего внутри него можно будет создавать
                уроки разных типов.
              </p>
            </article>
          ) : (
            course.modules.map((module) => (
              <article
                key={module.id}
                className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
              >
                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="neutral">Модуль {module.position}</Badge>
                      <p className="text-sm text-[var(--muted)]">
                        Уроков: {module.lessons.length}
                      </p>
                    </div>

                    <form action={updateModule} className="space-y-4">
                      <input type="hidden" name="moduleId" value={module.id} />
                      <input type="hidden" name="courseId" value={course.id} />
                      <div className="space-y-2">
                        <Label htmlFor={`module-title-${module.id}`}>Название модуля</Label>
                        <Input
                          id={`module-title-${module.id}`}
                          name="title"
                          defaultValue={module.title}
                          required
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button type="submit">Сохранить модуль</Button>
                      </div>
                    </form>

                    <form action={deleteModule}>
                      <input type="hidden" name="moduleId" value={module.id} />
                      <input type="hidden" name="courseId" value={course.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Удалить модуль
                      </Button>
                    </form>
                  </div>

                  <div className="space-y-4">
                    <form
                      action={createLesson}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                    >
                      <input type="hidden" name="moduleId" value={module.id} />
                      <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-end">
                        <div className="space-y-2">
                          <Label htmlFor={`new-lesson-title-${module.id}`}>Новый урок</Label>
                          <Input
                            id={`new-lesson-title-${module.id}`}
                            name="title"
                            placeholder="Например, Как оформлять сделку"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`new-lesson-type-${module.id}`}>Тип урока</Label>
                          <Select
                            id={`new-lesson-type-${module.id}`}
                            name="type"
                            defaultValue={LessonType.TEXT}
                          >
                            {Object.values(LessonType).map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <Button type="submit">Добавить урок</Button>
                      </div>
                    </form>

                    <div className="space-y-3">
                      {module.lessons.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--muted)]">
                          В этом модуле пока нет уроков.
                        </div>
                      ) : (
                        module.lessons.map((lesson) => (
                          <details
                            key={lesson.id}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
                          >
                            <summary className="cursor-pointer list-none">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                  <p className="text-lg font-semibold text-[var(--foreground)]">
                                    {lesson.title}
                                  </p>
                                  <p className="mt-1 text-sm text-[var(--muted)]">
                                    Урок {lesson.position}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <Badge>{lesson.type}</Badge>
                                  {lesson.isPreview ? (
                                    <Badge variant="success">Preview</Badge>
                                  ) : null}
                                  {lesson.videoAsset ? (
                                    <Badge variant="neutral">
                                      {lesson.videoAsset.sourceType}
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>
                            </summary>

                            <form action={updateLesson} className="mt-5 space-y-5">
                              <input type="hidden" name="lessonId" value={lesson.id} />
                              <input type="hidden" name="moduleId" value={module.id} />

                              <div className="grid gap-4 lg:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor={`lesson-title-${lesson.id}`}>Название урока</Label>
                                  <Input
                                    id={`lesson-title-${lesson.id}`}
                                    name="title"
                                    defaultValue={lesson.title}
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`lesson-type-${lesson.id}`}>Тип урока</Label>
                                  <Select
                                    id={`lesson-type-${lesson.id}`}
                                    name="type"
                                    defaultValue={lesson.type}
                                  >
                                    {Object.values(LessonType).map((type) => (
                                      <option key={type} value={type}>
                                        {type}
                                      </option>
                                    ))}
                                  </Select>
                                </div>

                                <div className="space-y-2 lg:col-span-2">
                                  <Label htmlFor={`lesson-excerpt-${lesson.id}`}>
                                    Краткое описание
                                  </Label>
                                  <Textarea
                                    id={`lesson-excerpt-${lesson.id}`}
                                    name="excerpt"
                                    defaultValue={lesson.excerpt ?? ""}
                                    className="min-h-24"
                                  />
                                </div>

                                <div className="space-y-2 lg:col-span-2">
                                  <Label htmlFor={`lesson-content-${lesson.id}`}>
                                    Текстовое содержание
                                  </Label>
                                  <Textarea
                                    id={`lesson-content-${lesson.id}`}
                                    name="contentText"
                                    defaultValue={extractLessonBody(lesson.content)}
                                    className="min-h-36"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`lesson-delay-${lesson.id}`}>
                                    Открыть через дней
                                  </Label>
                                  <Input
                                    id={`lesson-delay-${lesson.id}`}
                                    name="accessAfterDays"
                                    type="number"
                                    min={0}
                                    defaultValue={lesson.accessAfterDays ?? ""}
                                  />
                                </div>

                                <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)]">
                                  <input
                                    type="checkbox"
                                    name="isPreview"
                                    defaultChecked={lesson.isPreview}
                                    className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                                  />
                                  Доступен как preview-урок
                                </label>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <Button type="submit">Сохранить урок</Button>
                              </div>
                            </form>

                            <AdminLessonVideoManager
                              lessonId={lesson.id}
                              initialAsset={
                                lesson.videoAsset
                                  ? {
                                      id: lesson.videoAsset.id,
                                      provider: lesson.videoAsset.provider,
                                      sourceType: lesson.videoAsset.sourceType,
                                      status: lesson.videoAsset.status,
                                      originalFilename:
                                        lesson.videoAsset.originalFilename ?? null,
                                      sourceUrl: lesson.videoAsset.sourceUrl ?? null,
                                      playerUrl: lesson.videoAsset.playerUrl ?? null,
                                      playbackId: lesson.videoAsset.playbackId ?? null,
                                      errorMessage: lesson.videoAsset.errorMessage ?? null,
                                    }
                                  : null
                              }
                              fallbackVideoSourceType={lesson.videoSourceType}
                              fallbackVideoUrl={lesson.videoUrl}
                              fallbackVideoPlaybackId={lesson.videoPlaybackId}
                            />

                            <form action={deleteLesson} className="mt-4">
                              <input type="hidden" name="lessonId" value={lesson.id} />
                              <input type="hidden" name="courseId" value={course.id} />
                              <Button
                                type="submit"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                Удалить урок
                              </Button>
                            </form>
                          </details>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
