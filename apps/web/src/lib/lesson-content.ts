import type { Prisma } from "@academy/db";

export type LessonAttachment = {
  title: string;
  url: string;
  note?: string;
};

export type LessonBlockType = "TEXT" | "VIDEO" | "FILE" | "HOMEWORK";

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
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeBlockId(rawId: unknown, index: number) {
  return typeof rawId === "string" && rawId.trim()
    ? rawId.trim()
    : `block-${index + 1}`;
}

export function extractLessonBlocks(content: unknown): LessonBlock[] {
  if (isRecord(content) && Array.isArray(content.blocks)) {
    return content.blocks.flatMap<LessonBlock>((item, index) => {
      if (!isRecord(item) || typeof item.type !== "string") {
        return [];
      }

      const id = normalizeBlockId(item.id, index);
      const title = typeof item.title === "string" ? item.title.trim() : "";

      if (item.type === "TEXT") {
        return [
          {
            id,
            type: "TEXT",
            title: title || `Текстовый блок ${index + 1}`,
            body: typeof item.body === "string" ? item.body : "",
          } satisfies LessonBlock,
        ];
      }

      if (item.type === "VIDEO") {
        return [
          {
            id,
            type: "VIDEO",
            title: title || "Видео",
            body: typeof item.body === "string" ? item.body : "",
          } satisfies LessonBlock,
        ];
      }

      if (item.type === "FILE") {
        const url = typeof item.url === "string" ? item.url.trim() : "";

        if (!url) {
          return [];
        }

        return [
          {
            id,
            type: "FILE",
            title: title || `Материал ${index + 1}`,
            url,
            note: typeof item.note === "string" ? item.note : "",
          } satisfies LessonBlock,
        ];
      }

      if (item.type === "HOMEWORK") {
        return [
          {
            id,
            type: "HOMEWORK",
            title: title || "Домашняя работа",
            body: typeof item.body === "string" ? item.body : "",
            submissionHint:
              typeof item.submissionHint === "string" ? item.submissionHint : "",
          } satisfies LessonBlock,
        ];
      }

      return [];
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

  return fallbackBlocks;
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
  const normalizedBlocks = blocks.flatMap<Prisma.InputJsonObject>((block, index) => {
    const title = block.title.trim();

    if (block.type === "TEXT") {
      if (!title && !block.body.trim()) {
        return [];
      }

      return [
        {
          id: normalizeBlockId(block.id, index),
          type: "TEXT" as const,
          title: title || `Текстовый блок ${index + 1}`,
          body: block.body.trim(),
        },
      ];
    }

    if (block.type === "VIDEO") {
      if (!title && !block.body?.trim()) {
        return [];
      }

      return [
        {
          id: normalizeBlockId(block.id, index),
          type: "VIDEO" as const,
          title: title || "Видео",
          body: block.body?.trim() || "",
        },
      ];
    }

    if (block.type === "HOMEWORK") {
      if (!title && !block.body.trim() && !block.submissionHint?.trim()) {
        return [];
      }

      return [
        {
          id: normalizeBlockId(block.id, index),
          type: "HOMEWORK" as const,
          title: title || "Домашняя работа",
          body: block.body.trim(),
          submissionHint: block.submissionHint?.trim() || "",
        },
      ];
    }

    if (!block.url.trim()) {
      return [];
    }

    return [
      {
        id: normalizeBlockId(block.id, index),
        type: "FILE" as const,
        title: title || `Материал ${index + 1}`,
        url: block.url.trim(),
        note: block.note?.trim() || "",
      },
    ];
  });

  return normalizedBlocks.length > 0
    ? {
        blocks: normalizedBlocks as Prisma.InputJsonArray,
      }
    : null;
}
