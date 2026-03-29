import { USER_ROLES } from "@academy/shared";
import { z } from "zod";

import { hashPassword } from "../../../packages/auth/src/password";
import {
  attachPasswordToExistingUser,
  createCredentialsUser,
  findUserByEmail,
} from "@database/auth/auth.repository";
import type {
  RegisterFieldErrors,
  RegisterRequest,
  RegisterResponse,
} from "@shared/public-auth/types";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Укажи имя."),
    email: z.email("Укажи корректный email.").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "Пароль должен быть не короче 8 символов."),
    passwordConfirmation: z.string().min(1, "Повтори пароль."),
    marketingEnabled: z.boolean().optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Пароли не совпадают.",
    path: ["passwordConfirmation"],
  });

function toFieldErrors(error: z.ZodError<RegisterRequest>): RegisterFieldErrors {
  const fieldErrors: RegisterFieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      !fieldErrors[field as keyof RegisterRequest]
    ) {
      fieldErrors[field as keyof RegisterRequest] = issue.message;
    }
  }

  return fieldErrors;
}

/**
 * Purpose: register a credentials-based user without leaking DB logic into routes.
 */
export async function registerCredentialsUser(
  input: RegisterRequest,
): Promise<RegisterResponse> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const existingUser = await findUserByEmail(parsed.data.email);

  if (existingUser?.passwordHash) {
    return {
      ok: false,
      fieldErrors: {
        email: "Пользователь с таким email уже есть.",
      },
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = existingUser
    ? await attachPasswordToExistingUser(
        existingUser.id,
        passwordHash,
        existingUser.name ?? parsed.data.name,
      )
    : await createCredentialsUser({
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
        role: USER_ROLES.STUDENT,
      });

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
    },
  };
}
