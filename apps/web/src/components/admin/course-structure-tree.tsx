"use client";

import { GripVertical, Loader2, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

type RepositionResult = {
  courseId: string;
  moduleId: string;
  lessonId: string;
};

type CourseStructureTreeProps = {
  courseId: string;
  modules: TreeModule[];
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  createModuleAction: (formData: FormData) => void | Promise<void>;
  repositionLessonAction: (formData: FormData) => Promise<RepositionResult>;
};

type DragState = {
  lessonId: string;
  sourceModuleId: string;
} | null;

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

function buildDropKey(moduleId: string, lessonId?: string) {
  return lessonId ? `${moduleId}:${lessonId}` : `${moduleId}:end`;
}

export function CourseStructureTree({
  courseId,
  modules,
  selectedModuleId,
  selectedLessonId,
  createModuleAction,
  repositionLessonAction,
}: CourseStructureTreeProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragState, setDragState] = useState<DragState>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function clearDragState() {
    setDragState(null);
    setDropKey(null);
  }

  function runReposition(targetModuleId: string, targetLessonId?: string) {
    if (!dragState) {
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
        router.push(
          buildContentHref(result.courseId, result.moduleId, result.lessonId),
          { scroll: false },
        );
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Не удалось переместить урок.",
        );
      } finally {
        clearDragState();
      }
    });
  }

  return (
    <div className="space-y-4">
      <article className="rounded-[24px] border border-[var(--border)] bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Структура курса
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
            Модули и уроки
          </h2>
        </div>

        <form action={createModuleAction} className="mt-4 space-y-3">
          <input type="hidden" name="courseId" value={courseId} />
          <Input name="title" placeholder="Новый модуль" required />
          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Добавить модуль
          </Button>
        </form>
      </article>

      {error ? (
        <p className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {modules.length === 0 ? (
        <article className="rounded-[24px] border border-dashed border-[var(--border)] bg-white p-4 text-sm text-[var(--muted)] shadow-sm">
          Модулей пока нет. Создай первый, и структура курса появится здесь.
        </article>
      ) : (
        <div className="space-y-3">
          {modules.map((moduleItem) => {
            const isActiveModule = selectedModuleId === moduleItem.id;
            const moduleDropKey = buildDropKey(moduleItem.id);

            return (
              <section
                key={moduleItem.id}
                onDragOver={(event) => {
                  if (!dragState) {
                    return;
                  }

                  event.preventDefault();
                  setDropKey(moduleDropKey);
                }}
                onDragLeave={() => {
                  if (dropKey === moduleDropKey) {
                    setDropKey(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  runReposition(moduleItem.id);
                }}
                className={`rounded-[24px] border bg-white transition ${
                  isActiveModule
                    ? "border-[var(--primary)] shadow-[0_16px_40px_rgba(65,97,255,0.12)]"
                    : "border-[var(--border)] shadow-sm"
                } ${
                  dropKey === moduleDropKey
                    ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]"
                    : ""
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
                    <div className="space-y-1.5">
                      {moduleItem.lessons.map((lesson, index) => {
                        const isActiveLesson = selectedLessonId === lesson.id;
                        const lessonDropKey = buildDropKey(moduleItem.id, lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            draggable={!isPending}
                            onDragStart={() =>
                              setDragState({
                                lessonId: lesson.id,
                                sourceModuleId: moduleItem.id,
                              })
                            }
                            onDragEnd={clearDragState}
                            onDragOver={(event) => {
                              if (!dragState) {
                                return;
                              }

                              event.preventDefault();
                              setDropKey(lessonDropKey);
                            }}
                            onDragLeave={() => {
                              if (dropKey === lessonDropKey) {
                                setDropKey(null);
                              }
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              runReposition(moduleItem.id, lesson.id);
                            }}
                            className={`rounded-[18px] transition ${
                              dropKey === lessonDropKey
                                ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-white"
                                : ""
                            }`}
                          >
                            <Link
                              href={buildContentHref(courseId, moduleItem.id, lesson.id)}
                              className={`flex items-center gap-3 rounded-[18px] px-3 py-2.5 transition ${
                                isActiveLesson
                                  ? "bg-[var(--primary-soft)] text-[var(--foreground)]"
                                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                              }`}
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-white text-[var(--muted)]">
                                {isPending && dragState?.lessonId === lesson.id ? (
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
                                  {lesson.type}
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
        </div>
      )}
    </div>
  );
}
