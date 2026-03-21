import Link from "next/link";

import { LessonType, prisma } from "@academy/db";
import {
  BookOpen,
  ChevronRight,
  Film,
  Layers3,
  Link2,
  Paperclip,
  Plus,
  Sparkles,
} from "lucide-react";
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
import { getCourseLessonCount } from "@/features/admin/course-page-data";
import {
  extractLessonBody,
  extractPrimaryLessonAttachment,
} from "@/lib/lesson-content";
import { lessonTypeLabelMap, mediaSourceTypeLabelMap } from "@/lib/labels";

type CourseContentPageProps = {
  params: Promise<{
    courseId: string;
  }>;
  searchParams?: Promise<{
    moduleId?: string;
    lessonId?: string;
  }>;
};

function buildModuleLink(courseId: string, moduleId: string, lessonId?: string) {
  const query = lessonId ? `?moduleId=${moduleId}&lessonId=${lessonId}` : `?moduleId=${moduleId}`;
  return `/admin/courses/${courseId}/content${query}`;
}

export default async function CourseContentPage({
  params,
  searchParams,
}: CourseContentPageProps) {
  const { courseId } = await params;
  const resolvedSearchParams = (searchParams ? await searchParams : {}) as {
    moduleId?: string;
    lessonId?: string;
  };

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
  const selectedModule =
    course.modules.find((module) => module.id === resolvedSearchParams.moduleId) ??
    course.modules[0] ??
    null;
  const selectedLesson =
    selectedModule?.lessons.find(
      (lesson) => lesson.id === resolvedSearchParams.lessonId,
    ) ??
    selectedModule?.lessons[0] ??
    null;
  const selectedAttachment = selectedLesson
    ? extractPrimaryLessonAttachment(selectedLesson.content)
    : null;

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-6 self-start">
          <article className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3">
                <Layers3 className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Программа
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                  Модули курса
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Модули стоят слева как навигация по курсу. Внутри каждого модуля живут
              уроки, а сам редактор выбранного урока открыт справа.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-sm text-[var(--muted)]">
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
            className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-sm"
          >
            <input type="hidden" name="courseId" value={course.id} />

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Новый модуль
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                Добавить раздел
              </h2>
              <p className="text-sm leading-7 text-[var(--muted)]">
                Название должно сразу объяснять, какой смысловой блок стоит внутри.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <Input
                name="title"
                placeholder="Например, Введение в профессию"
                required
              />
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Создать модуль
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {course.modules.length === 0 ? (
              <article className="rounded-[24px] border border-dashed border-[var(--border)] bg-white p-5 text-sm leading-7 text-[var(--muted)] shadow-sm">
                Пока нет ни одного модуля. Создай первый раздел слева, и откроется
                нормальный editor workflow.
              </article>
            ) : (
              course.modules.map((module) => {
                const moduleActive = selectedModule?.id === module.id;

                return (
                  <article
                    key={module.id}
                    className={`rounded-[26px] border bg-white p-4 shadow-sm transition ${
                      moduleActive
                        ? "border-[var(--primary)] shadow-[0_18px_40px_rgba(111,139,251,0.12)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <Link
                      href={buildModuleLink(course.id, module.id)}
                      className="block rounded-2xl"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                            Модуль {module.position}
                          </p>
                          <h3 className="mt-2 text-base font-semibold leading-6 text-[var(--foreground)]">
                            {module.title}
                          </h3>
                        </div>
                        <span className="rounded-full bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--muted)]">
                          {module.lessons.length}
                        </span>
                      </div>
                    </Link>

                    <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
                      {module.lessons.length === 0 ? (
                        <p className="text-sm leading-6 text-[var(--muted)]">
                          В этом модуле пока нет уроков.
                        </p>
                      ) : (
                        module.lessons.map((lesson) => {
                          const lessonActive = selectedLesson?.id === lesson.id;

                          return (
                            <Link
                              key={lesson.id}
                              href={buildModuleLink(course.id, module.id, lesson.id)}
                              className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                                lessonActive
                                  ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]"
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate font-medium text-[var(--foreground)]">
                                  {lesson.title}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                                  {lessonTypeLabelMap[lesson.type]}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 flex-none text-[var(--muted)]" />
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </aside>

        <div className="space-y-6">
          {!selectedModule ? (
            <article className="rounded-[28px] border border-dashed border-[var(--border)] bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Создай первый модуль
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                После этого слева появится структура программы, а справа откроется
                рабочая область редактирования.
              </p>
            </article>
          ) : (
            <>
              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                <form
                  action={updateModule}
                  className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm"
                >
                  <input type="hidden" name="moduleId" value={selectedModule.id} />
                  <input type="hidden" name="courseId" value={course.id} />

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="neutral">Модуль {selectedModule.position}</Badge>
                      <span className="text-sm text-[var(--muted)]">
                        Уроков: {selectedModule.lessons.length}
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      Настройки выбранного модуля
                    </h2>
                    <p className="text-sm leading-7 text-[var(--muted)]">
                      Здесь меняется название текущего раздела. Сами уроки модуля
                      редактируются ниже в центральной рабочей области.
                    </p>
                  </div>

                  <div className="mt-5 space-y-2">
                    <Label htmlFor={`selected-module-${selectedModule.id}`}>
                      Название модуля
                    </Label>
                    <Input
                      id={`selected-module-${selectedModule.id}`}
                      name="title"
                      defaultValue={selectedModule.title}
                      required
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button type="submit">Сохранить модуль</Button>
                    <Button
                      type="submit"
                      formAction={deleteModule}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Удалить модуль
                    </Button>
                  </div>
                </form>

                <form
                  action={createLesson}
                  className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm"
                >
                  <input type="hidden" name="moduleId" value={selectedModule.id} />

                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                      Новый урок
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      Добавить материал в модуль
                    </h2>
                    <p className="text-sm leading-7 text-[var(--muted)]">
                      Урок можно будет наполнить и текстом, и видео, и прикрепленным
                      файлом. Тип здесь нужен только как основной формат, а не как
                      ограничение.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[var(--surface)] p-4">
                      <BookOpen className="h-5 w-5 text-[var(--primary)]" />
                      <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                        Что писать в названии
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        Лучше писать результат урока: например, “Подготовка объекта к
                        показу”.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[var(--surface)] p-4">
                      <Film className="h-5 w-5 text-[var(--primary)]" />
                      <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                        Что будет внутри
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        После создания откроется карточка урока с текстом, видео,
                        ссылкой на файл и настройками доступа.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`new-lesson-title-${selectedModule.id}`}>
                        Название урока
                      </Label>
                      <Input
                        id={`new-lesson-title-${selectedModule.id}`}
                        name="title"
                        placeholder="Например, Подготовка объекта к показу"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                      <div className="space-y-2">
                        <Label htmlFor={`new-lesson-type-${selectedModule.id}`}>
                          Основной формат
                        </Label>
                        <Select
                          id={`new-lesson-type-${selectedModule.id}`}
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

                      <Button type="submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Создать урок
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

              {!selectedLesson ? (
                <article className="rounded-[28px] border border-dashed border-[var(--border)] bg-white p-8 shadow-sm">
                  <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    В модуле пока нет уроков
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                    Создай первый урок в выбранном модуле. После этого справа откроется
                    полноценный editor с текстом, видео и вложением.
                  </p>
                </article>
              ) : (
                <form
                  action={updateLesson}
                  className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]"
                >
                  <input type="hidden" name="lessonId" value={selectedLesson.id} />
                  <input type="hidden" name="moduleId" value={selectedModule.id} />
                  <input type="hidden" name="courseId" value={course.id} />

                  <div className="space-y-6">
                    <article className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{lessonTypeLabelMap[selectedLesson.type]}</Badge>
                          {selectedLesson.isPreview ? (
                            <Badge variant="success">Открытый урок</Badge>
                          ) : null}
                          {selectedLesson.videoAsset ? (
                            <Badge variant="neutral">
                              {
                                mediaSourceTypeLabelMap[
                                  selectedLesson.videoAsset.sourceType
                                ]
                              }
                            </Badge>
                          ) : null}
                        </div>

                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
                            {selectedModule.title}
                          </p>
                          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                            Редактор урока
                          </h2>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-5">
                        <div className="space-y-2">
                          <Label htmlFor={`lesson-title-${selectedLesson.id}`}>
                            Название урока
                          </Label>
                          <Input
                            id={`lesson-title-${selectedLesson.id}`}
                            name="title"
                            defaultValue={selectedLesson.title}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`lesson-excerpt-${selectedLesson.id}`}>
                            Краткое описание
                          </Label>
                          <Textarea
                            id={`lesson-excerpt-${selectedLesson.id}`}
                            name="excerpt"
                            defaultValue={selectedLesson.excerpt ?? ""}
                            className="min-h-24"
                          />
                          <p className="text-sm leading-6 text-[var(--muted)]">
                            Короткая подводка к уроку. Здесь стоит объяснить, что
                            именно ученик получит после просмотра и чтения этого
                            материала.
                          </p>
                        </div>
                      </div>
                    </article>

                    <article className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                          Текст урока
                        </h3>
                        <p className="text-sm leading-7 text-[var(--muted)]">
                          Основной конспект, пошаговый план, чек-лист, домашнее
                          задание или пояснения к видео.
                        </p>
                      </div>

                      <div className="mt-5 space-y-2">
                        <Textarea
                          id={`lesson-content-${selectedLesson.id}`}
                          name="contentText"
                          defaultValue={extractLessonBody(selectedLesson.content)}
                          className="min-h-56"
                        />
                      </div>
                    </article>

                    <article className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-[var(--primary-soft)] p-3">
                            <Paperclip className="h-5 w-5 text-[var(--primary)]" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                              Прикрепленный материал
                            </h3>
                            <p className="text-sm leading-6 text-[var(--muted)]">
                              В одном уроке можно держать и текст, и видео, и
                              дополнительный файл по ссылке.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                        <div className="space-y-2">
                          <Label htmlFor={`attachment-title-${selectedLesson.id}`}>
                            Название материала
                          </Label>
                          <Input
                            id={`attachment-title-${selectedLesson.id}`}
                            name="attachmentTitle"
                            defaultValue={selectedAttachment?.title ?? ""}
                            placeholder="Например, Шаблон договора"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`attachment-url-${selectedLesson.id}`}>
                            Ссылка на файл
                          </Label>
                          <Input
                            id={`attachment-url-${selectedLesson.id}`}
                            name="attachmentUrl"
                            defaultValue={selectedAttachment?.url ?? ""}
                            placeholder="https://disk.yandex.ru/... или https://example.com/file.pdf"
                          />
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-[var(--surface)] p-4">
                        <div className="flex items-start gap-3">
                          <Link2 className="mt-1 h-5 w-5 flex-none text-[var(--primary)]" />
                          <p className="text-sm leading-7 text-[var(--muted)]">
                            На этом этапе прикрепление идет по ссылке. Это уже
                            позволит приложить PDF, чек-лист, шаблон документа,
                            таблицу или внешний материал. Если понадобится, потом
                            добавим и собственное файловое хранилище.
                          </p>
                        </div>
                      </div>
                    </article>

                    <AdminLessonVideoManager
                      lessonId={selectedLesson.id}
                      initialAsset={
                        selectedLesson.videoAsset
                          ? {
                              id: selectedLesson.videoAsset.id,
                              provider: selectedLesson.videoAsset.provider,
                              sourceType: selectedLesson.videoAsset.sourceType,
                              status: selectedLesson.videoAsset.status,
                              originalFilename:
                                selectedLesson.videoAsset.originalFilename ?? null,
                              sourceUrl: selectedLesson.videoAsset.sourceUrl ?? null,
                              playerUrl: selectedLesson.videoAsset.playerUrl ?? null,
                              playbackId: selectedLesson.videoAsset.playbackId ?? null,
                              errorMessage:
                                selectedLesson.videoAsset.errorMessage ?? null,
                            }
                          : null
                      }
                      fallbackVideoSourceType={selectedLesson.videoSourceType}
                      fallbackVideoUrl={selectedLesson.videoUrl}
                      fallbackVideoPlaybackId={selectedLesson.videoPlaybackId}
                    />
                  </div>

                  <div className="space-y-6">
                    <article className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                        Настройки урока
                      </p>

                      <div className="mt-5 space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor={`lesson-type-${selectedLesson.id}`}>
                            Основной формат
                          </Label>
                          <Select
                            id={`lesson-type-${selectedLesson.id}`}
                            name="type"
                            defaultValue={selectedLesson.type}
                          >
                            {Object.values(LessonType).map((type) => (
                              <option key={type} value={type}>
                                {lessonTypeLabelMap[type]}
                              </option>
                            ))}
                          </Select>
                          <p className="text-sm leading-6 text-[var(--muted)]">
                            Это не ограничивает содержимое. Урок все равно может
                            содержать текст, видео и файл одновременно.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`lesson-delay-${selectedLesson.id}`}>
                            Открыть через дней
                          </Label>
                          <Input
                            id={`lesson-delay-${selectedLesson.id}`}
                            name="accessAfterDays"
                            type="number"
                            min={0}
                            defaultValue={selectedLesson.accessAfterDays ?? ""}
                          />
                          <p className="text-sm leading-6 text-[var(--muted)]">
                            Если оставить пустым, урок будет доступен сразу после
                            выдачи курса.
                          </p>
                        </div>

                        <label className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--foreground)]">
                          <input
                            type="checkbox"
                            name="isPreview"
                            defaultChecked={selectedLesson.isPreview}
                            className="mt-1 h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                          />
                          <span>
                            <span className="block font-medium">Открытый урок</span>
                            <span className="mt-1 block leading-6 text-[var(--muted)]">
                              Можно показывать без записи на курс как превью или
                              прогревающий материал.
                            </span>
                          </span>
                        </label>
                      </div>

                      <div className="mt-6 flex flex-col gap-3">
                        <Button type="submit" className="w-full">
                          Сохранить урок
                        </Button>
                        <Button
                          type="submit"
                          formAction={deleteLesson}
                          variant="outline"
                          className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Удалить урок
                        </Button>
                      </div>
                    </article>

                    <article className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-[var(--primary-soft)] p-3">
                          <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                            Как мыслить уроком
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                            Хороший урок обычно состоит из трех слоев: краткая
                            подводка, основное содержание и прикрепленный материал
                            для действия после просмотра.
                          </p>
                        </div>
                      </div>
                    </article>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
