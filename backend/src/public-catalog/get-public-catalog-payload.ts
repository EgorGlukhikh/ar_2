import { CourseDeliveryFormat } from "@academy/db";
import type { PublicCatalogPayload } from "@shared/public-catalog/types";

import { listPublishedCatalogCourses } from "@database/public-catalog/public-catalog.repository";
import { showcaseCopyBySlug } from "@shared/public-home/copy";

/**
 * Builds a UI-safe payload for the public catalog page.
 * Purpose: remove Prisma and aggregation logic from page components.
 */
export async function getPublicCatalogPayload(
  userId?: string,
): Promise<PublicCatalogPayload> {
  const rawCourses = await listPublishedCatalogCourses(userId);

  const courses = rawCourses.map((course) => {
    const lessonCount = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );
    const defaultPrice = course.products[0]?.prices[0];
    const isFree = Boolean(defaultPrice && defaultPrice.amount === 0);
    const hasAccess = Array.isArray(course.enrollments)
      ? course.enrollments.length > 0
      : false;
    const copy = showcaseCopyBySlug[course.slug];

    return {
      id: course.id,
      slug: course.slug,
      title: copy?.title ?? course.title,
      description:
        copy?.description ??
        course.description ??
        "Короткая программа с понятным результатом для работы риэлтора.",
      result:
        course.slug === "ethics-safety-real-estate"
          ? "Снижаешь риски в работе с клиентом и увереннее ведешь показы."
          : course.slug === "buyer-deal-finance-closing"
            ? "Лучше контролируешь путь покупателя от первого разговора до сделки."
            : course.slug === "seller-listing-system"
              ? "Строишь понятный маршрут сделки продавца без хаоса и потерь по ходу."
              : "Быстрее входишь в профессию и собираешь рабочую систему на старте.",
      lessonCount,
      priceLabel: defaultPrice
        ? isFree
          ? "Бесплатно"
          : new Intl.NumberFormat("ru-RU", {
              style: "currency",
              currency: defaultPrice.currency,
              maximumFractionDigits: 2,
            }).format(defaultPrice.amount / 100)
        : "Цена скоро",
      deliveryFormatLabel:
        course.deliveryFormat === CourseDeliveryFormat.LIVE_COHORT
          ? "Онлайн-поток"
          : "Курс в записи",
      canCheckout: Boolean(defaultPrice),
      isFree,
      hasAccess,
      modules: course.modules.map((module) => ({
        id: module.id,
        title: module.title,
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
        })),
      })),
    };
  });

  return {
    featuredCourse: courses[0] ?? null,
    courses,
  };
}
