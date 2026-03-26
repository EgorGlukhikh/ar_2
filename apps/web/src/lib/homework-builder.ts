export type HomeworkQuestionType = "single_choice" | "multiple_choice" | "free_text";

export type HomeworkChoiceOption = {
  id: string;
  text: string;
  isCorrect?: boolean;
};

export type HomeworkQuestion =
  | {
      id: string;
      type: "single_choice";
      prompt: string;
      options: HomeworkChoiceOption[];
    }
  | {
      id: string;
      type: "multiple_choice";
      prompt: string;
      options: HomeworkChoiceOption[];
    }
  | {
      id: string;
      type: "free_text";
      prompt: string;
      placeholder?: string;
    };

type HomeworkPayload = {
  hint: string;
  questions: HomeworkQuestion[];
};

const HOMEWORK_PAYLOAD_PREFIX = "__AR_HOMEWORK__:";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeId(rawId: unknown, fallback: string) {
  return typeof rawId === "string" && rawId.trim() ? rawId.trim() : fallback;
}

function normalizeChoiceOption(
  option: unknown,
  fallbackId: string,
): HomeworkChoiceOption | null {
  if (!isRecord(option)) {
    return null;
  }

  const text = typeof option.text === "string" ? option.text.trim() : "";

  if (!text) {
    return null;
  }

  return {
    id: normalizeId(option.id, fallbackId),
    text,
    isCorrect: Boolean(option.isCorrect),
  };
}

function normalizeQuestion(
  question: unknown,
  index: number,
): HomeworkQuestion | null {
  if (!isRecord(question) || typeof question.type !== "string") {
    return null;
  }

  const prompt = typeof question.prompt === "string" ? question.prompt.trim() : "";

  if (!prompt) {
    return null;
  }

  if (question.type === "single_choice" || question.type === "multiple_choice") {
    const rawOptions = Array.isArray(question.options) ? question.options : [];
    const options = rawOptions.flatMap((option, optionIndex) => {
      const normalized = normalizeChoiceOption(option, `option-${index + 1}-${optionIndex + 1}`);
      return normalized ? [normalized] : [];
    });

    if (options.length < 2) {
      return null;
    }

    return {
      id: normalizeId(question.id, `question-${index + 1}`),
      type: question.type,
      prompt,
      options,
    };
  }

  if (question.type === "free_text") {
    return {
      id: normalizeId(question.id, `question-${index + 1}`),
      type: "free_text",
      prompt,
      placeholder:
        typeof question.placeholder === "string" ? question.placeholder.trim() : "",
    };
  }

  return null;
}

export function normalizeHomeworkQuestions(questions: HomeworkQuestion[]) {
  return questions.flatMap((question, index) => {
    const normalizedQuestion = normalizeQuestion(question, index);
    return normalizedQuestion ? [normalizedQuestion] : [];
  });
}

export function decodeHomeworkPayload(rawValue?: string | null): HomeworkPayload {
  if (!rawValue) {
    return {
      hint: "",
      questions: [],
    };
  }

  if (!rawValue.startsWith(HOMEWORK_PAYLOAD_PREFIX)) {
    return {
      hint: rawValue,
      questions: [],
    };
  }

  try {
    const parsed = JSON.parse(rawValue.slice(HOMEWORK_PAYLOAD_PREFIX.length)) as unknown;

    if (!isRecord(parsed)) {
      return {
        hint: rawValue,
        questions: [],
      };
    }

    return {
      hint: typeof parsed.hint === "string" ? parsed.hint : "",
      questions: Array.isArray(parsed.questions)
        ? parsed.questions.flatMap((question, index) => {
            const normalized = normalizeQuestion(question, index);
            return normalized ? [normalized] : [];
          })
        : [],
    };
  } catch {
    return {
      hint: rawValue,
      questions: [],
    };
  }
}

export function encodeHomeworkPayload(payload: HomeworkPayload) {
  const hint = payload.hint.trim();
  const questions = normalizeHomeworkQuestions(payload.questions);

  if (questions.length === 0) {
    return hint;
  }

  return `${HOMEWORK_PAYLOAD_PREFIX}${JSON.stringify({
    hint,
    questions,
  })}`;
}

export function createQuestionTemplate(type: HomeworkQuestionType, order: number): HomeworkQuestion {
  const id = `question-${Date.now()}-${order}`;

  if (type === "free_text") {
    return {
      id,
      type,
      prompt: `Вопрос ${order}`,
      placeholder: "Введите ответ своими словами",
    };
  }

  return {
    id,
    type,
    prompt: `Вопрос ${order}`,
    options: [
      {
        id: `${id}-option-1`,
        text: "Вариант 1",
      },
      {
        id: `${id}-option-2`,
        text: "Вариант 2",
      },
      {
        id: `${id}-option-3`,
        text: "Вариант 3",
      },
    ],
  };
}
