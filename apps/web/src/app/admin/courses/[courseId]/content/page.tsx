import { LessonType, prisma } from "@academy/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronRight, Plus, Save, Trash2 } from "lucide-react";

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
  moveLessonToModule,
  updateLesson,
  updateModule,
} from "@/features/admin/course-actions";
import { extractLessonBlocks, type LessonBlock } from "@/lib/lesson-content";
import { canEditCourseContent, requireWorkspaceUser } from "@/lib/admin";

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
      className={`rounded-[24px] border transition ${
        isActiveModule
          ? "border-[var(--primary)] bg-[var(--primary-soft)]/45"
          : "border-[var(--border)] bg-white"
      }`}
    >
      <Link
        href={buildContentHref(courseId, moduleItem.id)}
        className="flex items-center justify-between gap-3 px-4 py-3"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Модуль {moduleItem.position}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">
            {moduleItem.title}
          </p>
        </div>

        <Badge variant="neutral">{moduleItem.lessons.length}</Badge>
      </Link>

      <div className="border-t border-[var(--border)] px-3 py-3">
        {moduleItem.lessons.length === 0 ? (
          <p className="px-1 text-sm text-[var(--muted)]">Пока без уроков.</p>
        ) : (
          <div className="space-y-1">
            {moduleItem.lessons.map((lesson, index) => {
              const isActiveLesson = selectedLessonId === lesson.id;

              return (
                <Link
                  key={lesson.id}
                  href={buildContentHref(courseId, moduleItem.id, lesson.id)}
                  className={`flex items-center justify-between gap-3 rounded-[18px] px-3 py-2.5 transition ${
                    isActiveLesson
                      ? "bg-white text-[var(--foreground)] shadow-sm ring-1 ring-[var(--primary)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {index + 1}. {lesson.title}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyStudio({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <article className="rounded-[28px] border border-dashed border-[var(--border)] bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </article>
  );
}

export default async function CourseContentPage({
  params,
  searchParams,
}: CourseContentPageProps) {
  const viewer = await requireWorkspaceUser();
  const { courseId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      authorId: true,
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
              homeworkAssignment: {
                select: {
                  id: true,
                  requiresCuratorReview: true,
                  unlockNextModuleOnApproval: true,
                  allowTextSubmission: true,
                  allowLinkSubmission: true,
                  allowFileUpload: true,
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

  if (!canEditCourseContent(viewer, course.authorId)) {
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
  const hasHomeworkBlock = selectedLessonBlocks.some((block) => block.type === "HOMEWORK");

  return (
    <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <article className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Программа курса
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Модули и уроки
            </h2>
          </div>

          <form action={createModule} className="mt-5 space-y-3">
            <input type="hidden" name="courseId" value={course.id} />
            <Input
              name="title"
              placeholder="Название нового модуля"
              required
            />
            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Добавить модуль
            </Button>
          </form>
        </article>

        <div className="space-y-3">
          {course.modules.length === 0 ? (
            <article className="rounded-[24px] border border-dashed border-[var(--border)] bg-white p-5 text-sm text-[var(--muted)] shadow-sm">
              Модулей пока нет. Создай первый, и структура курса появится здесь.
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
          <EmptyStudio
            title="Создай первый модуль"
            description="Когда появится модуль, здесь откроется рабочая область курса: добавление уроков и редактирование их блоков."
          />
        ) : (
          <>
            <article className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Выбранный модуль
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                    {selectedModule.title}
                  </h2>
                  <p className="text-sm leading-7 text-[var(--muted)]">
                    Уроки этого модуля видны слева. Создавай новые уроки здесь же, чтобы они сразу открывались в редакторе.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedLesson ? (
                    <Button asChild variant="outline">
                      <Link href={`/learning/courses/${course.id}?lessonId=${selectedLesson.id}`}>
                        Проверить как студент
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <form action={updateModule} className="space-y-3 rounded-[24px] bg-[var(--surface)] p-4">
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="moduleId" value={selectedModule.id} />
                  <Label htmlFor="selected-module-title">Название модуля</Label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      id="selected-module-title"
                      name="title"
                      defaultValue={selectedModule.title}
                      required
                    />
                    <Button type="submit" variant="outline" className="sm:min-w-[180px]">
                      Сохранить название
                    </Button>
                  </div>
                </form>

                <form action={createLesson} className="space-y-3 rounded-[24px] bg-[var(--surface)] p-4">
                  <input type="hidden" name="moduleId" value={selectedModule.id} />
                  <input type="hidden" name="type" value={LessonType.TEXT} />
                  <Label htmlFor="new-lesson-title">Новый урок</Label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      id="new-lesson-title"
                      name="title"
                      placeholder="Например, Вводное занятие"
                      required
                    />
                    <Button type="submit" className="sm:min-w-[180px]">
                      <Plus className="mr-2 h-4 w-4" />
                      Добавить урок
                    </Button>
                  </div>
                </form>
              </div>

              <div className="mt-4">
                <form action={deleteModule}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="moduleId" value={selectedModule.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить модуль
                  </Button>
                </form>
              </div>
            </article>

            {!selectedLesson ? (
              <EmptyStudio
                title="Добавь первый урок в модуль"
                description="Как только урок появится, здесь откроется его редактор. Внутри урока можно собрать текст, видео, файл и домашнюю работу."
              />
            ) : (
              <>
                <form id="move-lesson-form" action={moveLessonToModule}>
                  <input type="hidden" name="lessonId" value={selectedLesson.id} />
                </form>

                <form action={updateLesson} className="space-y-6">
                  <input type="hidden" name="lessonId" value={selectedLesson.id} />
                  <input type="hidden" name="moduleId" value={selectedModule.id} />
                  <input type="hidden" name="type" value={selectedLesson.type} />

                  <article className="rounded-[28px] border border-[var(--border)] bg-white shadow-sm">
                    <details open className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                            Редактор урока
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                            Основная информация
                          </h3>
                        </div>

                        <ChevronRight className="h-5 w-5 rotate-90 text-[var(--muted)] transition group-open:-rotate-90" />
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
                              placeholder="Коротко объясни, что студент получит в этом уроке."
                            />
                          </div>

                          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
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
                            </div>

                            <label className="flex items-start gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                              <input
                                type="checkbox"
                                name="isPreview"
                                defaultChecked={selectedLesson.isPreview}
                                className="mt-1 h-4 w-4 rounded border-[#cfd7f3] text-[var(--primary)] focus:ring-[var(--primary-soft)]"
                              />
                              <span>
                                <span className="block font-medium text-[var(--foreground)]">
                                  Открытый урок
                                </span>
                                <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
                                  Можно показывать без записи как превью.
                                </span>
                              </span>
                            </label>
                          </div>

                          {course.modules.length > 1 ? (
                            <div className="space-y-2 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4">
                              <Label htmlFor="move-lesson-module">Модуль урока</Label>
                              <div className="flex flex-col gap-3 sm:flex-row">
                                <select
                                  id="move-lesson-module"
                                  name="targetModuleId"
                                  form="move-lesson-form"
                                  defaultValue={selectedModule.id}
                                  className="h-11 min-w-0 rounded-[16px] border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                                >
                                  {course.modules.map((moduleItem) => (
                                    <option key={moduleItem.id} value={moduleItem.id}>
                                      Модуль {moduleItem.position}. {moduleItem.title}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  type="submit"
                                  form="move-lesson-form"
                                  variant="outline"
                                  className="sm:min-w-[180px]"
                                >
                                  Переместить урок
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </details>
                  </article>

                  <article className="rounded-[28px] border border-[var(--border)] bg-white shadow-sm">
                    <details open className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                            Конструктор урока
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                            Блоки урока
                          </h3>
                        </div>

                        <ChevronRight className="h-5 w-5 rotate-90 text-[var(--muted)] transition group-open:-rotate-90" />
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

                  {hasHomeworkBlock ? (
                    <article className="rounded-[28px] border border-[var(--border)] bg-white shadow-sm">
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                              Домашняя работа
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                              Правила сдачи
                            </h3>
                          </div>

                          <ChevronRight className="h-5 w-5 rotate-90 text-[var(--muted)] transition group-open:-rotate-90" />
                        </summary>

                        <div className="border-t border-[var(--border)] px-6 py-6">
                          <div className="grid gap-3 md:grid-cols-2">
                            {[
                              {
                                name: "requiresCuratorReview",
                                checked:
                                  selectedLesson.homeworkAssignment?.requiresCuratorReview ?? true,
                                title: "Проверка куратором",
                              },
                              {
                                name: "unlockNextModuleOnApproval",
                                checked:
                                  selectedLesson.homeworkAssignment?.unlockNextModuleOnApproval ??
                                  true,
                                title: "Открывать следующий модуль после принятия",
                              },
                              {
                                name: "allowTextSubmission",
                                checked:
                                  selectedLesson.homeworkAssignment?.allowTextSubmission ?? true,
                                title: "Разрешить текстовый ответ",
                              },
                              {
                                name: "allowLinkSubmission",
                                checked:
                                  selectedLesson.homeworkAssignment?.allowLinkSubmission ?? true,
                                title: "Разрешить ссылку",
                              },
                              {
                                name: "allowFileUpload",
                                checked:
                                  selectedLesson.homeworkAssignment?.allowFileUpload ?? true,
                                title: "Разрешить загрузку файла",
                              },
                            ].map((item) => (
                              <label
                                key={item.name}
                                className="flex items-start gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                              >
                                <input
                                  type="checkbox"
                                  name={item.name}
                                  defaultChecked={item.checked}
                                  className="mt-1 h-4 w-4 rounded border-[#cfd7f3] text-[var(--primary)] focus:ring-[var(--primary-soft)]"
                                />
                                <span className="font-medium text-[var(--foreground)]">
                                  {item.title}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </details>
                    </article>
                  ) : null}

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить урок
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/learning/courses/${course.id}?lessonId=${selectedLesson.id}`}>
                        Проверить как студент
                      </Link>
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
          </>
        )}
      </div>
    </section>
  );
}
