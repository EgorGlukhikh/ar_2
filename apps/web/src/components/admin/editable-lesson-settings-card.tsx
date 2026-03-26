"use client";

import { PencilLine, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EditableLessonSettingsCardProps = {
  formId: string;
  title: string;
  excerpt: string;
  accessAfterDays: number | null;
  isPreview: boolean;
};

export function EditableLessonSettingsCard({
  formId,
  title,
  excerpt,
  accessAfterDays,
  isPreview,
}: EditableLessonSettingsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftExcerpt, setDraftExcerpt] = useState(excerpt);
  const [draftAccessAfterDays, setDraftAccessAfterDays] = useState(
    accessAfterDays === null ? "" : String(accessAfterDays),
  );
  const [draftIsPreview, setDraftIsPreview] = useState(isPreview);

  function resetDraft() {
    setDraftTitle(title);
    setDraftExcerpt(excerpt);
    setDraftAccessAfterDays(accessAfterDays === null ? "" : String(accessAfterDays));
    setDraftIsPreview(isPreview);
    setIsEditing(false);
  }

  return (
    <article className="rounded-[28px] border border-[var(--border)] bg-white shadow-sm">
      <input type="hidden" name="title" value={draftTitle} />
      <input type="hidden" name="excerpt" value={draftExcerpt} />
      <input type="hidden" name="accessAfterDays" value={draftAccessAfterDays} />
      <input type="hidden" name="isPreview" value={draftIsPreview ? "true" : "false"} />

      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7a6548]">
            Урок
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
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

      <div className="border-t border-[var(--border)] px-6 py-6">
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
                className="min-h-[120px]"
                placeholder="Коротко объясни, что студент получит в этом уроке."
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lesson-access-after-editor">Открыть через дней</Label>
                <Input
                  id="lesson-access-after-editor"
                  type="number"
                  min={0}
                  value={draftAccessAfterDays}
                  onChange={(event) => setDraftAccessAfterDays(event.target.value)}
                  placeholder="Например, 7"
                  className="h-14"
                />
              </div>

              <label className="flex h-14 items-center gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4">
                <input
                  type="checkbox"
                  checked={draftIsPreview}
                  onChange={(event) => setDraftIsPreview(event.target.checked)}
                  className="h-4 w-4 rounded border-[#cfd7f3] text-[var(--primary)] focus:ring-[var(--primary-soft)]"
                />
                <span>
                  <span className="block text-sm font-medium text-[var(--foreground)]">
                    Открытый урок
                  </span>
                  <span className="block text-xs text-[var(--muted)]">
                    Можно показывать без записи как превью.
                  </span>
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a6548]">
                Название урока
              </p>
              <p className="mt-3 text-base font-semibold text-[var(--foreground)]">{draftTitle}</p>
            </div>

            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a6548]">
                Доступ
              </p>
              <p className="mt-3 text-base font-semibold text-[var(--foreground)]">
                {draftAccessAfterDays ? `Через ${draftAccessAfterDays} дн.` : "Сразу"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {draftIsPreview ? "Открытый урок" : "Только для студентов курса"}
              </p>
            </div>

            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a6548]">
                Краткое описание
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
                {draftExcerpt || "Описание пока не заполнено."}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
