"use client";

import {
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  GripVertical,
  Paperclip,
  PencilLine,
  Plus,
  SquareCheckBig,
  Type,
  Video,
  X,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";

import { AdminLessonVideoManager } from "@/components/admin/admin-lesson-video-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createQuestionTemplate,
  encodeHomeworkPayload,
  type HomeworkChoiceOption,
  type HomeworkQuestion,
} from "@/lib/homework-builder";
import type { LessonBlock } from "@/lib/lesson-content";

type VideoAssetState = {
  id: string;
  provider: string;
  sourceType: string;
  status: string;
  originalFilename: string | null;
  sourceUrl: string | null;
  playerUrl: string | null;
  playbackId: string | null;
  errorMessage: string | null;
};

type LessonBlockStudioProps = {
  lessonId: string;
  initialBlocks: LessonBlock[];
  initialAsset: VideoAssetState | null;
  fallbackVideoSourceType?: string | null;
  fallbackVideoUrl?: string | null;
  fallbackVideoPlaybackId?: string | null;
};

type BlockTypeOption = {
  type: LessonBlock["type"];
  label: string;
  icon: typeof Type;
  description: string;
  accentClassName: string;
};

const blockTypeOptions: BlockTypeOption[] = [
  {
    type: "TEXT",
    label: "Текст",
    icon: Type,
    description: "Конспект, инструкция, тезисы или пояснение к уроку.",
    accentClassName: "bg-[#eef4ff] text-[#2840db]",
  },
  {
    type: "VIDEO",
    label: "Видео",
    icon: Video,
    description: "Видео-блок с подводкой и управлением источником.",
    accentClassName: "bg-[#eefbf4] text-[#0f7a47]",
  },
  {
    type: "FILE",
    label: "Файл",
    icon: Paperclip,
    description: "PDF, шаблон, ссылка на документ или внешний материал.",
    accentClassName: "bg-[#fff6e8] text-[#9a5a00]",
  },
  {
    type: "HOMEWORK",
    label: "Задание",
    icon: ClipboardCheck,
    description: "Домашняя работа и правила сдачи для студента.",
    accentClassName: "bg-[#fff0f0] text-[#b42318]",
  },
];

