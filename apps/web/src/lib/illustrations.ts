export const illustrationMap = {
  onlineLearning: "/illustrations/online-learning.svg",
  continuousLearning: "/illustrations/continuous-learning.svg",
  idea: "/illustrations/idea.svg",
  thoughtProcess: "/illustrations/thought-process.svg",
  bookReading: "/illustrations/book-reading.svg",
  designProcess: "/illustrations/design-process.svg",
} as const;

export type IllustrationKey = keyof typeof illustrationMap;

export function getIllustrationSrc(key: IllustrationKey) {
  return illustrationMap[key];
}
