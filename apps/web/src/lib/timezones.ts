export const TIMEZONE_OPTIONS = [
  { value: "Europe/Moscow",      label: "UTC+3 — Москва, Санкт-Петербург" },
  { value: "Europe/Samara",      label: "UTC+4 — Самара, Ижевск" },
  { value: "Asia/Yekaterinburg", label: "UTC+5 — Екатеринбург, Уфа" },
  { value: "Asia/Omsk",          label: "UTC+6 — Омск" },
  { value: "Asia/Novosibirsk",   label: "UTC+7 — Новосибирск" },
  { value: "Asia/Irkutsk",       label: "UTC+8 — Иркутск" },
  { value: "Asia/Yakutsk",       label: "UTC+9 — Якутск" },
  { value: "Asia/Vladivostok",   label: "UTC+10 — Владивосток" },
] as const;

export function getTimezoneLabel(value: string): string {
  return TIMEZONE_OPTIONS.find((t) => t.value === value)?.label ?? value;
}
