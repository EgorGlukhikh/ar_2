import { LessonType, prisma } from "@academy/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  CircleHelp,
  Layers3,
  MessageSquareMore,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { LessonBlockStudio } from "@/components/admin/lesson-block-studio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  updateLesson,
  updateModule,
} from "@/features/admin/course-actions";
import { extractLessonBlocks, type LessonBlock } from "@/lib/lesson-content";
import {
  lessonTypeLabelMap,
} from "@/lib/labels";

type CourseContentPageProps = {
  params: Promise<{
    courseId: string;
  }>;
  searchParams?: Promise<{
    moduleId?: string;
    lessonId?: string;
  }>;
};

function buildContentHref(courseId: string, moduleId?: string, lessonId?: string) {
  const search = new URLSearchParams();

  if (moduleId) {
    search.set("moduleId", moduleId);
  }

  if (lessonId) {
    search.set("lessonId", lessonId);
  }

  const query = search.toString();
  return query
    ? `/admin/courses/${courseId}/content?${query}`
    : `/admin/courses/${courseId}/content`;
}

function getLessonBlocks(lesson: {
  type: LessonType;
  content: unknown;
  videoAsset: unknown;
  videoSourceType: unknown;
  videoUrl: unknown;
  videoPlaybackId: unknown;
}): LessonBlock[] {
  const extractedBlocks = extractLessonBlocks(lesson.content);

  if (extractedBlocks.length > 0) {
    return extractedBlocks;
  }

  if (lesson.videoAsset || lesson.videoSourceType || lesson.videoUrl || lesson.videoPlaybackId) {
    return [
      {
        id: "legacy-video",
        type: "VIDEO",
        title: "Видео",
        body: "",
      },
    ];
  }

  if (lesson.type === LessonType.HOMEWORK) {
    return [
      {
        id: "legacy-homework",
        type: "HOMEWORK",
        title: "Домашняя работа",
        body: "",
        submissionHint: "",
      },
    ];
  }

  return [];
}

