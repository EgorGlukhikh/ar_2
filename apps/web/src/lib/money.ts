export function formatMinorUnits(
  amount: number,
  currency = "RUB",
  locale = "ru-RU",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function parseAmountToMinorUnits(input: string) {
  const normalized = input.replace(",", ".").trim();

  if (!normalized) {
    throw new Error("Укажи сумму.");
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Сумма должна быть больше нуля.");
  }

  return Math.round(amount * 100);
}
