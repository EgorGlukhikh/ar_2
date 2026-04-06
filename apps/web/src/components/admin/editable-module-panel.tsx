"use client";

import { PencilLine, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SystemActionRow,
  SystemInfoItem,
  systemCardClassName,
  systemCardInsetClassName,
  systemEyebrowClassName,
  systemTitleClassName,
} from "@/components/system/system-ui";

type EditableModulePanelProps = {
  courseId: string;
  moduleId: string;
  title: string;
  lessonsCount: number;
  defaultLessonType: "TEXT" | "LIVE";
  courseFormatLabel: string;
  updateModuleAction: (formData: FormData) => void | Promise<void>;
};

export function EditableModulePanel({
  courseId,
  moduleId,
  title,
  lessonsCount,
  defaultLessonType,
  courseFormatLabel,
  updateModuleAction,
}: EditableModulePanelProps) {
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState(title);

  function resetModuleTitle() {
    setModuleTitle(title);
    setIsEditingModule(false);
  }

  return (
    <article className={`${systemCardClassName} p-5`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <p className={systemEyebrowClassName}>
            Выбранный модуль
          </p>
          <h2 className={systemTitleClassName}>
            {moduleTitle}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">{lessonsCount} уроков</Badge>
            <Badge variant="neutral">
              {defaultLessonType === "LIVE" ? "Вебинары по умолчанию" : "Обычные уроки"}
            </Badge>
          </div>
        </div>

        <SystemActionRow dense className="justify-start xl:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditingModule((current) => !current)}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            {isEditingModule ? "Скрыть редактирование" : "Редактировать модуль"}
          </Button>
        </SystemActionRow>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {isEditingModule ? (
          <form
            action={updateModuleAction}
            className={`space-y-3 ${systemCardInsetClassName} p-4`}
          >
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
          <SystemInfoItem label="Название модуля" value={moduleTitle} className="p-4" />
        )}

        <SystemInfoItem
          label="Как устроен поток"
          value={
            defaultLessonType === "LIVE"
              ? `Для формата «${courseFormatLabel}» новые шаги создаются как вебинарные занятия.`
              : "Новые уроки, переносы и удаление шагов теперь управляются из дерева слева."
          }
          hint="Здесь оставлены только настройки выбранного модуля. Структура программы больше не дублируется в центральной колонке."
          className="p-4"
        />
      </div>
    </article>
  );
}
