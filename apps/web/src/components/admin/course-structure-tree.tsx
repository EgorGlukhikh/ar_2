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
  if (moduleId) search.set("moduleId", moduleId);
  if (lessonId) search.set("lessonId", lessonId);
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
  quickCreateLessonAction,
  repositionLessonAction,
  repositionModuleAction,
}: CourseStructureTreeProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [creatingLessonInModule, setCreatingLessonInModule] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(modules.length === 0);
  const [moduleTitle, setModuleTitle] = useState(
    getSuggestedModuleTitle(courseTitle, modules.length),
  );

  useEffect(() => {
    setModuleTitle(getSuggestedModuleTitle(courseTitle, modules.length));
    if (modules.length === 0) setIsAddingModule(true);
  }, [courseTitle, modules.length]);

  function clearDragState() {
    setDragState(null);
    setDropKey(null);
  }

  function closeAddModule() {
    setIsAddingModule(false);
    setModuleTitle(getSuggestedModuleTitle(courseTitle, modules.length));
  }

  function handleQuickCreateLesson(moduleId: string, lessonCount: number) {
    setCreatingLessonInModule(moduleId);
    startTransition(async () => {
      try {
        setError(null);
        const fd = new FormData();
        fd.set("moduleId", moduleId);
        fd.set("title", `Урок ${lessonCount + 1}`);
        const result = await quickCreateLessonAction(fd);
        router.push(
          buildContentHref(result.courseId, result.moduleId, result.lessonId),
          { scroll: false },
        );
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Не удалось создать урок.");
      } finally {
        setCreatingLessonInModule(null);
      }
    });
  }

  function runLessonReposition(targetModuleId: string, targetLessonId?: string) {
    if (!dragState || dragState.kind !== "lesson") return;
    if (dragState.lessonId === targetLessonId) { clearDragState(); return; }

    startTransition(async () => {
      try {
        setError(null);
        const formData = new FormData();
        formData.set("lessonId", dragState.lessonId);
        formData.set("targetModuleId", targetModuleId);
        formData.set("placement", targetLessonId ? "before" : "end");
        if (targetLessonId) formData.set("targetLessonId", targetLessonId);
        const result = await repositionLessonAction(formData);
        router.push(buildContentHref(result.courseId, result.moduleId, result.lessonId), { scroll: false });
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Не удалось переместить урок.");
      } finally {
        clearDragState();
      }
    });
  }

  function runModuleReposition(targetModuleId?: string) {
    if (!dragState || dragState.kind !== "module") return;
    if (dragState.moduleId === targetModuleId) { clearDragState(); return; }

    startTransition(async () => {
      try {
        setError(null);
        const formData = new FormData();
        formData.set("moduleId", dragState.moduleId);
        formData.set("placement", targetModuleId ? "before" : "end");
        if (targetModuleId) formData.set("targetModuleId", targetModuleId);
        const result = await repositionModuleAction(formData);
        router.push(buildContentHref(result.courseId, result.moduleId), { scroll: false });
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Не удалось переместить модуль.");
      } finally {
        clearDragState();
      }
    });
  }

  return (
    <div className="space-y-3">
      <article className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-sm">
        {/* Header — compact */}
        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Программа курса
          </p>
          <Badge variant="neutral">{modules.reduce((s, m) => s + m.lessons.length, 0)}</Badge>
        </div>

        {error ? (
          <p className="mx-3 mb-2 rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}

        {modules.length === 0 ? (
          <p className="mx-3 mb-3 rounded-[14px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-xs text-[var(--muted)]">
            Создай первый модуль — структура курса появится здесь.
          </p>
        ) : null}

        <div className="space-y-2 px-2 pb-2">
          {modules.map((moduleItem) => {
            const isActiveModule = selectedModuleId === moduleItem.id;
            const moduleDropKey = buildDropKey("module", moduleItem.id);
            const lessonDropKey = buildDropKey("lesson", moduleItem.id);
            const isCreating = creatingLessonInModule === moduleItem.id && isPending;

            return (
              <section
                key={moduleItem.id}
                onDragOver={(e) => {
                  if (!dragState) return;
                  e.preventDefault();
                  setDropKey(dragState.kind === "module" ? moduleDropKey : lessonDropKey);
                }}
                onDragLeave={() => {
                  if (dropKey === moduleDropKey || dropKey === lessonDropKey) setDropKey(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragState?.kind === "module") { runModuleReposition(moduleItem.id); return; }
                  runLessonReposition(moduleItem.id);
                }}
                className={`rounded-[14px] border transition ${
                  isActiveModule
                    ? "border-[var(--primary)] shadow-[0_8px_24px_rgba(65,97,255,0.10)]"
                    : "border-[var(--border)]"
                } ${
                  dropKey === moduleDropKey || dropKey === lessonDropKey
                    ? "ring-2 ring-[var(--primary)] ring-offset-1"
                    : ""
                }`}
              >
                {/* Module row */}
                <div className="flex items-center gap-2 px-2 py-2">
                  <button
                    type="button"
                    draggable={!isPending}
                    onDragStart={() => setDragState({ kind: "module", moduleId: moduleItem.id })}
                    onDragEnd={clearDragState}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] opacity-40 transition hover:opacity-100"
                    aria-label="Перетащить модуль"
                  >
                    {isPending && dragState?.kind === "module" && dragState.moduleId === moduleItem.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <GripVertical className="h-3 w-3" />
                    )}
                  </button>

                  <Link
                    href={buildContentHref(courseId, moduleItem.id)}
                    scroll={false}
                    className="flex min-w-0 flex-1 items-center justify-between gap-2"
                  >
                    <p className="min-w-0 truncate text-xs font-semibold text-[var(--foreground)]">
                      {moduleItem.title}
                    </p>
                    <Badge variant="neutral" className="shrink-0 text-[10px]">
                      {moduleItem.lessons.length}
                    </Badge>
                  </Link>
                </div>

                {/* Lessons */}
                <div className="border-t border-[var(--border)] px-2 py-1.5">
                  {moduleItem.lessons.length === 0 ? (
                    <p className="px-1 py-1 text-[11px] text-[var(--muted)]">Пока без уроков</p>
                  ) : (
                    <div className="space-y-0.5">
                      {moduleItem.lessons.map((lesson, index) => {
                        const isActiveLesson = selectedLessonId === lesson.id;
                        const itemDropKey = buildDropKey("lesson", moduleItem.id, lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            draggable={!isPending}
                            onDragStart={() =>
                              setDragState({ kind: "lesson", lessonId: lesson.id, sourceModuleId: moduleItem.id })
                            }
                            onDragEnd={clearDragState}
                            onDragOver={(e) => {
                              if (!dragState || dragState.kind !== "lesson") return;
                              e.preventDefault();
                              setDropKey(itemDropKey);
                            }}
                            onDragLeave={() => {
                              if (dropKey === itemDropKey) setDropKey(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              runLessonReposition(moduleItem.id, lesson.id);
                            }}
                            className={`rounded-[10px] transition ${
                              dropKey === itemDropKey
                                ? "ring-2 ring-[var(--primary)] ring-offset-1"
                                : ""
                            }`}
                          >
                            <Link
                              href={buildContentHref(courseId, moduleItem.id, lesson.id)}
                              scroll={false}
                              className={`flex items-center gap-2 rounded-[10px] px-2 py-1.5 transition ${
                                isActiveLesson
                                  ? "bg-[var(--primary-soft)] text-[var(--foreground)]"
                                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                              }`}
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[var(--muted)] opacity-40">
                                {isPending && dragState?.kind === "lesson" && dragState.lessonId === lesson.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <GripVertical className="h-3 w-3" />
                                )}
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className={`truncate text-xs font-medium ${isActiveLesson ? "text-[var(--foreground)]" : "text-[var(--foreground)]"}`}>
                                  {index + 1}. {lesson.title}
                                </p>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                                  {lessonTypeLabelMap[lesson.type as keyof typeof lessonTypeLabelMap] ?? lesson.type}
                                </p>
                              </div>

                              <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick add lesson button */}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleQuickCreateLesson(moduleItem.id, moduleItem.lessons.length)}
                    className="mt-1 flex w-full items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[11px] font-medium text-[var(--muted)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] disabled:opacity-50"
                  >
                    {isCreating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    {isCreating ? "Создаю..." : "Добавить урок"}
                  </button>
                </div>
              </section>
            );
          })}

          {dragState?.kind === "module" ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDropKey("module:end"); }}
              onDragLeave={() => { if (dropKey === "module:end") setDropKey(null); }}
              onDrop={(e) => { e.preventDefault(); runModuleReposition(); }}
              className={`rounded-[14px] border border-dashed px-3 py-3 text-xs text-[var(--muted)] transition ${
                dropKey === "module:end"
                  ? "border-[var(--primary)] bg-[var(--primary-soft)]/35 text-[var(--foreground)]"
                  : "border-[var(--border)] bg-white"
              }`}
            >
              Перетащи модуль сюда → в конец
            </div>
          ) : null}

          {isAddingModule ? (
            <form
              action={createModuleAction}
              className="rounded-[14px] border border-dashed border-[var(--primary)] bg-[var(--primary-soft)]/35 p-3"
            >
              <input type="hidden" name="courseId" value={courseId} />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--foreground)]">Новый раздел</p>
                <Input
                  name="title"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="Название раздела"
                  required
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1">
                    Создать
                  </Button>
                  {modules.length > 0 ? (
                    <Button type="button" size="sm" variant="outline" onClick={closeAddModule}>
                      <X className="h-3 w-3" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </form>
          ) : null}
        </div>

        {/* "Add module" — subtle bottom button, shown only when modules exist */}
        {modules.length > 0 && !isAddingModule ? (
          <button
            type="button"
            onClick={() => setIsAddingModule(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-b-[var(--radius-xl)] border-t border-[var(--border)] px-3 py-2 text-[11px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            <Plus className="h-3 w-3" />
            Добавить раздел
          </button>
        ) : null}
      </article>
    </div>
  );
}
