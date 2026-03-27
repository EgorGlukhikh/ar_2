import type {
  LessonContentBlockType as DbLessonContentBlockType,
  Prisma,
} from "@academy/db";

import {
  decodeHomeworkPayload,
  encodeHomeworkPayload,
  type HomeworkQuestion,
} from "./homework-builder";

export type LessonAttachment = {
  title: string;
  url: string;
  note?: string;
};

export type LessonBlockType = "TEXT" | "VIDEO" | "FILE" | "HOMEWORK" | "AUDIO";

export type LessonBlock =
  | {
      id: string;
      type: "TEXT";
      title: string;
      body: string;
    }
  | {
      id: string;
      type: "VIDEO";
      title: string;
      body?: string;
    }
  | {
      id: string;
      type: "FILE";
      title: string;
      url: string;
      note?: string;
    }
  | {
      id: string;
      type: "HOMEWORK";
      title: string;
      body: string;
      submissionHint?: string;
      questions?: HomeworkQuestion[];
    }
  | {
      id: string;
      type: "AUDIO";
      title: string;
      url: string;
    };

export type PersistedLessonBlockRecord = {
  blockKey: string;
  type: DbLessonContentBlockType | LessonBlockType;
  position: number;
  title: string;
  body: string | null;
  url: string | null;
  note: string | null;
  submissionHint: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeBlockId(rawId: unknown, index: number) {
  return typeof rawId === "string" && rawId.trim()
    ? rawId.trim()
    : `block-${index + 1}`;
}

function getDefaultTitle(type: LessonBlockType, index: number) {
  if (type === "TEXT") {
    return `Текстовый блок ${index + 1}`;
  }

  if (type === "VIDEO") {
    return "Видео";
  }

  if (type === "HOMEWORK") {
    return "Домашнее задание";
  }

  if (type === "AUDIO") {
    return `Аудио ${index + 1}`;
  }

  return `Материал ${index + 1}`;
}

function normalizeLessonBlock(block: LessonBlock, index: number): LessonBlock | null {
  const id = normalizeBlockId(block.id, index);
  const title = block.title.trim() || getDefaultTitle(block.type, index);

  if (block.type === "TEXT") {
    const body = block.body.trim();

    if (!title && !body) {
      return null;
    }

    return {
      id,
      type: "TEXT",
      title,
      body,
    };
  }

  if (block.type === "VIDEO") {
    const body = block.body?.trim() || "";

    if (!title && !body) {
      return null;
    }

    return {
      id,
      type: "VIDEO",
      title,
      body,
    };
  }

  if (block.type === "HOMEWORK") {
    const body = block.body.trim();
    const submissionHint = block.submissionHint?.trim() || "";
    const questions = block.questions ?? [];

    if (!title && !body && !submissionHint && questions.length === 0) {
      return null;
    }

    return {
      id,
      type: "HOMEWORK",
      title,
      body,
      submissionHint,
      questions,
    };
  }

  if (block.type === "AUDIO") {
    const url = block.url.trim();
    if (!url) return null;
    return { id, type: "AUDIO" as const, title, url };
  }

  const url = block.url.trim();
  const note = block.note?.trim() || "";

  if (!url) {
    return null;
  }

  return {
    id,
    type: "FILE",
    title,
    url,
    note,
  };
}

export function normalizeLessonBlocks(blocks: LessonBlock[]) {
  return blocks.flatMap((block, index) => {
    const normalizedBlock = normalizeLessonBlock(block, index);
    return normalizedBlock ? [normalizedBlock] : [];
  });
}

function parseStructuredContentBlock(
  item: Record<string, unknown>,
  index: number,
): LessonBlock | null {
  if (item.type === "TEXT") {
    return normalizeLessonBlock(
      {
        id: normalizeBlockId(item.id, index),
        type: "TEXT",
        title: typeof item.title === "string" ? item.title : "",
        body: typeof item.body === "string" ? item.body : "",
      },
      index,
    );
  }

  if (item.type === "VIDEO") {
    return normalizeLessonBlock(
      {
        id: normalizeBlockId(item.id, index),
        type: "VIDEO",
        title: typeof item.title === "string" ? item.title : "",
        body: typeof item.body === "string" ? item.body : "",
      },
      index,
    );
  }

  if (item.type === "FILE") {
    return normalizeLessonBlock(
      {
        id: normalizeBlockId(item.id, index),
        type: "FILE",
        title: typeof item.title === "string" ? item.title : "",
        url: typeof item.url === "string" ? item.url : "",
        note: typeof item.note === "string" ? item.note : "",
      },
      index,
    );
  }

  if (item.type === "HOMEWORK") {
    const decodedHomeworkPayload = decodeHomeworkPayload(
      typeof item.submissionHint === "string" ? item.submissionHint : "",
    );

    return normalizeLessonBlock(
      {
        id: normalizeBlockId(item.id, index),
        type: "HOMEWORK",
        title: typeof item.title === "string" ? item.title : "",
        body: typeof item.body === "string" ? item.body : "",
        submissionHint: decodedHomeworkPayload.hint,
        questions: decodedHomeworkPayload.questions,
      },
      index,
    );
  }

  if (item.type === "AUDIO") {
    return normalizeLessonBlock(
      {
        id: normalizeBlockId(item.id, index),
        type: "AUDIO",
        title: typeof item.title === "string" ? item.title : "",
        url: typeof item.url === "string" ? item.url : "",
      },
      index,
    );
  }

  return null;
}

export function extractLessonBlocks(content: unknown): LessonBlock[] {
  if (isRecord(content) && Array.isArray(content.blocks)) {
    return content.blocks.flatMap((item, index) => {
      if (!isRecord(item) || typeof item.type !== "string") {
        return [];
      }

      const block = parseStructuredContentBlock(item, index);
      return block ? [block] : [];
    });
  }

  const fallbackBlocks: LessonBlock[] = [];

  if (isRecord(content) && typeof content.body === "string" && content.body.trim()) {
    fallbackBlocks.push({
      id: "legacy-text",
      type: "TEXT",
      title: "Основной текст",
      body: content.body,
    });
  }

  if (isRecord(content) && Array.isArray(content.attachments)) {
    content.attachments.forEach((item, index) => {
      if (!isRecord(item)) {
        return;
      }

      const url = typeof item.url === "string" ? item.url.trim() : "";

      if (!url) {
        return;
      }

      fallbackBlocks.push({
        id: `legacy-file-${index + 1}`,
        type: "FILE",
        title:
          typeof item.title === "string" && item.title.trim()
            ? item.title.trim()
            : `Материал ${index + 1}`,
        url,
        note: "",
      });
    });
  }

  return normalizeLessonBlocks(fallbackBlocks);
}

export function extractLessonBlocksFromRecords(
  lessonBlocks?: readonly PersistedLessonBlockRecord[] | null,
): LessonBlock[] {
  if (!lessonBlocks || lessonBlocks.length === 0) {
    return [];
  }

  const normalizedBlocks: LessonBlock[] = [];

  lessonBlocks
    .slice()
    .sort((left, right) => left.position - right.position)
    .forEach((block, index) => {
      if (block.type === "TEXT") {
        normalizedBlocks.push({
          id: block.blockKey,
          type: "TEXT",
          title: block.title,
          body: block.body ?? "",
        });
        return;
      }

      if (block.type === "VIDEO") {
        normalizedBlocks.push({
          id: block.blockKey,
          type: "VIDEO",
          title: block.title,
          body: block.body ?? "",
        });
        return;
      }

      if (block.type === "FILE") {
        if (block.url) {
          normalizedBlocks.push({
            id: block.blockKey,
            type: "FILE",
            title: block.title,
            url: block.url,
            note: block.note ?? "",
          });
        }
        return;
      }

      if (block.type === "HOMEWORK") {
        const decodedHomeworkPayload = decodeHomeworkPayload(block.submissionHint);

        normalizedBlocks.push({
          id: block.blockKey,
          type: "HOMEWORK",
          title: block.title,
          body: block.body ?? "",
          submissionHint: decodedHomeworkPayload.hint,
          questions: decodedHomeworkPayload.questions,
        });
        return;
      }

      if (block.type === "AUDIO") {
        if (block.url) {
          normalizedBlocks.push({
            id: block.blockKey,
            type: "AUDIO",
            title: block.title,
            url: block.url,
          });
        }
        return;
      }

      normalizedBlocks.push({
        id: normalizeBlockId(block.blockKey, index),
        type: "TEXT",
        title: block.title,
        body: block.body ?? "",
      });
    });

  return normalizedBlocks;
}

export function resolveLessonBlocks(args: {
  content: unknown;
  lessonBlocks?: readonly PersistedLessonBlockRecord[] | null;
}) {
  const persistedBlocks = extractLessonBlocksFromRecords(args.lessonBlocks);

  if (persistedBlocks.length > 0) {
    return persistedBlocks;
  }

  return extractLessonBlocks(args.content);
}

export function extractLessonBody(content: unknown) {
  return extractLessonBlocks(content)
    .filter((block): block is Extract<LessonBlock, { type: "TEXT" }> => block.type === "TEXT")
    .map((block) => block.body.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function extractLessonAttachments(content: unknown): LessonAttachment[] {
  return extractLessonBlocks(content).flatMap((block) => {
    if (block.type !== "FILE") {
      return [];
    }

    return [
      {
        title: block.title,
        url: block.url,
        note: block.note,
      },
    ];
  });
}

export function extractPrimaryLessonAttachment(
  content: unknown,
): LessonAttachment | null {
  return extractLessonAttachments(content)[0] ?? null;
}

export function hasLessonVideoBlock(content: unknown) {
  return extractLessonBlocks(content).some((block) => block.type === "VIDEO");
}

export function buildLessonContentFromBlocks(
  blocks: LessonBlock[],
): Prisma.InputJsonObject | null {
  const normalizedBlocks = normalizeLessonBlocks(blocks).map((block) => {
    if (block.type === "TEXT") {
      return {
        id: block.id,
        type: "TEXT" as const,
        title: block.title,
        body: block.body,
      };
    }

    if (block.type === "VIDEO") {
      return {
        id: block.id,
        type: "VIDEO" as const,
        title: block.title,
        body: block.body ?? "",
      };
    }

    if (block.type === "HOMEWORK") {
      return {
        id: block.id,
        type: "HOMEWORK" as const,
        title: block.title,
        body: block.body,
        submissionHint: encodeHomeworkPayload({
          hint: block.submissionHint ?? "",
          questions: block.questions ?? [],
        }),
      };
    }

    if (block.type === "AUDIO") {
      return {
        id: block.id,
        type: "AUDIO" as const,
        title: block.title,
        url: block.url,
      };
    }

    return {
      id: block.id,
      type: "FILE" as const,
      title: block.title,
      url: block.url,
      note: block.note ?? "",
    };
  });

  return normalizedBlocks.length > 0
    ? {
        blocks: normalizedBlocks as Prisma.InputJsonArray,
      }
    : null;
}

export function buildPersistedLessonBlocks(blocks: LessonBlock[]) {
  return normalizeLessonBlocks(blocks).map((block, index) => ({
    blockKey: block.id,
    type: block.type as DbLessonContentBlockType,
    position: index + 1,
    title: block.title,
    body:
      block.type === "TEXT" || block.type === "VIDEO" || block.type === "HOMEWORK"
        ? block.body ?? ""
        : null,
    url: block.type === "FILE" || block.type === "AUDIO" ? block.url : null,
    note: block.type === "FILE" ? block.note ?? "" : null,
    submissionHint:
      block.type === "HOMEWORK"
        ? encodeHomeworkPayload({
            hint: block.submissionHint ?? "",
            questions: block.questions ?? [],
          })
        : null,
  }));
}
