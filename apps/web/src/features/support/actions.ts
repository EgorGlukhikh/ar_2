"use server";

import { auth } from "@academy/auth";
import { EmailStatus, prisma } from "@academy/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  processDueEmailQueue,
  queueSupportRequestEmail,
} from "@/features/email/service";

export type SupportFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "comment", string>>;
};

export const initialSupportFormState: SupportFormState = {
  status: "idle",
};

const supportSchema = z.object({
  name: z.string().trim().min(2, "Укажи имя, чтобы мы понимали, как к тебе обратиться.").max(120),
  email: z.email("Укажи корректный email для ответа."),
  phone: z.string().trim().max(40, "Телефон получился слишком длинным.").optional(),
  comment: z
    .string()
    .trim()
    .min(12, "Опиши проблему чуть подробнее, хотя бы в одном-двух предложениях.")
    .max(4000, "Комментарий получился слишком длинным."),
  sourcePath: z.string().trim().max(300).optional(),
});

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitSupportRequestAction(
  _prevState: SupportFormState,
  formData: FormData,
): Promise<SupportFormState> {
  const session = await auth();

  const parsed = supportSchema.safeParse({
    name: getValue(formData, "name"),
    email: getValue(formData, "email").toLowerCase(),
    phone: getValue(formData, "phone") || undefined,
    comment: getValue(formData, "comment"),
    sourcePath: getValue(formData, "sourcePath") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Форма заполнена не до конца. Проверь поля и попробуй ещё раз.",
      fieldErrors: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        phone: fieldErrors.phone?.[0],
        comment: fieldErrors.comment?.[0],
      },
    };
  }

  try {
    const queued = await queueSupportRequestEmail({
      userId: session?.user?.id,
      senderName: parsed.data.name,
      senderEmail: parsed.data.email,
      senderPhone: parsed.data.phone,
      senderRole: session?.user?.role ?? null,
      isAuthenticated: Boolean(session?.user),
      comment: parsed.data.comment,
      sourcePath: parsed.data.sourcePath,
    });

    await processDueEmailQueue({ force: true, limit: 10 });

    const message = await prisma.emailMessage.findUnique({
      where: { id: queued.id },
      select: {
        status: true,
        lastError: true,
      },
    });

    if (!message) {
      return {
        status: "error",
        message: "Не удалось проверить статус письма. Попробуй ещё раз через минуту.",
      };
    }

    if (
      message.status === EmailStatus.FAILED ||
      message.status === EmailStatus.BOUNCED ||
      message.status === EmailStatus.COMPLAINED ||
      Boolean(message.lastError)
    ) {
      return {
        status: "error",
        message:
          "Форма принята, но письмо в поддержку пока не ушло. Попробуй ещё раз чуть позже.",
      };
    }

    revalidatePath("/admin/emails");

    return {
      status: "success",
      message:
        "Сообщение отправлено в техподдержку. Команда получит твою заявку на почту и сможет ответить.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Не удалось отправить сообщение в поддержку. Попробуй ещё раз чуть позже.",
    };
  }
}
