"use server";

import { signIn } from "@academy/auth";
import { AuthError } from "next-auth";

export type SignInState = {
  error?: string;
};

export async function authenticate(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/after-sign-in",
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Неверный email или пароль.",
      };
    }

    throw error;
  }
}
