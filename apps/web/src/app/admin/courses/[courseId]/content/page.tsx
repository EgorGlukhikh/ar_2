import { LessonType, prisma } from "@academy/db";
import { BookOpen, Film, Layers3, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { AdminLessonVideoManager } from "@/components/admin/admin-lesson-video-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  updateLesson,
  updateModule,
} from "@/features/admin/course-actions";
import {
  extractLessonBody,
  getCourseLessonCount,
} from "@/features/admin/course-page-data";
import { lessonTypeLabelMap, mediaSourceTypeLabelMap } from "@/lib/labels";

type CourseContentPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseContentPage({
  params,
}: CourseContentPageProps) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
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
    },
  });

  if (!course) {
    notFound();
  }

  const lessonCount = getCourseLessonCount(course.modules);

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Программа курса
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Модули и уроки
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Здесь собирается учебная структура. Сначала создавай модули, затем
            уроки внутри них. Полное описание, видео и доступы настраиваются уже
            в карточке конкретного урока.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-4">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <Layers3 className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Сначала модуль
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Разбей курс на крупные смысловые блоки.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-4">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <BookOpen className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Потом уроки
                </p>
                <p className="text-sm text-[var(--muted)]">
                  У каждого урока будет свой текст, видео и доступ.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span className="rounded-full bg-[var(--surface)] px-3 py-2">
              Модулей: {course.modules.length}
            </span>
            <span className="rounded-full bg-[var(--surface)] px-3 py-2">
              Уроков: {lessonCount}
            </span>
          </div>
        </article>

        <form
          action={createModule}
          className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="courseId" value={course.id} />

          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Новый модуль
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Добавить раздел программы
            </h2>
            <p className="text-sm leading-7 text-[var(--muted)]">
              Формулируй название так, чтобы команде и студенту было сразу
              понятно, что входит в этот блок.
            </p>
          </div>

          <div className="mt-5 rounded-2xl bg-[linear-gradient(135deg,_#eef3ff_0%,_#ffffff_100%)] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Хорошее название модуля сразу задает структуру курса: например,
                «Введение», «Работа с клиентом», «Сделка под ключ».
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="new-module-title">Название модуля</Label>
              <Input
                id="new-module-title"
                name="title"
                placeholder="Например, Модуль 1. Введение в профессию риэлтора"
                required
              />
            </div>

            <Button type="submit">Создать модуль</Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {course.modules.length === 0 ? (
          <article className="rounded-[24px] border border-dashed border-[var(--border)] bg-white p-8 shadow-sm">
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Пока нет ни одного модуля
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Создай первый модуль, и внутри него откроется редактор уроков.
            </p>
          </article>
        ) : (
          course.modules.map((module) => (
            <article
              key={module.id}
              className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
            >
              <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
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
                      <Label htmlFor={`module-title-${module.id}`}>
                        Название модуля
                      </Label>
                      <Input
                        id={`module-title-${module.id}`}
                        name="title"
                        defaultValue={module.title}
                        required
                      />
                    </div>

                    <Button type="submit">Сохранить модуль</Button>
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
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
                  >
                    <input type="hidden" name="moduleId" value={module.id} />

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        Добавить урок
                      </p>
                      <p className="text-sm leading-6 text-[var(--muted)]">
                        Сначала укажи рабочее название и тип материала. После
                        создания откроется полная карточка урока с видео,
                        текстом и настройками доступа.
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <BookOpen className="h-5 w-5 text-[var(--primary)]" />
                        <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                          Что писать в названии
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          Короткий результат урока: например, «Подготовка объекта
                          к показу».
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <Film className="h-5 w-5 text-[var(--primary)]" />
                        <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                          Что настраивается потом
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          Внутри карточки урока можно добавить видео, текст,
                          превью и отложенный доступ.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-end">
                      <div className="space-y-2 xl:col-span-3">
                        <Label htmlFor={`new-lesson-title-${module.id}`}>
                          Название урока
                        </Label>
                        <Input
                          id={`new-lesson-title-${module.id}`}
                          name="title"
                          placeholder="Например, Подготовка объекта к показу"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`new-lesson-type-${module.id}`}>
                          Тип материала
                        </Label>
                        <Select
                          id={`new-lesson-type-${module.id}`}
                          name="type"
                          defaultValue={LessonType.TEXT}
                        >
                          {Object.values(LessonType).map((type) => (
                            <option key={type} value={type}>
                              {lessonTypeLabelMap[type]}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="flex xl:block">
                        <Button type="submit" className="w-full xl:w-auto">
                          Создать урок
                        </Button>
                      </div>
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
                                  {lesson.accessAfterDays !== null &&
                                  lesson.accessAfterDays !== undefined
                                    ? ` · откроется через ${lesson.accessAfterDays} дн.`
                                    : ""}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Badge>{lessonTypeLabelMap[lesson.type]}</Badge>
                                {lesson.isPreview ? (
                                  <Badge variant="success">Открытый урок</Badge>
                                ) : null}
                                {lesson.videoAsset ? (
                                  <Badge variant="neutral">
                                    {
                                      mediaSourceTypeLabelMap[
                                        lesson.videoAsset.sourceType
                                      ]
                                    }
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
                                <Label htmlFor={`lesson-title-${lesson.id}`}>
                                  Название урока
                                </Label>
                                <Input
                                  id={`lesson-title-${lesson.id}`}
                                  name="title"
                                  defaultValue={lesson.title}
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`lesson-type-${lesson.id}`}>
                                  Тип материала
                                </Label>
                                <Select
                                  id={`lesson-type-${lesson.id}`}
                                  name="type"
                                  defaultValue={lesson.type}
                                >
                                  {Object.values(LessonType).map((type) => (
                                    <option key={type} value={type}>
                                      {lessonTypeLabelMap[type]}
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
                                <p className="text-sm leading-6 text-[var(--muted)]">
                                  Короткая подводка к уроку. Покажи, что именно
                                  ученик изучит внутри этого материала.
                                </p>
                              </div>

                              <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor={`lesson-content-${lesson.id}`}>
                                  Текст урока
                                </Label>
                                <Textarea
                                  id={`lesson-content-${lesson.id}`}
                                  name="contentText"
                                  defaultValue={extractLessonBody(lesson.content)}
                                  className="min-h-36"
                                />
                                <p className="text-sm leading-6 text-[var(--muted)]">
                                  Текстовая часть урока: конспект, пошаговый
                                  план, чек-лист или дополнительные материалы.
                                </p>
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
                                <p className="text-sm leading-6 text-[var(--muted)]">
                                  Если оставить пустым, урок будет доступен
                                  сразу после выдачи курса.
                                </p>
                              </div>

                              <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)]">
                                <input
                                  type="checkbox"
                                  name="isPreview"
                                  defaultChecked={lesson.isPreview}
                                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                                />
                                Доступен как открытый урок
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
                                    errorMessage:
                                      lesson.videoAsset.errorMessage ?? null,
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
  );
}
