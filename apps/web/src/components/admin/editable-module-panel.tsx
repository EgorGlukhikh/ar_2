"use client";

import { PencilLine, Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditableModulePanelProps = {
  courseId: string;
  moduleId: string;
  title: string;
  lessonsCount: number;
  updateModuleAction: (formData: FormData) => void | Promise<void>;
  createLessonAction: (formData: FormData) => void | Promise<void>;
};

export function EditableModulePanel({
  courseId,
  moduleId,
  title,
  lessonsCount,
  updateModuleAction,
  createLessonAction,
}: EditableModulePanelProps) {
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [moduleTitle, setModuleTitle] = useState(title);
  const [lessonTitle, setLessonTitle] = useState("");

  function resetModuleTitle() {
    setModuleTitle(title);
    setIsEditingModule(false);
  }

  return (
    <article className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7a6548]">
            Выбранный модуль
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            {moduleTitle}
          </h2>
          <p className="text-sm text-[var(--muted)]">Уроков: {lessonsCount}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditingModule((current) => !current)}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            {isEditingModule ? "Скрыть редактирование" : "Редактировать модуль"}
          </Button>
          <Button
            type="button"
            onClick={() => setIsAddingLesson((current) => !current)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isAddingLesson ? "Скрыть форму урока" : "Добавить урок"}
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {isEditingModule ? (
          <form action={updateModuleAction} className="space-y-3 rounded-[22px] bg-[var(--surface)] p-4">
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="moduleId" value={moduleId} />
            <Label htmlFor="selected-module-title-editor">Название модуля</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="selected-module-title-editor"
                name="title"
                value={moduleTitle}
                onChange={(event) => setModuleTitle(event.target.value)}
                required
              />
              <Button type="submit" variant="outline" className="sm:min-w-[180px]">
                Сохранить
              </Button>
              <Button type="button" variant="outline" onClick={resetModuleTitle}>
                <X className="mr-2 h-4 w-4" />
                Отмена
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a6548]">
              Название модуля
            </p>
            <p className="mt-3 text-base font-semibold text-[var(--foreground)]">
              {moduleTitle}
            </p>
          </div>
        )}

        {isAddingLesson ? (
          <form action={createLessonAction} className="space-y-3 rounded-[22px] bg-[var(--surface)] p-4">
            <input type="hidden" name="moduleId" value={moduleId} />
            <input type="hidden" name="type" value="TEXT" />
            <Label htmlFor="new-lesson-title-header">Новый урок</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="new-lesson-title-header"
                name="title"
                value={lessonTitle}
                onChange={(event) => setLessonTitle(event.target.value)}
                placeholder="Например, Разбор первого кейса"
                required
              />
              <Button type="submit" className="sm:min-w-[180px]">
                <Plus className="mr-2 h-4 w-4" />
                Добавить урок
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a6548]">
              Новый урок
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Добавляй урок только когда действительно нужен новый шаг программы, а не
              дополнительная карточка ради структуры.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
