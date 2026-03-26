"use client";

import { ChevronRight, GripVertical, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lessonTypeLabelMap } from "@/lib/labels";

type TreeLesson = {
  id: string;
  title: string;
  type: string;
};

type TreeModule = {
  id: string;
  title: string;
  position: number;
  lessons: TreeLesson[];
};

type RepositionLessonResult = {
  courseId: string;
  moduleId: string;
  lessonId: string;
};

type RepositionModuleResult = {
  courseId: string;
  moduleId: string;
};

type CourseStructureTreeProps = {
  courseId: string;
  courseTitle: string;
  modules: TreeModule[];
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  createModuleAction: (formData: FormData) => void | Promise<void>;
  repositionLessonAction: (formData: FormData) => Promise<RepositionLessonResult>;
  repositionModuleAction: (formData: FormData) => Promise<RepositionModuleResult>;
};

type DragState =
  | {
      kind: "lesson";
      lessonId: string;
      sourceModuleId: string;
    }
  | {
      kind: "module";
      moduleId: string;
    }
  | null;

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

function buildDropKey(type: "module" | "lesson", id: string, targetId?: string) {
  return targetId ? `${type}:${id}:${targetId}` : `${type}:${id}:end`;
}

function getSuggestedModuleTitle(courseTitle: string, modulesCount: number) {
  return modulesCount === 0 ? courseTitle : `Модуль ${modulesCount + 1}`;
}

