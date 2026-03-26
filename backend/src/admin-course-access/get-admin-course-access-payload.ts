import type { AdminCourseAccessPayload } from "@shared/admin-course-access/types";

import { getAdminCourseAccessSnapshot } from "@database/admin-course-access/admin-course-access.repository";

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export async function getAdminCourseAccessPayload(
  courseId: string,
): Promise<AdminCourseAccessPayload | null> {
  const snapshot = await getAdminCourseAccessSnapshot(courseId);

  if (!snapshot) {
    return null;
  }

  const isPaidCourse =
    typeof snapshot.offer.priceAmount === "number" && snapshot.offer.priceAmount > 0;
  const priceLabel =
    isPaidCourse && snapshot.offer.currency
      ? formatAmount(snapshot.offer.priceAmount, snapshot.offer.currency)
      : null;

  return {
    courseId: snapshot.course.id,
    courseTitle: snapshot.course.title,
    description: snapshot.course.description,
    lessonCount: snapshot.lessonCount,
    enrollmentCount: snapshot.enrollmentCount,
    isPaidCourse,
    amountValue:
      typeof snapshot.offer.priceAmount === "number"
        ? String(snapshot.offer.priceAmount / 100)
        : "",
    currency: snapshot.offer.currency ?? "RUB",
    priceLabel,
    offerActive: snapshot.offer.isActive,
    availableStudents: snapshot.availableStudents,
    enrollments: snapshot.enrollments.map((enrollment) => ({
      ...enrollment,
      totalLessons: snapshot.lessonCount,
    })),
    stats: [
      {
        label: "Студентов на курсе",
        value: String(snapshot.enrollmentCount),
        hint: "Все активные доступы к этой программе.",
      },
      {
        label: "Уроков в программе",
        value: String(snapshot.lessonCount),
        hint: "Количество уроков в текущей структуре курса.",
      },
      {
        label: "Формат доступа",
        value: isPaidCourse ? "Платный" : "Бесплатный",
        hint: isPaidCourse
          ? "Админ может выдать доступ бесплатно или провести демо-списание."
          : "Доступ к курсу можно выдавать напрямую без списания.",
      },
      {
        label: "Текущая цена",
        value: priceLabel ?? "Без цены",
        hint: snapshot.offer.isActive
          ? "Карточка курса готова к выдаче доступа и показу цены."
          : "Курс не активирован для каталога, но админ все равно может выдавать доступ вручную.",
      },
    ],
  };
}
