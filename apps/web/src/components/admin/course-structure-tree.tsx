"use client";

import {
  Check,
  ChevronRight,
  GripVertical,
  Loader2,
  MoreHorizontal,
  PencilLine,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lessonTypeLabelMap } from "@/lib/labels";
import { cn } from "@/lib/utils";

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

type CourseContentSelectionResult = {
  courseId: string;
  moduleId: string | null;
  lessonId: string | null;
};

type QuickCreateResult = {
  courseId: string;
  moduleId: string;
  lessonId: string;
};

type CourseStructureTreeProps = {
  courseId: string;
  courseTitle: string;
  modules: TreeModule[];
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  createModuleAction: (formData: FormData) => void | Promise<void>;
  quickCreateLessonAction: (formData: FormData) => Promise<QuickCreateResult>;
  repositionLessonAction: (formData: FormData) => Promise<CourseContentSelectionResult>;
  repositionModuleAction: (formData: FormData) => Promise<CourseContentSelectionResult>;
  renameModuleAction: (formData: FormData) => Promise<CourseContentSelectionResult>;
  renameLessonAction: (formData: FormData) => Promise<CourseContentSelectionResult>;
  deleteModuleAction: (formData: FormData) => Promise<CourseContentSelectionResult>;
  deleteLessonAction: (formData: FormData) => Promise<CourseContentSelectionResult>;
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

type EditingState =
  | {
      kind: "module" | "lesson";
      id: string;
      moduleId: string;
      title: string;
    }
  | null;

type TreeActionMenuProps = {
  onRename: () => void;
  onDelete: () => void;
  disabled: boolean;
};

function buildContentHref(courseId: string, moduleId?: string, lessonId?: string) {
  const search = new URLSearchParams();
  if (moduleId) search.set("moduleId", moduleId);
  if (lessonId) search.set("lessonId", lessonId);
  const query = search.toString();
  return query ? `/admin/courses/${courseId}/content?${query}` : `/admin/courses/${courseId}/content`;
}

function buildDropKey(type: "module" | "lesson", id: string, targetId?: string) {
  return targetId ? `${type}:${id}:${targetId}` : `${type}:${id}:end`;
}

function getSuggestedModuleTitle(courseTitle: string, modulesCount: number) {
  return modulesCount === 0 ? courseTitle : `Модуль ${modulesCount + 1}`;
}

function TreeActionMenu({ onRename, onDelete, disabled }: TreeActionMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  function handleAction(action: () => void) {
    detailsRef.current?.removeAttribute("open");
    action();
  }

  return (
    <details ref={detailsRef} className="relative">
      <summary
        className={cn(
          "flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)] [&::-webkit-details-marker]:hidden",
          disabled ? "pointer-events-none opacity-50" : "",
        )}
        aria-label="Открыть действия"
      >
        <MoreHorizontal className="h-4 w-4" />
      </summary>

      <div className="absolute right-0 top-[calc(100%+0.35rem)] z-30 min-w-[180px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-md)]">
        <button
          type="button"
          onClick={() => handleAction(onRename)}
          className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
        >
          <PencilLine className="h-4 w-4" />
          Переименовать
        </button>
        <button
          type="button"
          onClick={() => handleAction(onDelete)}
          className="mt-1 flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-medium text-[var(--error)] transition hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Удалить
        </button>
      </div>
    </details>
  );
}

export function CourseStructureTree({
  courseId,
  courseTitle,
  modules,
  selectedModuleId,
  selectedLessonId,
  createModuleAction,
  quickCreateLessonAction,
  repositionLessonAction,
  repositionModuleAction,
  renameModuleAction,
  renameLessonAction,
  deleteModuleAction,
  deleteLessonAction,
}: CourseStructureTreeProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragState, setDragState] = useState<DragState>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(modules.length === 0);
  const [moduleTitle, setModuleTitle] = useState(
    getSuggestedModuleTitle(courseTitle, modules.length),
  );
  const [creatingLessonInModule, setCreatingLessonInModule] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<EditingState>(null);
  const [confirmingDeleteKey, setConfirmingDeleteKey] = useState<string | null>(null);

  useEffect(() => {
    setModuleTitle(getSuggestedModuleTitle(courseTitle, modules.length));
    if (modules.length === 0) {
      setIsAddingModule(true);
    }
  }, [courseTitle, modules.length]);

  function navigateToSelection(result: CourseContentSelectionResult) {
    router.push(
      buildContentHref(
        result.courseId,
        result.moduleId ?? undefined,
        result.lessonId ?? undefined,
      ),
      { scroll: false },
    );
    router.refresh();
  }

  function clearDragState() {
    setDragState(null);
    setDropKey(null);
  }

  function resetInlineStates() {
    setEditingState(null);
    setConfirmingDeleteKey(null);
  }

  function closeAddModule() {
    setIsAddingModule(false);
    setModuleTitle(getSuggestedModuleTitle(courseTitle, modules.length));
  }

  function startModuleRename(moduleItem: TreeModule) {
    setConfirmingDeleteKey(null);
    setEditingState({
      kind: "module",
      id: moduleItem.id,
      moduleId: moduleItem.id,
      title: moduleItem.title,
    });
  }

  function startLessonRename(moduleId: string, lesson: TreeLesson) {
    setConfirmingDeleteKey(null);
    setEditingState({
      kind: "lesson",
      id: lesson.id,
      moduleId,
      title: lesson.title,
    });
  }

  function handleQuickCreateLesson(moduleId: string, lessonCount: number) {
    setCreatingLessonInModule(moduleId);
    resetInlineStates();

    startTransition(async () => {
      try {
        setError(null);
        const fd = new FormData();
        fd.set("moduleId", moduleId);
        fd.set("title", `Урок ${lessonCount + 1}`);
        const result = await quickCreateLessonAction(fd);
        navigateToSelection(result);
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Не удалось создать урок.");
      } finally {
        setCreatingLessonInModule(null);
      }
    });
  }

  function submitModuleRename(moduleItem: TreeModule) {
    if (
      !editingState ||
      editingState.kind !== "module" ||
      editingState.id !== moduleItem.id
    ) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const fd = new FormData();
        fd.set("moduleId", moduleItem.id);
        fd.set("title", editingState.title);
        const result = await renameModuleAction(fd);
        setEditingState(null);
        navigateToSelection({
          ...result,
          lessonId:
            selectedModuleId === moduleItem.id && selectedLessonId ? selectedLessonId : null,
        });
      } catch (actionError) {
        setError(
          actionError instanceof Error ? actionError.message : "Не удалось переименовать модуль.",
        );
      }
    });
  }

  function submitLessonRename(moduleId: string, lessonId: string) {
    if (
      !editingState ||
      editingState.kind !== "lesson" ||
      editingState.id !== lessonId
    ) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const fd = new FormData();
        fd.set("lessonId", lessonId);
        fd.set("title", editingState.title);
        const result = await renameLessonAction(fd);
        setEditingState(null);
        navigateToSelection({
          ...result,
          moduleId: result.moduleId ?? moduleId,
          lessonId: result.lessonId ?? lessonId,
        });
      } catch (actionError) {
        setError(
          actionError instanceof Error ? actionError.message : "Не удалось переименовать урок.",
        );
      }
    });
  }

  function handleDeleteModule(moduleId: string) {
    startTransition(async () => {
      try {
        setError(null);
        const fd = new FormData();
        fd.set("moduleId", moduleId);
        const result = await deleteModuleAction(fd);
        setConfirmingDeleteKey(null);
        setEditingState(null);
        navigateToSelection(result);
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Не удалось удалить модуль.");
      }
    });
  }

  function handleDeleteLesson(lessonId: string) {
    startTransition(async () => {
      try {
        setError(null);
        const fd = new FormData();
        fd.set("lessonId", lessonId);
        const result = await deleteLessonAction(fd);
        setConfirmingDeleteKey(null);
        setEditingState(null);
        navigateToSelection(result);
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Не удалось удалить урок.");
      }
    });
  }

  function runLessonReposition(targetModuleId: string, targetLessonId?: string) {
    if (!dragState || dragState.kind !== "lesson") return;
    if (dragState.lessonId === targetLessonId) {
      clearDragState();
      return;
    }

    resetInlineStates();

    startTransition(async () => {
      try {
        setError(null);
        const formData = new FormData();
        formData.set("lessonId", dragState.lessonId);
        formData.set("targetModuleId", targetModuleId);
        formData.set("placement", targetLessonId ? "before" : "end");
        if (targetLessonId) formData.set("targetLessonId", targetLessonId);
        const result = await repositionLessonAction(formData);
        navigateToSelection(result);
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Не удалось переместить урок.");
      } finally {
        clearDragState();
      }
    });
  }

  function runModuleReposition(targetModuleId?: string) {
    if (!dragState || dragState.kind !== "module") return;
    if (dragState.moduleId === targetModuleId) {
      clearDragState();
      return;
    }

    resetInlineStates();

    startTransition(async () => {
      try {
        setError(null);
        const formData = new FormData();
        formData.set("moduleId", dragState.moduleId);
        formData.set("placement", targetModuleId ? "before" : "end");
        if (targetModuleId) formData.set("targetModuleId", targetModuleId);
        const result = await repositionModuleAction(formData);
        navigateToSelection(result);
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Не удалось переместить модуль.");
      } finally {
        clearDragState();
      }
    });
  }

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Программа курса
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Дерево модулей и уроков теперь управляет всей структурой.
          </p>
        </div>
        <Badge variant="neutral">
          {modules.reduce((sum, moduleItem) => sum + moduleItem.lessons.length, 0)} уроков
        </Badge>
      </div>

      {error ? (
        <p className="mx-4 mt-4 rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {modules.length === 0 ? (
        <div className="mx-4 mt-4 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 text-sm leading-6 text-[var(--muted)]">
          Создай первый модуль — структура курса появится здесь.
        </div>
      ) : null}

      <div className="space-y-3 p-4">
        {modules.map((moduleItem) => {
          const isActiveModule = selectedModuleId === moduleItem.id;
          const isEditingModule =
            editingState?.kind === "module" && editingState.id === moduleItem.id;
          const isConfirmingModuleDelete = confirmingDeleteKey === `module:${moduleItem.id}`;
          const moduleDropKey = buildDropKey("module", moduleItem.id);
          const lessonDropKey = buildDropKey("lesson", moduleItem.id);
          const isCreating = creatingLessonInModule === moduleItem.id && isPending;

          return (
            <section
              key={moduleItem.id}
              onDragOver={(event) => {
                if (!dragState) return;
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
              className={cn(
                "rounded-[var(--radius-md)] border transition",
                isActiveModule
                  ? "border-[var(--primary)] bg-[var(--primary-soft)]/35 shadow-[var(--shadow-sm)]"
                  : "border-[var(--border)] bg-[var(--surface)]",
                dropKey === moduleDropKey || dropKey === lessonDropKey
                  ? "ring-2 ring-[var(--focus)] ring-offset-2 ring-offset-[var(--surface)]"
                  : "",
              )}
            >
              <div className="group flex items-center gap-2 px-3 py-3">
                <button
                  type="button"
                  draggable={!isPending}
                  onDragStart={() => {
                    resetInlineStates();
                    setDragState({ kind: "module", moduleId: moduleItem.id });
                  }}
                  onDragEnd={clearDragState}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--control-radius)] text-[var(--muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
                  aria-label="Перетащить модуль"
                >
                  {isPending && dragState?.kind === "module" && dragState.moduleId === moduleItem.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <GripVertical className="h-4 w-4" />
                  )}
                </button>

                {isEditingModule && editingState ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      submitModuleRename(moduleItem);
                    }}
                    className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                  >
                    <Input
                      value={editingState.title}
                      onChange={(event) =>
                        setEditingState((current) =>
                          current && current.id === moduleItem.id
                            ? { ...current, title: event.target.value }
                            : current,
                        )
                      }
                      className="h-[var(--control-height-sm)] min-w-[180px] flex-1 text-sm"
                      autoFocus
                    />
                    <Button type="submit" size="sm">
                      <Check className="mr-2 h-4 w-4" />
                      Сохранить
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingState(null)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Отмена
                    </Button>
                  </form>
                ) : (
                  <>
                    <Link
                      href={buildContentHref(
                        courseId,
                        moduleItem.id,
                        isActiveModule ? selectedLessonId ?? undefined : undefined,
                      )}
                      scroll={false}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                            {moduleItem.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--muted)]">
                            {moduleItem.lessons.length > 0
                              ? `${moduleItem.lessons.length} уроков`
                              : "Пока без уроков"}
                          </p>
                        </div>
                        <Badge variant="neutral">{moduleItem.position}</Badge>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          handleQuickCreateLesson(moduleItem.id, moduleItem.lessons.length)
                        }
                        disabled={isPending}
                      >
                        {isCreating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>

                      <TreeActionMenu
                        disabled={isPending}
                        onRename={() => startModuleRename(moduleItem)}
                        onDelete={() => {
                          setEditingState(null);
                          setConfirmingDeleteKey(`module:${moduleItem.id}`);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              {isConfirmingModuleDelete ? (
                <div className="mx-3 mb-3 rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm leading-6 text-red-700">
                    Удалить модуль вместе со всеми его уроками?
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[var(--error)] shadow-none hover:bg-[#dc2626] active:bg-[#b91c1c]"
                      onClick={() => handleDeleteModule(moduleItem.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить модуль
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmingDeleteKey(null)}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="border-t border-[var(--border)] px-2 py-2">
                {moduleItem.lessons.length === 0 ? (
                  <p className="px-2 py-2 text-sm leading-6 text-[var(--muted)]">
                    В этом модуле пока нет уроков.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {moduleItem.lessons.map((lesson, index) => {
                      const isActiveLesson = selectedLessonId === lesson.id;
                      const isEditingLesson =
                        editingState?.kind === "lesson" && editingState.id === lesson.id;
                      const isConfirmingLessonDelete =
                        confirmingDeleteKey === `lesson:${lesson.id}`;
                      const itemDropKey = buildDropKey("lesson", moduleItem.id, lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          draggable={!isPending}
                          onDragStart={() => {
                            resetInlineStates();
                            setDragState({
                              kind: "lesson",
                              lessonId: lesson.id,
                              sourceModuleId: moduleItem.id,
                            });
                          }}
                          onDragEnd={clearDragState}
                          onDragOver={(event) => {
                            if (!dragState || dragState.kind !== "lesson") return;
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
                          className={cn(
                            "rounded-[var(--radius-sm)] transition",
                            dropKey === itemDropKey
                              ? "ring-2 ring-[var(--focus)] ring-offset-2 ring-offset-[var(--surface)]"
                              : "",
                          )}
                        >
                          <div
                            className={cn(
                              "group flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 transition",
                              isActiveLesson
                                ? "bg-[var(--primary-soft)]/45"
                                : "hover:bg-[var(--surface-strong)]",
                            )}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--control-radius)] text-[var(--muted)]">
                              {isPending &&
                              dragState?.kind === "lesson" &&
                              dragState.lessonId === lesson.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <GripVertical className="h-4 w-4" />
                              )}
                            </div>

                            {isEditingLesson && editingState ? (
                              <form
                                onSubmit={(event) => {
                                  event.preventDefault();
                                  submitLessonRename(moduleItem.id, lesson.id);
                                }}
                                className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                              >
                                <Input
                                  value={editingState.title}
                                  onChange={(event) =>
                                    setEditingState((current) =>
                                      current && current.id === lesson.id
                                        ? { ...current, title: event.target.value }
                                        : current,
                                    )
                                  }
                                  className="h-[var(--control-height-sm)] min-w-[180px] flex-1 text-sm"
                                  autoFocus
                                />
                                <Button type="submit" size="sm">
                                  <Check className="mr-2 h-4 w-4" />
                                  Сохранить
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingState(null)}
                                >
                                  Отмена
                                </Button>
                              </form>
                            ) : (
                              <>
                                <Link
                                  href={buildContentHref(courseId, moduleItem.id, lesson.id)}
                                  scroll={false}
                                  className="min-w-0 flex-1"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                                      {index + 1}. {lesson.title}
                                    </p>
                                    <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                                      {lessonTypeLabelMap[
                                        lesson.type as keyof typeof lessonTypeLabelMap
                                      ] ?? lesson.type}
                                    </p>
                                  </div>
                                </Link>

                                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                                  <TreeActionMenu
                                    disabled={isPending}
                                    onRename={() => startLessonRename(moduleItem.id, lesson)}
                                    onDelete={() => {
                                      setEditingState(null);
                                      setConfirmingDeleteKey(`lesson:${lesson.id}`);
                                    }}
                                  />
                                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                                </div>
                              </>
                            )}
                          </div>

                          {isConfirmingLessonDelete ? (
                            <div className="mx-2 mb-2 rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3">
                              <p className="text-sm leading-6 text-red-700">
                                Удалить урок из структуры курса?
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="bg-[var(--error)] shadow-none hover:bg-[#dc2626] active:bg-[#b91c1c]"
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  disabled={isPending}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Удалить урок
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setConfirmingDeleteKey(null)}
                                >
                                  Отмена
                                </Button>
                              </div>
                            </div>
                          ) : null}
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
            className={cn(
              "rounded-[var(--radius-md)] border border-dashed px-4 py-4 text-sm leading-6 transition",
              dropKey === "module:end"
                ? "border-[var(--primary)] bg-[var(--primary-soft)]/35 text-[var(--foreground)]"
                : "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted)]",
            )}
          >
            Перетащи модуль сюда, чтобы отправить его в конец программы.
          </div>
        ) : null}

        {isAddingModule ? (
          <form
            action={createModuleAction}
            className="rounded-[var(--radius-md)] border border-dashed border-[var(--primary)] bg-[var(--primary-soft)]/35 p-4"
          >
            <input type="hidden" name="courseId" value={courseId} />
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Новый модуль
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Добавь следующий раздел прямо в программу курса.
                </p>
              </div>

              <Input
                name="title"
                value={moduleTitle}
                onChange={(event) => setModuleTitle(event.target.value)}
                placeholder="Название модуля"
                required
              />

              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать модуль
                </Button>
                {modules.length > 0 ? (
                  <Button type="button" size="sm" variant="outline" onClick={closeAddModule}>
                    Отмена
                  </Button>
                ) : null}
              </div>
            </div>
          </form>
        ) : null}
      </div>

      {modules.length > 0 && !isAddingModule ? (
        <div className="border-t border-[var(--border)] px-4 py-4">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingModule(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить модуль
          </Button>
        </div>
      ) : null}
    </article>
  );
}
