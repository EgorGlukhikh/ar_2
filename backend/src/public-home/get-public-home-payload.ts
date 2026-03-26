import type { PublicHomePayload } from "@shared/public-home/types";

import {
  countPublishedCourses,
  listPublishedLandingCourses,
} from "@database/public-home/public-home.repository";

/**
 * Builds a UI-safe payload for the public home page.
 * Purpose: keep page.tsx thin and move aggregation / formatting to backend layer.
 */
export async function getPublicHomePayload(): Promise<PublicHomePayload> {
  const [publishedCourses, rawCourses] = await Promise.all([
    countPublishedCourses(),
    listPublishedLandingCourses(),
  ]);

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
    };
  });

  return {
    publishedCourses,
    courses,
  };
}
