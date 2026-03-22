"use client";

import {
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  GripVertical,
  Paperclip,
  Plus,
  Trash2,
  Type,
  Video,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AdminLessonVideoManager } from "@/components/admin/admin-lesson-video-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
};

const blockTypeOptions: BlockTypeOption[] = [
  {
    type: "TEXT",
    label: "Текст",
    icon: Type,
    description: "Конспект, инструкция или пояснение.",
  },
  {
    type: "VIDEO",
    label: "Видео",
    icon: Video,
    description: "Ссылка или файл.",
  },
  {
    type: "FILE",
    label: "Файл",
    icon: Paperclip,
    description: "PDF, шаблон или внешний материал.",
  },
  {
    type: "HOMEWORK",
    label: "Задание",
    icon: ClipboardCheck,
    description: "Домашняя работа.",
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
      title: "Домашняя работа",
      body: "",
      submissionHint: "",
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

function getBlockTypeLabel(type: LessonBlock["type"]) {
  return blockTypeOptions.find((item) => item.type === type)?.label ?? type;
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
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const hasVideoBlock = useMemo(() => blocks.some((block) => block.type === "VIDEO"), [blocks]);
  const hasHomeworkBlock = useMemo(
    () => blocks.some((block) => block.type === "HOMEWORK"),
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

  return (
    <div className="space-y-4">
      <input type="hidden" name="blocksJson" value={JSON.stringify(blocks)} />

      {blocks.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Пустой урок
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Добавь первый блок
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Здесь пока нет контента.</p>
        </div>
      ) : null}

      {blocks.map((block, index) => {
        const isExpanded = expandedIds.includes(block.id);
        const Icon = blockTypeOptions.find((item) => item.type === block.type)?.icon ?? Type;

        return (
          <section
            key={block.id}
            draggable
            onDragStart={() => setDraggedId(block.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(block.id)}
            className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-sm"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
              <button
                type="button"
                onClick={() => toggleExpanded(block.id)}
                className="flex min-w-0 items-center gap-3 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Блок {index + 1}
                  </p>
                  <h3 className="truncate text-lg font-semibold tracking-tight text-[var(--foreground)]">
                    {block.title || getBlockTypeLabel(block.type)}
                  </h3>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <Badge variant="neutral">{getBlockTypeLabel(block.type)}</Badge>
                <button
                  type="button"
                  className="rounded-2xl border border-[var(--border)] bg-white p-2 text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  aria-label="Перетащить блок"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="rounded-2xl border border-red-200 bg-white p-2 text-red-500 transition hover:bg-red-50"
                  aria-label="Удалить блок"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleExpanded(block.id)}
                  className="rounded-2xl border border-[var(--border)] bg-white p-2 text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  aria-label={isExpanded ? "Свернуть блок" : "Развернуть блок"}
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </header>

            {isExpanded ? (
              <div className="space-y-5 px-5 py-5">
                <div className="space-y-2">
                  <Label htmlFor={`block-title-${block.id}`}>Название блока</Label>
                  <Input
                    id={`block-title-${block.id}`}
                    value={block.title}
                    onChange={(event) =>
                      updateBlock(block.id, { title: event.target.value } as Partial<LessonBlock>)
                    }
                    placeholder="Название блока"
                  />
                </div>

                {block.type === "TEXT" ? (
                  <div className="space-y-2">
                    <Label htmlFor={`block-body-${block.id}`}>Текст блока</Label>
                    <Textarea
                      id={`block-body-${block.id}`}
                      value={block.body}
                      onChange={(event) =>
                        updateBlock(block.id, { body: event.target.value } as Partial<LessonBlock>)
                      }
                      placeholder="Основной текст блока"
                        className="min-h-[180px]"
                    />
                  </div>
                ) : null}

                {block.type === "VIDEO" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`block-video-note-${block.id}`}>Короткая подводка</Label>
                      <Textarea
                        id={`block-video-note-${block.id}`}
                        value={block.body ?? ""}
                        onChange={(event) =>
                          updateBlock(block.id, { body: event.target.value } as Partial<LessonBlock>)
                        }
                        placeholder="Что студенту важно вынести из этого видео"
                        className="min-h-[100px]"
                      />
                    </div>

                    <AdminLessonVideoManager
                      lessonId={lessonId}
                      initialAsset={initialAsset}
                      fallbackVideoSourceType={fallbackVideoSourceType}
                      fallbackVideoUrl={fallbackVideoUrl}
                      fallbackVideoPlaybackId={fallbackVideoPlaybackId}
                    />
                  </div>
                ) : null}

                {block.type === "FILE" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`block-file-url-${block.id}`}>Ссылка на файл</Label>
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
                        placeholder="Короткий комментарий к файлу"
                      />
                    </div>
                  </div>
                ) : null}

                {block.type === "HOMEWORK" ? (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`block-homework-body-${block.id}`}>Описание задания</Label>
                      <Textarea
                        id={`block-homework-body-${block.id}`}
                        value={block.body}
                        onChange={(event) =>
                          updateBlock(block.id, { body: event.target.value } as Partial<LessonBlock>)
                        }
                        placeholder="Что нужно сделать"
                        className="min-h-[140px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`block-homework-hint-${block.id}`}>Как сдавать работу</Label>
                      <Textarea
                        id={`block-homework-hint-${block.id}`}
                        value={block.submissionHint ?? ""}
                        onChange={(event) =>
                          updateBlock(
                            block.id,
                            { submissionHint: event.target.value } as Partial<LessonBlock>,
                          )
                        }
                        placeholder="Например: прикрепить файл или вставить ссылку"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}

      <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
        <Button type="button" onClick={() => setIsPickerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить блок {blocks.length + 1}
        </Button>
      </div>

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
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                      {option.label}
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {disabled ? "Этот блок уже добавлен в урок." : option.description}
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
