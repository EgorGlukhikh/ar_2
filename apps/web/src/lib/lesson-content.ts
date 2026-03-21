export type LessonAttachment = {
  title: string;
  url: string;
};

export function extractLessonBody(content: unknown) {
  if (
    content &&
    typeof content === "object" &&
    "body" in content &&
    typeof content.body === "string"
  ) {
    return content.body;
  }

  return "";
}

export function extractLessonAttachments(content: unknown): LessonAttachment[] {
  if (!content || typeof content !== "object" || !("attachments" in content)) {
    return [];
  }

  const rawAttachments = (content as { attachments?: unknown }).attachments;

  if (!Array.isArray(rawAttachments)) {
    return [];
  }

  return rawAttachments.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const title =
      "title" in item && typeof item.title === "string" ? item.title.trim() : "";
    const url = "url" in item && typeof item.url === "string" ? item.url.trim() : "";

    if (!url) {
      return [];
    }

    return [
      {
        title: title || "Материал урока",
        url,
      },
    ];
  });
}

export function extractPrimaryLessonAttachment(
  content: unknown,
): LessonAttachment | null {
  return extractLessonAttachments(content)[0] ?? null;
}

export function buildLessonContent(params: {
  body?: string;
  attachmentTitle?: string;
  attachmentUrl?: string;
}) {
  const body = params.body?.trim();
  const attachmentUrl = params.attachmentUrl?.trim();
  const attachmentTitle = params.attachmentTitle?.trim();

  const payload: {
    body?: string;
    attachments?: LessonAttachment[];
  } = {};

  if (body) {
    payload.body = body;
  }

  if (attachmentUrl) {
    payload.attachments = [
      {
        title: attachmentTitle || "Материал урока",
        url: attachmentUrl,
      },
    ];
  }

  return Object.keys(payload).length > 0 ? payload : null;
}