function createBlock(type: LessonBlock["type"], order: number): LessonBlock {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `block-${Date.now()}-${order}`;

  if (type === "TEXT") {
    return {
      id,
      type,
      title: `Текстовый блок ${order}`,
      body: "",
    };
  }

  if (type === "VIDEO") {
    return {
      id,
      type,
      title: "Видео",
      body: "",
    };
  }

  if (type === "HOMEWORK") {
    return {
      id,
      type,
      title: "Домашнее задание",
      body: "",
      submissionHint: "",
      questions: [],
    };
  }

  return {
    id,
    type,
    title: `Материал ${order}`,
    url: "",
    note: "",
  };
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function getBlockTypeMeta(type: LessonBlock["type"]) {
  return blockTypeOptions.find((item) => item.type === type) ?? blockTypeOptions[0];
}

function getBlockPreview(block: LessonBlock) {
  if (block.type === "TEXT") {
    return block.body.trim() || "Добавь основной текст урока.";
  }

  if (block.type === "VIDEO") {
    return block.body?.trim() || "Опиши, что важно вынести из этого видео.";
  }

  if (block.type === "FILE") {
    return block.url.trim() || "Добавь ссылку на материал.";
  }

  if (block.questions && block.questions.length > 0) {
    return `Вопросов: ${block.questions.length}. ${block.body.trim() || "Опиши, что именно должен сдать студент."}`;
  }

  return block.body.trim() || "Опиши, что именно должен сдать студент.";
}

function getQuestionTypeLabel(type: HomeworkQuestion["type"]) {
  if (type === "single_choice") {
    return "Один ответ";
  }

  if (type === "multiple_choice") {
    return "Несколько ответов";
  }

  return "Свободный ответ";
}

export function LessonBlockStudio({
  lessonId,
  initialBlocks,
  initialAsset,
  fallbackVideoSourceType,
  fallbackVideoUrl,
  fallbackVideoPlaybackId,
}: LessonBlockStudioProps) {
  const [blocks, setBlocks] = useState<LessonBlock[]>(initialBlocks);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    initialBlocks.map((block) => block.id),
  );
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const hasVideoBlock = useMemo(() => blocks.some((block) => block.type === "VIDEO"), [blocks]);
  const hasHomeworkBlock = useMemo(
    () => blocks.some((block) => block.type === "HOMEWORK"),
    [blocks],
  );
  const textBlockCount = useMemo(
    () => blocks.filter((block) => block.type === "TEXT").length,
    [blocks],
  );

  function ensureExpanded(id: string) {
    setExpandedIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  function toggleExpanded(id: string) {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function startEditing(id: string) {
    ensureExpanded(id);
    setEditingIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  function stopEditing(id: string) {
    setEditingIds((current) => current.filter((item) => item !== id));
  }

  function addBlock(type: LessonBlock["type"]) {
    if (type === "VIDEO" && hasVideoBlock) {
      return;
    }

    if (type === "HOMEWORK" && hasHomeworkBlock) {
      return;
    }

    const nextBlock = createBlock(type, blocks.length + 1);
    setBlocks((current) => [...current, nextBlock]);
    ensureExpanded(nextBlock.id);
    startEditing(nextBlock.id);
    setIsPickerOpen(false);
  }

  function updateBlock(id: string, patch: Partial<LessonBlock>) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? ({ ...block, ...patch } as LessonBlock) : block)),
    );
  }

  function removeBlock(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id));
    setExpandedIds((current) => current.filter((item) => item !== id));
    setEditingIds((current) => current.filter((item) => item !== id));
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      return;
    }

    setBlocks((current) => {
      const fromIndex = current.findIndex((block) => block.id === draggedId);
      const toIndex = current.findIndex((block) => block.id === targetId);

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      return moveItem(current, fromIndex, toIndex);
    });

    setDraggedId(null);
  }

  function addHomeworkQuestion(blockId: string, type: HomeworkQuestion["type"]) {
    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== blockId || block.type !== "HOMEWORK") {
          return block;
        }

        const questions = block.questions ?? [];
        const nextQuestion = createQuestionTemplate(type, questions.length + 1);

        return {
          ...block,
          questions: [...questions, nextQuestion],
        };
      }),
    );
  }

  function updateHomeworkQuestion(
    blockId: string,
    questionId: string,
    patch: Partial<HomeworkQuestion>,
  ) {
    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== blockId || block.type !== "HOMEWORK") {
          return block;
        }

        return {
          ...block,
          questions: (block.questions ?? []).map((question) =>
            question.id === questionId ? ({ ...question, ...patch } as HomeworkQuestion) : question,
          ),
        };
      }),
    );
  }

  function removeHomeworkQuestion(blockId: string, questionId: string) {
    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== blockId || block.type !== "HOMEWORK") {
          return block;
        }

        return {
          ...block,
          questions: (block.questions ?? []).filter((question) => question.id !== questionId),
        };
      }),
    );
  }

  function updateHomeworkOption(
    blockId: string,
    questionId: string,
    optionId: string,
    patch: Partial<HomeworkChoiceOption>,
  ) {
    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== blockId || block.type !== "HOMEWORK") {
          return block;
        }

        return {
          ...block,
          questions: (block.questions ?? []).map((question) => {
            if (question.id !== questionId || question.type === "free_text") {
              return question;
            }

            return {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId ? { ...option, ...patch } : option,
              ),
            };
          }),
        };
      }),
    );
  }

  function toggleHomeworkOptionCorrect(
    blockId: string,
    question: Extract<HomeworkQuestion, { type: "single_choice" | "multiple_choice" }>,
    optionId: string,
  ) {
    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== blockId || block.type !== "HOMEWORK") {
          return block;
        }

        return {
          ...block,
          questions: (block.questions ?? []).map((item) => {
            if (item.id !== question.id || item.type === "free_text") {
              return item;
            }

            return {
              ...item,
              options: item.options.map((option) => {
                if (item.type === "single_choice") {
                  return {
                    ...option,
                    isCorrect: option.id === optionId,
                  };
                }

                if (option.id !== optionId) {
                  return option;
                }

                return {
                  ...option,
                  isCorrect: !option.isCorrect,
                };
              }),
            };
          }),
        };
      }),
    );
  }

  function addHomeworkOption(blockId: string, questionId: string) {
    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== blockId || block.type !== "HOMEWORK") {
          return block;
        }

        return {
          ...block,
          questions: (block.questions ?? []).map((question) => {
            if (question.id !== questionId || question.type === "free_text") {
              return question;
            }

            return {
              ...question,
              options: [
                ...question.options,
                {
                  id: `${question.id}-option-${question.options.length + 1}`,
                  text: `Вариант ${question.options.length + 1}`,
                },
              ],
            };
          }),
        };
      }),
    );
  }

  function removeHomeworkOption(blockId: string, questionId: string, optionId: string) {
    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== blockId || block.type !== "HOMEWORK") {
          return block;
        }

        return {
          ...block,
          questions: (block.questions ?? []).map((question) => {
            if (question.id !== questionId || question.type === "free_text") {
              return question;
            }

            return {
              ...question,
              options: question.options.filter((option) => option.id !== optionId),
            };
          }),
        };
      }),
    );
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => (
        <Fragment key={`persisted-${block.id}`}>
          <input type="hidden" name="lessonBlockId" value={block.id} />
          <input type="hidden" name="lessonBlockType" value={block.type} />
          <input type="hidden" name="lessonBlockPosition" value={index + 1} />
          <input type="hidden" name="lessonBlockTitle" value={block.title} />
          <input
            type="hidden"
            name="lessonBlockBody"
            value={"body" in block ? (block.body ?? "") : ""}
          />
          <input
            type="hidden"
            name="lessonBlockUrl"
            value={"url" in block ? (block.url ?? "") : ""}
          />
          <input
            type="hidden"
            name="lessonBlockNote"
            value={"note" in block ? (block.note ?? "") : ""}
          />
          <input
            type="hidden"
            name="lessonBlockSubmissionHint"
            value={
              block.type === "HOMEWORK"
                ? encodeHomeworkPayload({
                    hint: block.submissionHint ?? "",
                    questions: block.questions ?? [],
                  })
                : ""
            }
          />
        </Fragment>
      ))}

      <div className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,_#fbfcff_0%,_#f5f7ff_100%)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Холст урока
            </p>
            <h3 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Структура урока по блокам
            </h3>
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Урок собирается как последовательность независимых блоков. Здесь можно менять
              порядок, комбинировать форматы и держать весь контент в одном сценарии.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:max-w-[420px] lg:justify-end">
            <Badge variant="neutral">Всего блоков {blocks.length}</Badge>
            <Badge variant="neutral">Текста {textBlockCount}</Badge>
            <Badge variant={hasVideoBlock ? "success" : "neutral"}>
              {hasVideoBlock ? "Видео добавлено" : "Без видео"}
            </Badge>
            <Badge variant={hasHomeworkBlock ? "warning" : "neutral"}>
              {hasHomeworkBlock ? "Есть задание" : "Без домашки"}
            </Badge>
          </div>
        </div>
      </div>

      {blocks.length > 0 ? (
        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
          <p className="text-sm leading-7 text-[var(--foreground)]">
            Блоки ниже по умолчанию открываются в режиме просмотра. Если нужно изменить
            содержимое конкретного блока, нажми «Редактировать» в его шапке.
          </p>
        </div>
      ) : null}

      {blocks.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Пустой урок
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Добавь первый блок
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Начни с текста, видео, файла или задания. После этого урок уже можно будет собрать
            как полноценный сценарий.
          </p>
          <div className="mt-5">
            <Button type="button" onClick={() => setIsPickerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Выбрать тип блока
            </Button>
          </div>
        </div>
      ) : null}

      {blocks.map((block, index) => {
        const isExpanded = expandedIds.includes(block.id);
        const isEditing = editingIds.includes(block.id);
        const meta = getBlockTypeMeta(block.type);
        const Icon = meta.icon;

        return (
          <section
            key={block.id}
            draggable
            onDragStart={() => setDraggedId(block.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(block.id)}
            className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-sm"
          >
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
              <button
                type="button"
                onClick={() => toggleExpanded(block.id)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
              >
                <div
                  className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.accentClassName}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                      Блок {index + 1}
                    </p>
                    <Badge variant="neutral">{meta.label}</Badge>
                    {block.type === "HOMEWORK" && block.questions && block.questions.length > 0 ? (
                      <Badge variant="warning">Вопросов {block.questions.length}</Badge>
                    ) : null}
                  </div>

                  <h3 className="mt-2 truncate text-lg font-semibold tracking-tight text-[var(--foreground)]">
                    {isEditing
                      ? `Редактирование: ${block.title || meta.label}`
                      : block.title || meta.label}
                  </h3>
                  {!isEditing ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                      {getBlockPreview(block)}
                    </p>
                  ) : null}
                </div>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    isEditing ? stopEditing(block.id) : startEditing(block.id)
                  }
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  {isEditing ? "Готово" : "Редактировать"}
                </Button>

                <button
                  type="button"
                  className="rounded-2xl border border-[var(--border)] bg-white p-2 text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  aria-label="Перетащить блок"
                >
                  <GripVertical className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => toggleExpanded(block.id)}
                  className="rounded-2xl border border-[var(--border)] bg-white p-2 text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  aria-label={isExpanded ? "Свернуть блок" : "Развернуть блок"}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="rounded-2xl border border-red-200 bg-white p-2 text-red-500 transition hover:bg-red-50"
                  aria-label="Удалить блок"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {isExpanded ? (
              <div className="space-y-5 px-5 py-5">
                {isEditing ? (
                  <>
                <div className="space-y-2">
                  <Label htmlFor={`block-title-${block.id}`}>Название блока</Label>
                  <Input
                    id={`block-title-${block.id}`}
                    value={block.title}
                    onChange={(event) =>
                      updateBlock(block.id, { title: event.target.value } as Partial<LessonBlock>)
                    }
                    placeholder="Например, Разбор кейса или Домашнее задание"
                  />
                </div>

                {block.type === "TEXT" ? (
                  <div className="space-y-2">
                    <Label htmlFor={`block-body-${block.id}`}>Содержимое блока</Label>
                    <Textarea
                      id={`block-body-${block.id}`}
                      value={block.body}
                      onChange={(event) =>
                        updateBlock(block.id, { body: event.target.value } as Partial<LessonBlock>)
                      }
                      placeholder="Основной текст, тезисы, инструкции или описание шага."
                      className="min-h-[220px]"
                    />
                  </div>
                ) : null}

                {block.type === "VIDEO" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`block-video-note-${block.id}`}>
                        Подводка к видео
                      </Label>
                      <Textarea
                        id={`block-video-note-${block.id}`}
                        value={block.body ?? ""}
                        onChange={(event) =>
                          updateBlock(block.id, { body: event.target.value } as Partial<LessonBlock>)
                        }
                        placeholder="Коротко объясни, зачем смотреть это видео и на что обратить внимание."
                        className="min-h-[120px]"
                      />
                    </div>

                    <AdminLessonVideoManager
                      lessonId={lessonId}
                      initialAsset={initialAsset}
                      fallbackVideoSourceType={fallbackVideoSourceType}
                      fallbackVideoUrl={fallbackVideoUrl}
                      fallbackVideoPlaybackId={fallbackVideoPlaybackId}
                      onResolvedTitle={(resolvedTitle) =>
                        updateBlock(block.id, {
                          title: resolvedTitle,
                        } as Partial<LessonBlock>)
                      }
                    />
                  </div>
                ) : null}

                {block.type === "FILE" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`block-file-url-${block.id}`}>Ссылка на материал</Label>
                      <Input
                        id={`block-file-url-${block.id}`}
                        value={block.url}
                        onChange={(event) =>
                          updateBlock(block.id, { url: event.target.value } as Partial<LessonBlock>)
                        }
                        placeholder="https://disk.yandex.ru/... или https://example.com/file.pdf"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`block-file-note-${block.id}`}>Комментарий</Label>
                      <Input
                        id={`block-file-note-${block.id}`}
                        value={block.note ?? ""}
                        onChange={(event) =>
                          updateBlock(block.id, { note: event.target.value } as Partial<LessonBlock>)
                        }
                        placeholder="Что это за файл и когда его открыть"
                      />
                    </div>
                  </div>
                ) : null}

                {block.type === "HOMEWORK" ? (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`block-homework-body-${block.id}`}>
                        Описание задания
                      </Label>
                      <Textarea
                        id={`block-homework-body-${block.id}`}
                        value={block.body}
                        onChange={(event) =>
                          updateBlock(block.id, { body: event.target.value } as Partial<LessonBlock>)
                        }
                        placeholder="Что студент должен сделать по итогам урока."
                        className="min-h-[160px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`block-homework-hint-${block.id}`}>
                        Как сдавать работу
                      </Label>
                      <Textarea
                        id={`block-homework-hint-${block.id}`}
                        value={block.submissionHint ?? ""}
                        onChange={(event) =>
                          updateBlock(
                            block.id,
                            { submissionHint: event.target.value } as Partial<LessonBlock>,
                          )
                        }
                        placeholder="Например: прикрепить файл, вставить ссылку или написать ответ текстом."
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            Вопросы задания
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                            Готовые шаблоны: один ответ, несколько ответов или свободный ответ.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addHomeworkQuestion(block.id, "single_choice")}
                          >
                            Один ответ
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addHomeworkQuestion(block.id, "multiple_choice")}
                          >
                            Несколько ответов
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addHomeworkQuestion(block.id, "free_text")}
                          >
                            Свободный ответ
                          </Button>
                        </div>
                      </div>

                      {block.questions && block.questions.length > 0 ? (
                        <div className="mt-4 space-y-4">
                          {block.questions.map((question, questionIndex) => (
                            <div
                              key={question.id}
                              className="rounded-[20px] border border-[var(--border)] bg-white p-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="neutral">Вопрос {questionIndex + 1}</Badge>
                                  <Badge variant="warning">
                                    {getQuestionTypeLabel(question.type)}
                                  </Badge>
                                </div>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => removeHomeworkQuestion(block.id, question.id)}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Удалить
                                </Button>
                              </div>

                              <div className="mt-4 space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`question-prompt-${question.id}`}>
                                    Текст вопроса
                                  </Label>
                                  <Input
                                    id={`question-prompt-${question.id}`}
                                    value={question.prompt}
                                    onChange={(event) =>
                                      updateHomeworkQuestion(block.id, question.id, {
                                        prompt: event.target.value,
                                      })
                                    }
                                  />
                                </div>

                                {question.type === "free_text" ? (
                                  <div className="space-y-2">
                                    <Label htmlFor={`question-placeholder-${question.id}`}>
                                      Подсказка в поле ответа
                                    </Label>
                                    <Input
                                      id={`question-placeholder-${question.id}`}
                                      value={question.placeholder ?? ""}
                                      onChange={(event) =>
                                        updateHomeworkQuestion(block.id, question.id, {
                                          placeholder: event.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {question.options.map((option, optionIndex) => (
                                      <div
                                        key={option.id}
                                        className="grid gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-3 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
                                      >
                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleHomeworkOptionCorrect(block.id, question, option.id)
                                          }
                                          className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
                                            option.isCorrect
                                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                              : "border-[var(--border)] bg-white text-[var(--muted)]"
                                          }`}
                                          aria-label="Отметить верный вариант"
                                        >
                                          <SquareCheckBig className="h-4 w-4" />
                                        </button>

                                        <Input
                                          value={option.text}
                                          onChange={(event) =>
                                            updateHomeworkOption(
                                              block.id,
                                              question.id,
                                              option.id,
                                              { text: event.target.value },
                                            )
                                          }
                                          placeholder={`Вариант ${optionIndex + 1}`}
                                        />

                                        <Button
                                          type="button"
                                          size="sm"
                                          variant={option.isCorrect ? "default" : "outline"}
                                          onClick={() =>
                                            toggleHomeworkOptionCorrect(block.id, question, option.id)
                                          }
                                        >
                                          {question.type === "single_choice"
                                            ? "Верный"
                                            : option.isCorrect
                                              ? "Выбран"
                                              : "Отметить"}
                                        </Button>

                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          className="border-red-200 text-red-600 hover:bg-red-50"
                                          onClick={() =>
                                            removeHomeworkOption(block.id, question.id, option.id)
                                          }
                                        >
                                          Удалить
                                        </Button>
                                      </div>
                                    ))}

                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => addHomeworkOption(block.id, question.id)}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Добавить вариант
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-[18px] border border-dashed border-[var(--border)] bg-white p-4 text-sm text-[var(--muted)]">
                          Пока без вопросов. Можно оставить только текст задания или добавить шаблон выше.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
                  </>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}

      {blocks.length > 0 ? (
        <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Добавить следующий блок
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Собирай урок как цепочку шагов: вводный текст, видео, материалы и задание.
              </p>
            </div>

            <Button type="button" onClick={() => setIsPickerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить блок {blocks.length + 1}
            </Button>
          </div>
        </div>
      ) : null}

      {isPickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18203b]/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_32px_100px_rgba(28,36,66,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Добавить блок {blocks.length + 1}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  Выбери тип блока
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  У каждого блока своя задача в уроке. Видео и домашнее задание в текущей
                  версии держим по одному экземпляру на урок.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="rounded-2xl border border-[var(--border)] bg-white p-3 text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                aria-label="Закрыть выбор блока"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {blockTypeOptions.map((option) => {
                const Icon = option.icon;
                const disabled =
                  (option.type === "VIDEO" && hasVideoBlock) ||
                  (option.type === "HOMEWORK" && hasHomeworkBlock);

                return (
                  <button
                    key={option.type}
                    type="button"
                    disabled={disabled}
                    onClick={() => addBlock(option.type)}
                    className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:border-[var(--primary)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ${option.accentClassName}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                      {option.label}
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {disabled
                        ? "Этот тип уже используется в уроке. Сначала удали текущий блок этого формата."
                        : option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
