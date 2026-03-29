import { USER_ROLES, composeFullName } from "@academy/shared";
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
    firstName: z.string().trim().min(2, "Укажи имя."),
    lastName: z.string().trim().max(120, "Фамилия слишком длинная."),
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
  const fullName = composeFullName(parsed.data.firstName, parsed.data.lastName);

  const user = existingUser
    ? await attachPasswordToExistingUser(existingUser.id, passwordHash, {
        name: existingUser.name ?? fullName,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
      })
    : await createCredentialsUser({
        email: parsed.data.email,
        name: fullName,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        passwordHash,
        role: USER_ROLES.STUDENT,
      });
  const normalizedUser = user as typeof user & {
    firstName?: string | null;
    lastName?: string | null;
  };

  return {
    ok: true,
    user: {
      id: normalizedUser.id,
      email: normalizedUser.email,
      firstName: normalizedUser.firstName ?? null,
      lastName: normalizedUser.lastName ?? null,
      name: normalizedUser.name ?? null,
      role: normalizedUser.role,
    },
  };
}
