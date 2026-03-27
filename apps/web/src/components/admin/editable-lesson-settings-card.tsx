"use client";

import { PencilLine, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { SystemInfoItem } from "@/components/system/system-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type EditableLessonSettingsCardProps = {
  formId: string;
  title: string;
  excerpt: string;
  accessAfterDays: number | null;
  isPreview: boolean;
  lessonImageUrl?: string;
  className?: string;
};

export function EditableLessonSettingsCard({
  formId,
  title,
  excerpt,
  accessAfterDays,
  isPreview,
  lessonImageUrl,
  className,
}: EditableLessonSettingsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftExcerpt, setDraftExcerpt] = useState(excerpt);
  const [draftAccessAfterDays, setDraftAccessAfterDays] = useState(
    accessAfterDays === null ? "" : String(accessAfterDays),
  );
  const [draftIsPreview, setDraftIsPreview] = useState(isPreview);
  const [draftLessonImageUrl, setDraftLessonImageUrl] = useState(lessonImageUrl ?? "");

  function resetDraft() {
    setDraftTitle(title);
    setDraftExcerpt(excerpt);
    setDraftAccessAfterDays(accessAfterDays === null ? "" : String(accessAfterDays));
    setDraftIsPreview(isPreview);
    setDraftLessonImageUrl(lessonImageUrl ?? "");
    setIsEditing(false);
  }

  return (
    <article className={cn("rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]", className)}>
      <input type="hidden" name="title" value={draftTitle} form={formId} />
      <input type="hidden" name="excerpt" value={draftExcerpt} form={formId} />
      <input type="hidden" name="accessAfterDays" value={draftAccessAfterDays} form={formId} />
      <input type="hidden" name="isPreview" value={draftIsPreview ? "true" : "false"} form={formId} />
      <input type="hidden" name="lessonImageUrl" value={draftLessonImageUrl} form={formId} />

      <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Урок
          </p>
          <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            Основные настройки
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button type="submit" form={formId}>
                Сохранить урок
              </Button>
              <Button type="button" variant="outline" onClick={resetDraft}>
                <X className="mr-2 h-4 w-4" />
                Отмена
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
              <PencilLine className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-5 py-5">
        {isEditing ? (
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="lesson-title-editor">Название урока</Label>
              <Input
                id="lesson-title-editor"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-excerpt-editor">Краткое описание</Label>
              <Textarea
                id="lesson-excerpt-editor"
                value={draftExcerpt}
                onChange={(event) => setDraftExcerpt(event.target.value)}
                className="min-h-[140px]"
                placeholder="Коротко объясни, что студент получит в этом уроке."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-image-url-editor">Обложка урока (URL)</Label>
              <Input
                id="lesson-image-url-editor"
                value={draftLessonImageUrl}
                onChange={(event) => setDraftLessonImageUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-access-after-editor">Открыть через дней</Label>
                <Input
                  id="lesson-access-after-editor"
                  type="number"
                  min={0}
                  value={draftAccessAfterDays}
                  onChange={(event) => setDraftAccessAfterDays(event.target.value)}
                  placeholder="Например, 7"
                />
              </div>

              <label className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
                <input
                  type="checkbox"
                  checked={draftIsPreview}
                  onChange={(event) => setDraftIsPreview(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#cfd7f3] text-[var(--primary)] focus:ring-[var(--primary-soft)]"
                />
                <span>
                  <span className="block text-sm font-medium text-[var(--foreground)]">
                    Открытый урок
                  </span>
                  <span className="block text-sm leading-6 text-[var(--muted)]">
                    Можно показывать без записи как превью.
                  </span>
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            <SystemInfoItem label="Название урока" value={draftTitle} />
            {draftLessonImageUrl ? (
              <SystemInfoItem label="Обложка" value={
                <Image src={draftLessonImageUrl} alt="Обложка урока" width={300} height={96} className="mt-1 max-h-24 rounded-lg object-cover" />
              } />
            ) : null}
            <SystemInfoItem
              label="Доступ"
              value={draftAccessAfterDays ? `Через ${draftAccessAfterDays} дн.` : "Сразу"}
              hint={draftIsPreview ? "Открытый урок" : "Только для студентов курса"}
            />
            <SystemInfoItem
              label="Краткое описание"
              value={
                <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
                  {draftExcerpt || "Описание пока не заполнено."}
                </p>
              }
            />
          </div>
        )}
      </div>
    </article>
  );
}

