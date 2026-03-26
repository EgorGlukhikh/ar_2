import type { PublicAuthScreenPayload } from "@shared/public-auth/types";

const errorLabelMap: Record<string, string> = {
  "yandex-email":
    "Яндекс не передал подтвержденный email. Войди по почте и паролю или выбери другой аккаунт Яндекса.",
  OAuthAccountNotLinked:
    "Этот способ входа пока не привязан к аккаунту. Используй почту и пароль.",
  AccessDenied:
    "Доступ не был подтвержден. Попробуй снова.",
  Configuration:
    "Вход через внешний провайдер сейчас недоступен.",
};

/**
 * Purpose: prepare auth screen props from query params and env without mixing that logic into the page.
 */
export function getPublicAuthScreenPayload(input: {
  email?: string;
  invited?: string;
  error?: string;
}): PublicAuthScreenPayload {
  return {
    defaultEmail: input.email ?? "",
    showInviteSuccess: input.invited === "1",
    isYandexEnabled: Boolean(
      process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET,
    ),
    errorMessage: input.error ? errorLabelMap[input.error] : undefined,
  };
}
