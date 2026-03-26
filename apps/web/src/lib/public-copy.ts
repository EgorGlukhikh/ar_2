const SHORT_WORDS = [
  "а",
  "без",
  "в",
  "во",
  "для",
  "до",
  "и",
  "из",
  "к",
  "ко",
  "на",
  "не",
  "но",
  "о",
  "об",
  "от",
  "по",
  "с",
  "со",
  "у",
] as const;

const SHORT_WORDS_PATTERN = new RegExp(
  `(^|\\s)(${SHORT_WORDS.join("|")})\\s+`,
  "giu",
);

export function formatPublicCopy(value: string) {
  return value.replace(SHORT_WORDS_PATTERN, (_, start: string, word: string) => {
    return `${start}${word}\u00A0`;
  });
}
