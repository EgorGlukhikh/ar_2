import {
  CourseStatus,
  EnrollmentStatus,
  LessonType,
  MediaSourceType,
  OrderStatus,
  PaymentProviderType,
  PaymentStatus,
  EmailProviderType,
  EmailStatus,
} from "@academy/db";

type BadgeVariant = "default" | "neutral" | "success" | "warning";

export const courseStatusLabelMap: Record<CourseStatus, string> = {
  DRAFT: "Черновик",
  PUBLISHED: "Опубликован",
  ARCHIVED: "Архив",
};

export const courseStatusVariantMap: Record<CourseStatus, BadgeVariant> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  ARCHIVED: "warning",
};

export const lessonTypeLabelMap: Record<LessonType, string> = {
  TEXT: "Текст",
  VIDEO: "Видео",
  QUIZ: "Тест",
  HOMEWORK: "Домашнее задание",
  LIVE: "Эфир",
  FILE: "Файл",
};

export const enrollmentStatusLabelMap: Record<EnrollmentStatus, string> = {
  ACTIVE: "Активен",
  COMPLETED: "Завершен",
  EXPIRED: "Истек",
  CANCELED: "Отменен",
};

export const enrollmentStatusVariantMap: Record<
  EnrollmentStatus,
  BadgeVariant
> = {
  ACTIVE: "default",
  COMPLETED: "success",
  EXPIRED: "warning",
  CANCELED: "warning",
};

export const mediaSourceTypeLabelMap: Record<MediaSourceType, string> = {
  MANAGED_UPLOAD: "Загрузка",
  RUTUBE_EMBED: "RUTUBE",
  CLOUD_IMPORT: "Импорт по ссылке",
  EXTERNAL_EMBED: "Внешний embed",
};

export const orderStatusLabelMap: Record<OrderStatus, string> = {
  DRAFT: "Черновик",
  PENDING: "Ожидает оплаты",
  PAID: "Оплачен",
  CANCELED: "Отменен",
  REFUNDED: "Возврат",
};

export const orderStatusVariantMap: Record<OrderStatus, BadgeVariant> = {
  DRAFT: "neutral",
  PENDING: "warning",
  PAID: "success",
  CANCELED: "warning",
  REFUNDED: "warning",
};

export const paymentStatusLabelMap: Record<PaymentStatus, string> = {
  CREATED: "Создан",
  PENDING: "Ожидает оплаты",
  SUCCEEDED: "Успешен",
  FAILED: "Ошибка",
  CANCELED: "Отменен",
};

export const paymentStatusVariantMap: Record<PaymentStatus, BadgeVariant> = {
  CREATED: "neutral",
  PENDING: "warning",
  SUCCEEDED: "success",
  FAILED: "warning",
  CANCELED: "warning",
};

export const paymentProviderLabelMap: Record<PaymentProviderType, string> = {
  DEMO: "Демо",
  MANUAL: "Ручной счет",
  ROBOKASSA: "Robokassa",
  BANK131: "Bank 131",
  TBANK: "T-Bank",
};

export const emailProviderLabelMap: Record<EmailProviderType, string> = {
  MOCK: "Mock",
  RESEND: "Resend",
};

export const emailStatusLabelMap: Record<EmailStatus, string> = {
  QUEUED: "В очереди",
  SENDING: "Отправляется",
  SENT: "Отправлено",
  DELIVERED: "Доставлено",
  OPENED: "Открыто",
  CLICKED: "Клик",
  FAILED: "Ошибка",
  BOUNCED: "Возврат",
  COMPLAINED: "Жалоба",
  CANCELED: "Отменено",
};

export const emailStatusVariantMap: Record<EmailStatus, BadgeVariant> = {
  QUEUED: "neutral",
  SENDING: "warning",
  SENT: "default",
  DELIVERED: "success",
  OPENED: "success",
  CLICKED: "success",
  FAILED: "warning",
  BOUNCED: "warning",
  COMPLAINED: "warning",
  CANCELED: "warning",
};
