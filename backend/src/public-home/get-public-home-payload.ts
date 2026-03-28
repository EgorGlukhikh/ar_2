import type { PublicHomePayload } from "@shared/public-home/types";

import {
  countPublishedCourses,
  listPublishedLandingCourses,
} from "@database/public-home/public-home.repository";

const fallbackCourses: PublicHomePayload["courses"] = [
  {
    id: "sample-ethics",
    slug: "ethics-safety-real-estate",
    title: "Этика и безопасность в недвижимости",
    description:
      "Как общаться без дискриминации, защищать данные клиента и спокойно проводить показы.",
    lessonCount: 5,
    priceLabel: "Бесплатно",
    authorName: "Академия риэлторов",
    modules: [],
  },
  {
    id: "sample-buyer",
    slug: "buyer-deal-finance-closing",
    title: "Сделка с покупателем: финансирование и closing",
    description:
      "Маршрут покупателя от брифа и объекта до оффера, проверки и закрытия сделки.",
    lessonCount: 5,
    priceLabel: "3 490 ₽",
    authorName: "Академия риэлторов",
    modules: [],
  },
  {
    id: "sample-seller",
    slug: "seller-listing-system",
    title: "Листинг продавца: показы и multiple offers",
    description:
      "Подготовка объекта, показы, защита собственника и разбор нескольких офферов.",
    lessonCount: 5,
    priceLabel: "2 490 ₽",
    authorName: "Академия риэлторов",
    modules: [],
  },
];

/**
 * Builds a UI-safe payload for the public home page.
 * Purpose: keep page.tsx thin and move aggregation / formatting to backend layer.
 */
export async function getPublicHomePayload(): Promise<PublicHomePayload> {
  let publishedCourses = 0;
  let rawCourses: Awaited<ReturnType<typeof listPublishedLandingCourses>> = [];

  try {
    [publishedCourses, rawCourses] = await Promise.all([
      countPublishedCourses(),
      listPublishedLandingCourses(),
    ]);
  } catch (error) {
    /**
     * Keep the public landing resilient in local and preview environments even
     * when Postgres is offline. The product shell should still render so we can
     * review layout and marketing copy without a running database.
     */
    console.warn("[public-home] Falling back to empty landing payload.", error);
  }

  const courses = rawCourses.map((course) => {
    const lessonCount = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );
    const defaultPrice = course.products[0]?.prices[0];
    const priceLabel =
      defaultPrice && defaultPrice.amount === 0
        ? "Бесплатно"
        : defaultPrice
          ? `${(defaultPrice.amount / 100).toFixed(0)} ₽`
          : "Цена скоро";

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description ?? "",
      lessonCount,
      priceLabel,
      authorName: course.author?.name === "Юра" ? "Юрий Паршиков" : (course.author?.name ?? "Академия риэлторов"),
      modules: course.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        lessons: mod.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
        })),
      })),
    };
  });

  return {
    publishedCourses: publishedCourses || fallbackCourses.length,
    courses: courses.length > 0 ? courses : fallbackCourses,
  };
}