function ModuleTreeItem({
  courseId,
  moduleItem,
  selectedModuleId,
  selectedLessonId,
}: {
  courseId: string;
  moduleItem: {
    id: string;
    title: string;
    position: number;
    lessons: Array<{
      id: string;
      title: string;
      type: LessonType;
    }>;
  };
  selectedModuleId: string | null;
  selectedLessonId: string | null;
}) {
  const isActiveModule = selectedModuleId === moduleItem.id;

  return (
    <div
      className={`rounded-[24px] border p-4 transition ${
        isActiveModule
          ? "border-[var(--primary)] bg-[var(--primary-soft)]/50"
          : "border-[var(--border)] bg-white"
      }`}
    >
      <Link
        href={buildContentHref(courseId, moduleItem.id)}
        className="flex items-start justify-between gap-3 rounded-2xl transition hover:text-[var(--foreground)]"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Модуль {moduleItem.position}
          </p>
          <p className="mt-2 truncate text-base font-semibold text-[var(--foreground)]">
            {moduleItem.title}
          </p>
        </div>

        <Badge variant="neutral">{moduleItem.lessons.length}</Badge>
      </Link>

      <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
        {moduleItem.lessons.length === 0 ? (
          <p className="text-sm leading-6 text-[var(--muted)]">
            В этом модуле пока нет уроков.
          </p>
        ) : (
          moduleItem.lessons.map((lesson) => {
            const isActiveLesson = selectedLessonId === lesson.id;

            return (
              <Link
                key={lesson.id}
                href={buildContentHref(courseId, moduleItem.id, lesson.id)}
                className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                  isActiveLesson
                    ? "bg-white text-[var(--foreground)] shadow-sm ring-1 ring-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{lesson.title}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    {lessonTypeLabelMap[lesson.type]}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

export default async function CourseContentPage({
  params,
  searchParams,
}: CourseContentPageProps) {
  const { courseId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

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
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              title: true,
              position: true,
              type: true,
              excerpt: true,
              isPreview: true,
              accessAfterDays: true,
              content: true,
              videoSourceType: true,
              videoUrl: true,
              videoPlaybackId: true,
              videoAsset: {
                select: {
                  id: true,
                  provider: true,
                  sourceType: true,
                  status: true,
                  originalFilename: true,
                  sourceUrl: true,
                  playerUrl: true,
                  playbackId: true,
                  errorMessage: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const lessonOwnerModule =
    course.modules.find((moduleItem) =>
      moduleItem.lessons.some((lesson) => lesson.id === resolvedSearchParams.lessonId),
    ) ?? null;

  const selectedModule =
    lessonOwnerModule ??
    course.modules.find((moduleItem) => moduleItem.id === resolvedSearchParams.moduleId) ??
    course.modules[0] ??
    null;

  const selectedLesson =
    selectedModule?.lessons.find((lesson) => lesson.id === resolvedSearchParams.lessonId) ??
    selectedModule?.lessons[0] ??
    null;

  const selectedLessonBlocks = selectedLesson ? getLessonBlocks(selectedLesson) : [];

  return (
    <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <article className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Структура курса
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Модули и уроки
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Добавляй модули вручную, внутри них создавай уроки и сразу открывай нужный урок в
              центре для редактирования.
            </p>

            <form action={createModule} className="mt-5 space-y-3">
              <input type="hidden" name="courseId" value={course.id} />
              <Label htmlFor="new-module-title">Новый модуль</Label>
              <Input
                id="new-module-title"
                name="title"
                placeholder="Например, Введение в профессию"
                required
              />
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Добавить модуль
              </Button>
            </form>
          </article>

          {selectedModule ? (
            <article className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Выбранный модуль
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {selectedModule.title}
              </h3>

              <form action={updateModule} className="mt-5 space-y-3">
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="moduleId" value={selectedModule.id} />
                <Label htmlFor="selected-module-title">Название модуля</Label>
                <Input
                  id="selected-module-title"
                  name="title"
                  defaultValue={selectedModule.title}
                  required
                />
                <Button type="submit" variant="outline" className="w-full">
                  Сохранить название
                </Button>
              </form>

              <form action={createLesson} className="mt-5 space-y-3">
                <input type="hidden" name="moduleId" value={selectedModule.id} />
                <Label htmlFor="new-lesson-title">Новый урок</Label>
                <Input
                  id="new-lesson-title"
                  name="title"
                  placeholder="Например, Подготовка объекта к показу"
                  required
                />
                <input type="hidden" name="type" value={LessonType.TEXT} />
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить урок
                </Button>
              </form>

              <form action={deleteModule} className="mt-5">
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="moduleId" value={selectedModule.id} />
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить модуль
                </Button>
              </form>
            </article>
          ) : null}

          <div className="space-y-3">
            {course.modules.length === 0 ? (
              <article className="rounded-[28px] border border-dashed border-[var(--border)] bg-white p-5 text-sm leading-7 text-[var(--muted)] shadow-sm">
                В курсе пока нет модулей. Создай первый модуль, и структура курса появится здесь.
              </article>
            ) : (
              course.modules.map((moduleItem) => (
                <ModuleTreeItem
                  key={moduleItem.id}
                  courseId={course.id}
                  moduleItem={moduleItem}
                  selectedModuleId={selectedModule?.id ?? null}
                  selectedLessonId={selectedLesson?.id ?? null}
                />
              ))
            )}
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {!selectedModule ? (
            <article className="rounded-[28px] border border-dashed border-[var(--border)] bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Пустой курс
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                Сначала создай первый модуль
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                После этого можно будет добавлять уроки и собирать их из блоков прямо в центральной
                рабочей области.
              </p>
            </article>
          ) : !selectedLesson ? (
            <article className="rounded-[28px] border border-dashed border-[var(--border)] bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Модуль без уроков
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                Добавь первый урок в модуль
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Как только урок появится, здесь откроется его редактор. Внутри урока можно будет
                собрать несколько блоков: текст, видео, файл и задание.
              </p>
            </article>
          ) : (
            <>
              <article className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral">{selectedModule.title}</Badge>
                      <Badge>{lessonTypeLabelMap[selectedLesson.type]}</Badge>
                      {selectedLesson.isPreview ? (
                        <Badge variant="success">Открытый урок</Badge>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                        Редактор урока
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                        {selectedLesson.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                      <Link href={`/learning/courses/${course.id}?lessonId=${selectedLesson.id}`}>
                        Проверить как студент
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>

              <form action={updateLesson} className="space-y-6">
                <input type="hidden" name="lessonId" value={selectedLesson.id} />
                <input type="hidden" name="moduleId" value={selectedModule.id} />
                <input type="hidden" name="type" value={selectedLesson.type} />

                <article className="rounded-[28px] border border-[var(--border)] bg-white shadow-sm">
                  <details open className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                          Настройки урока
                        </p>
                        <h3 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                          Основная информация
                        </h3>
                      </div>

                      <div className="text-sm font-medium text-[var(--muted)] transition group-open:rotate-180">
                        <ChevronRight className="h-5 w-5 rotate-90 group-open:-rotate-90" />
                      </div>
                    </summary>

                    <div className="border-t border-[var(--border)] px-6 py-6">
                      <div className="grid gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="lesson-title">Название урока</Label>
                          <Input
                            id="lesson-title"
                            name="title"
                            defaultValue={selectedLesson.title}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lesson-excerpt">Краткое описание</Label>
                          <Textarea
                            id="lesson-excerpt"
                            name="excerpt"
                            defaultValue={selectedLesson.excerpt ?? ""}
                            className="min-h-[120px]"
                            placeholder="Коротко объясни, что ученик получит в этом уроке."
                          />
                        </div>

                        <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                          <div className="space-y-2">
                            <Label htmlFor="lesson-access-after">Открыть через дней</Label>
                            <Input
                              id="lesson-access-after"
                              name="accessAfterDays"
                              type="number"
                              min={0}
                              defaultValue={selectedLesson.accessAfterDays ?? ""}
                              placeholder="Например, 7"
                            />
                            <p className="text-sm leading-6 text-[var(--muted)]">
                              Если оставить пустым, урок доступен сразу.
                            </p>
                          </div>

                          <label className="flex items-start gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                            <input
                              type="checkbox"
                              name="isPreview"
                              defaultChecked={selectedLesson.isPreview}
                              className="mt-1 h-4 w-4 rounded border-[#cfd7f3] text-[var(--primary)] focus:ring-[var(--primary-soft)]"
                            />
                            <span className="space-y-1">
                              <span className="block font-medium text-[var(--foreground)]">
                                Открытый урок
                              </span>
                              <span className="block text-sm leading-6 text-[var(--muted)]">
                                Можно показывать без записи как превью или прогревающий материал.
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </details>
                </article>

                <article className="rounded-[28px] border border-[var(--border)] bg-white shadow-sm">
                  <details open className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                          Контент урока
                        </p>
                        <h3 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                          Блоки урока
                        </h3>
                      </div>

                      <div className="text-sm font-medium text-[var(--muted)] transition group-open:rotate-180">
                        <ChevronRight className="h-5 w-5 rotate-90 group-open:-rotate-90" />
                      </div>
                    </summary>

                    <div className="border-t border-[var(--border)] px-6 py-6">
                      <LessonBlockStudio
                        lessonId={selectedLesson.id}
                        initialBlocks={selectedLessonBlocks}
                        initialAsset={selectedLesson.videoAsset}
                        fallbackVideoSourceType={selectedLesson.videoSourceType}
                        fallbackVideoUrl={selectedLesson.videoUrl}
                        fallbackVideoPlaybackId={selectedLesson.videoPlaybackId}
                      />
                    </div>
                  </details>
                </article>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить урок
                  </Button>
                </div>
              </form>

              <form action={deleteLesson} className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="lessonId" value={selectedLesson.id} />
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Опасная зона
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                  Удаление урока
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                  Удали урок только если он больше не нужен. Если нужно просто спрятать материал,
                  лучше изменить структуру модулей или оставить урок черновиком внутри курса.
                </p>
                <div className="mt-5">
                  <Button
                    type="submit"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить урок
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <article className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                <CircleHelp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Поддержка редактора
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                  Как собирать хороший урок
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--muted)]">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="font-medium text-[var(--foreground)]">1. Начни с одного тезиса</p>
                <p className="mt-1">
                  Сначала коротко объясни, чему посвящен урок и какой результат должен получить
                  студент.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="font-medium text-[var(--foreground)]">2. Собери блоки по логике</p>
                <p className="mt-1">
                  Обычно хороший сценарий выглядит так: вводный текст, видео или материал, затем
                  действие и домашняя работа.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="font-medium text-[var(--foreground)]">3. Используй перестановку</p>
                <p className="mt-1">
                  Блоки можно перетаскивать между собой, поэтому сначала собери черновую структуру,
                  а порядок уточни позже.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Комментарии
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                  Зона для команды
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--muted)]">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="font-medium text-[var(--foreground)]">Что будет дальше</p>
                <p className="mt-1">
                  Следующим отдельным слоем сюда можно вынести inline-комментарии методиста и чат
                  сопровождения без перегрузки редактора настройками.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="font-medium text-[var(--foreground)]">Пока используем этот ритм</p>
                <p className="mt-1">
                  Слева структура курса, в центре контент урока, справа только помощь и рабочие
                  договоренности команды.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                <Layers3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Типы блоков
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                  Что можно добавить в урок
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "Текст: конспект, инструкция, сценарий урока.",
                "Видео: private RUTUBE, embed или файл с компьютера.",
                "Файл: шаблон, PDF, чек-лист или рабочий документ.",
                "Задание: домашняя работа с условиями и правилами сдачи.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </aside>
    </section>
  );
}
