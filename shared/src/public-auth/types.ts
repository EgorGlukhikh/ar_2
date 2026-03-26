export type AuthTab = "sign-in" | "register";

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type RegisterFieldErrors = Partial<
  Record<keyof RegisterRequest, string>
>;

export type RegisterResponse =
  | {
      ok: true;
      user: {
        id: string;
        email: string;
        name: string | null;
        role: string;
      };
    }
  | {
      ok: false;
      formError?: string;
      fieldErrors?: RegisterFieldErrors;
    };

export type PublicAuthScreenPayload = {
  defaultEmail: string;
  showInviteSuccess: boolean;
  isYandexEnabled: boolean;
  errorMessage?: string;
};