export function CourseStructureTree({
  courseId,
  courseTitle,
  modules,
  selectedModuleId,
  selectedLessonId,
  createModuleAction,
  repositionLessonAction,
  repositionModuleAction,
}: CourseStructureTreeProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragState, setDragState] = useState<DragState>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(modules.length === 0);
  const [moduleTitle, setModuleTitle] = useState(getSuggestedModuleTitle(courseTitle, modules.length));

  useEffect(() => {
    setModuleTitle(getSuggestedModuleTitle(courseTitle, modules.length));
    if (modules.length === 0) {
      setIsAddingModule(true);
    }
  }, [courseTitle, modules.length]);

  function clearDragState() {
    setDragState(null);
    setDropKey(null);
  }

  function closeAddModule() {
    setIsAddingModule(false);
    setModuleTitle(getSuggestedModuleTitle(courseTitle, modules.length));
  }

  function runLessonReposition(targetModuleId: string, targetLessonId?: string) {
    if (!dragState || dragState.kind !== "lesson") {
      return;
    }

    if (dragState.lessonId === targetLessonId) {
      clearDragState();
      return;
    }

    startTransition(async () => {
      try {
        setError(null);

        const formData = new FormData();
        formData.set("lessonId", dragState.lessonId);
        formData.set("targetModuleId", targetModuleId);
        formData.set("placement", targetLessonId ? "before" : "end");

        if (targetLessonId) {
          formData.set("targetLessonId", targetLessonId);
        }

        const result = await repositionLessonAction(formData);
        router.push(buildContentHref(result.courseId, result.moduleId, result.lessonId), {
          scroll: false,
        });
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error ? actionError.message : "Не удалось переместить урок.",
        );
      } finally {
        clearDragState();
      }
    });
  }

  function runModuleReposition(targetModuleId?: string) {
    if (!dragState || dragState.kind !== "module") {
      return;
    }

    if (dragState.moduleId === targetModuleId) {
      clearDragState();
      return;
    }

    startTransition(async () => {
      try {
        setError(null);

        const formData = new FormData();
        formData.set("moduleId", dragState.moduleId);
        formData.set("placement", targetModuleId ? "before" : "end");

        if (targetModuleId) {
          formData.set("targetModuleId", targetModuleId);
        }

        const result = await repositionModuleAction(formData);
        router.push(buildContentHref(result.courseId, result.moduleId), { scroll: false });
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error ? actionError.message : "Не удалось переместить модуль.",
        );
      } finally {
        clearDragState();
      }
    });
  }

  return (
    <div className="space-y-4">
      <article className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a6548]">
              Структура курса
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
              Модули и уроки
            </h2>
          </div>

          {!isAddingModule ? (
            <Button type="button" size="sm" onClick={() => setIsAddingModule(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить модуль
            </Button>
          ) : null}
        </div>

        {error ? (
          <p className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {modules.length === 0 ? (
          <div className="mt-4 rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            Пока модулей нет. Создай первый, и структура курса появится здесь.
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {modules.map((moduleItem) => {
            const isActiveModule = selectedModuleId === moduleItem.id;
            const moduleDropKey = buildDropKey("module", moduleItem.id);
            const lessonDropKey = buildDropKey("lesson", moduleItem.id);

            return (
              <section
                key={moduleItem.id}
                onDragOver={(event) => {
                  if (!dragState) {
                    return;
                  }

                  event.preventDefault();
                  setDropKey(dragState.kind === "module" ? moduleDropKey : lessonDropKey);
                }}
                onDragLeave={() => {
                  if (dropKey === moduleDropKey || dropKey === lessonDropKey) {
                    setDropKey(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();

                  if (dragState?.kind === "module") {
                    runModuleReposition(moduleItem.id);
                    return;
                  }

                  runLessonReposition(moduleItem.id);
                }}
                className={`rounded-[var(--radius-xl)] border bg-white transition ${
                  isActiveModule
                    ? "border-[var(--primary)] shadow-[0_16px_40px_rgba(65,97,255,0.12)]"
                    : "border-[var(--border)] shadow-sm"
                } ${
                  dropKey === moduleDropKey || dropKey === lessonDropKey
                    ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    draggable={!isPending}
                    onDragStart={() => setDragState({ kind: "module", moduleId: moduleItem.id })}
                    onDragEnd={clearDragState}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-white text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    aria-label="Перетащить модуль"
                  >
                    {isPending && dragState?.kind === "module" && dragState.moduleId === moduleItem.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <GripVertical className="h-4 w-4" />
                    )}
                  </button>

                  <Link
                    href={buildContentHref(courseId, moduleItem.id)}
                    scroll={false}
                    className="flex min-w-0 flex-1 items-center justify-between gap-3"
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
                </div>

                <div className="border-t border-[var(--border)] px-3 py-3">
                  {moduleItem.lessons.length === 0 ? (
                    <p className="px-1 text-sm text-[var(--muted)]">Пока без уроков.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {moduleItem.lessons.map((lesson, index) => {
                        const isActiveLesson = selectedLessonId === lesson.id;
                        const itemDropKey = buildDropKey("lesson", moduleItem.id, lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            draggable={!isPending}
                            onDragStart={() =>
                              setDragState({
                                kind: "lesson",
                                lessonId: lesson.id,
                                sourceModuleId: moduleItem.id,
                              })
                            }
                            onDragEnd={clearDragState}
                            onDragOver={(event) => {
                              if (!dragState || dragState.kind !== "lesson") {
                                return;
                              }

                              event.preventDefault();
                              setDropKey(itemDropKey);
                            }}
                            onDragLeave={() => {
                              if (dropKey === itemDropKey) {
                                setDropKey(null);
                              }
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              runLessonReposition(moduleItem.id, lesson.id);
                            }}
                            className={`rounded-[18px] transition ${
                              dropKey === itemDropKey
                                ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-white"
                                : ""
                            }`}
                          >
                            <Link
                              href={buildContentHref(courseId, moduleItem.id, lesson.id)}
                              scroll={false}
                              className={`flex items-center gap-3 rounded-[18px] px-3 py-2.5 transition ${
                                isActiveLesson
                                  ? "bg-[var(--primary-soft)] text-[var(--foreground)]"
                                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                              }`}
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-white text-[var(--muted)]">
                                {isPending &&
                                dragState?.kind === "lesson" &&
                                dragState.lessonId === lesson.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <GripVertical className="h-4 w-4" />
                                )}
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[var(--foreground)]">
                                  {index + 1}. {lesson.title}
                                </p>
                                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                                  {lessonTypeLabelMap[lesson.type as keyof typeof lessonTypeLabelMap] ??
                                    lesson.type}
                                </p>
                              </div>

                              <ChevronRight className="h-4 w-4 shrink-0" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          {dragState?.kind === "module" ? (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDropKey("module:end");
              }}
              onDragLeave={() => {
                if (dropKey === "module:end") {
                  setDropKey(null);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                runModuleReposition();
              }}
              className={`rounded-[22px] border border-dashed px-4 py-4 text-sm text-[var(--muted)] transition ${
                dropKey === "module:end"
                  ? "border-[var(--primary)] bg-[var(--primary-soft)]/35 text-[var(--foreground)]"
                  : "border-[var(--border)] bg-white"
              }`}
            >
              Перетащи модуль сюда, чтобы отправить его в конец списка.
            </div>
          ) : null}

          {isAddingModule ? (
            <form
              action={createModuleAction}
              className="rounded-[22px] border border-dashed border-[var(--primary)] bg-[var(--primary-soft)]/35 p-4"
            >
              <input type="hidden" name="courseId" value={courseId} />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">Новый модуль</p>
                <Input
                  name="title"
                  value={moduleTitle}
                  onChange={(event) => setModuleTitle(event.target.value)}
                  placeholder="Название модуля"
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Создать модуль
                  </Button>
                  {modules.length > 0 ? (
                    <Button type="button" variant="outline" onClick={closeAddModule}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </form>
          ) : null}
        </div>
      </article>
    </div>
  );
}

