"use client";

import { PencilLine, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomeworkRuleState = {
  requiresCuratorReview: boolean;
  unlockNextModuleOnApproval: boolean;
  allowTextSubmission: boolean;
  allowLinkSubmission: boolean;
  allowFileUpload: boolean;
};

type EditableHomeworkRulesCardProps = {
  formId: string;
  initialState: HomeworkRuleState;
  className?: string;
};

const homeworkRuleItems: Array<{
  key: keyof HomeworkRuleState;
  title: string;
  description: string;
}> = [
  {
    key: "requiresCuratorReview",
    title: "Проверка куратором",
    description: "Работа не считается принятой без ручной проверки.",
  },
  {
    key: "unlockNextModuleOnApproval",
    title: "Открывать следующий модуль после принятия",
    description: "Следующий модуль откроется только после одобрения задания.",
  },
  {
    key: "allowTextSubmission",
    title: "Разрешить текстовый ответ",
    description: "Студент может отправить развернутый текст в форме.",
  },
  {
    key: "allowLinkSubmission",
    title: "Разрешить ссылку",
    description: "Студент может отправить ссылку на документ или облако.",
  },
  {
    key: "allowFileUpload",
    title: "Разрешить файл",
    description: "Студент может прикрепить файл с выполненной работой.",
  },
];

export function EditableHomeworkRulesCard({
  formId,
  initialState,
  className,
}: EditableHomeworkRulesCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, setState] = useState(initialState);

  function resetState() {
    setState(initialState);
    setIsEditing(false);
  }

  return (
    <article
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {homeworkRuleItems.map((item) => (
        <input
          key={item.key}
          type="hidden"
          name={item.key}
          value={state[item.key] ? "true" : "false"}
          form={formId}
        />
      ))}

      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Домашняя работа
          </p>
          <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            Правила сдачи
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button type="submit" form={formId} size="sm">
                Сохранить урок
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={resetState}>
                <X className="mr-2 h-4 w-4" />
                Отмена
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <PencilLine className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-4 py-4">
        <div className="grid gap-2.5">
          {homeworkRuleItems.map((item) => (
            <label
              key={item.key}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-3.5 py-3"
            >
              <div className="flex items-start gap-3">
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={state[item.key]}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        [item.key]: event.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-[#cfd7f3] text-[var(--primary)] focus:ring-[var(--primary-soft)]"
                  />
                ) : (
                  <div
                    className={`mt-0.5 h-4 w-4 rounded-full border ${
                      state[item.key]
                        ? "border-[var(--primary)] bg-[var(--primary)]"
                        : "border-[var(--border)] bg-white"
                    }`}
                  />
                )}

                <span>
                  <span className="block text-sm font-medium text-[var(--foreground)]">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-[var(--muted)]">
                    {item.description}
                  </span>
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </article>
  );
}
