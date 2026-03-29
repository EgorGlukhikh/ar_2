export type EmailTemplateCategory = "transactional" | "automation" | "campaign";
export type EmailTemplateAudience = "student" | "expert" | "mixed";

export const emailTemplateKeys = [
  "student-account-created",
  "student-account-updated",
  "course-access-granted",
  "payment-success",
  "student-welcome-1",
  "student-welcome-2",
  "student-welcome-3",
  "student-welcome-4",
  "student-welcome-5",
  "student-reengage-no-start",
  "student-reengage-stalled",
  "expert-welcome-1",
  "expert-welcome-2",
  "expert-welcome-3",
  "campaign-course-launch",
  "campaign-live-intake",
  "campaign-catalog-return",
  "campaign-expert-invite",
] as const;

export type EmailTemplateKey = (typeof emailTemplateKeys)[number];

export type EmailTemplateDefinition = {
  key: EmailTemplateKey;
  label: string;
  description: string;
  category: EmailTemplateCategory;
  audience: EmailTemplateAudience;
  requiresCourse?: boolean;
};

export const emailTemplateCatalog: EmailTemplateDefinition[] = [
  {
    key: "student-account-created",
    label: "Аккаунт студента создан",
    description: "Сервисное письмо с данными для входа в платформу.",
    category: "transactional",
    audience: "student",
  },
  {
    key: "student-account-updated",
    label: "Данные доступа обновлены",
    description: "Сервисное письмо для уже существующего студента.",
    category: "transactional",
    audience: "student",
  },
  {
    key: "course-access-granted",
    label: "Доступ к курсу открыт",
    description: "Сервисное письмо после ручной или автоматической выдачи доступа.",
    category: "transactional",
    audience: "student",
    requiresCourse: true,
  },
  {
    key: "payment-success",
    label: "Оплата подтверждена",
    description: "Сервисное письмо после успешной оплаты курса.",
    category: "transactional",
    audience: "student",
    requiresCourse: true,
  },
  {
    key: "student-welcome-1",
    label: "Письмо 1 — знакомство с платформой",
    description: "Стартовое письмо про каталог и первый шаг студента.",
    category: "automation",
    audience: "student",
  },
  {
    key: "student-welcome-2",
    label: "Письмо 2 — личный кабинет",
    description: "Письмо про формат обучения и маршрут прохождения.",
    category: "automation",
    audience: "student",
  },
  {
    key: "student-welcome-3",
    label: "Письмо 3 — выбор первого курса",
    description: "Догрев до первого осознанного выбора программы.",
    category: "automation",
    audience: "student",
  },
  {
    key: "student-welcome-4",
    label: "Письмо 4 — возврат к платформе",
    description: "Письмо для мягкого возврата студента в каталог и обучение.",
    category: "automation",
    audience: "student",
  },
  {
    key: "student-welcome-5",
    label: "Письмо 5 — доведение до действия",
    description: "Финальное письмо welcome-цепочки.",
    category: "automation",
    audience: "student",
  },
  {
    key: "student-reengage-no-start",
    label: "Триггер — курс не начали",
    description: "Если доступ выдан, но студент не начал курс.",
    category: "automation",
    audience: "student",
    requiresCourse: true,
  },
  {
    key: "student-reengage-stalled",
    label: "Триггер — прогресс остановился",
    description: "Если студент начал курс, но не продолжает обучение.",
    category: "automation",
    audience: "student",
    requiresCourse: true,
  },
  {
    key: "expert-welcome-1",
    label: "Письмо эксперту 1 — размещение экспертизы",
    description: "Первое письмо для автора или спикера платформы.",
    category: "automation",
    audience: "expert",
  },
  {
    key: "expert-welcome-2",
    label: "Письмо эксперту 2 — курс как продукт",
    description: "Письмо про упаковку курса и структуру продукта.",
    category: "automation",
    audience: "expert",
  },
  {
    key: "expert-welcome-3",
    label: "Письмо эксперту 3 — пилот и запуск",
    description: "Письмо-приглашение к следующему шагу по запуску курса.",
    category: "automation",
    audience: "expert",
  },
  {
    key: "campaign-course-launch",
    label: "Ручная кампания — новый курс",
    description: "Анонс нового курса из каталога.",
    category: "campaign",
    audience: "student",
    requiresCourse: true,
  },
  {
    key: "campaign-live-intake",
    label: "Ручная кампания — поток или набор",
    description: "Анонс живого потока, набора или запуска программы.",
    category: "campaign",
    audience: "student",
    requiresCourse: true,
  },
  {
    key: "campaign-catalog-return",
    label: "Ручная кампания — вернуть в каталог",
    description: "Реактивационная рассылка для старой аудитории.",
    category: "campaign",
    audience: "student",
  },
  {
    key: "campaign-expert-invite",
    label: "Ручная кампания — приглашение эксперта",
    description: "Письмо для поиска экспертов и авторов.",
    category: "campaign",
    audience: "expert",
  },
];

export const emailTemplateCatalogMap = Object.fromEntries(
  emailTemplateCatalog.map((item) => [item.key, item]),
) as Record<EmailTemplateKey, EmailTemplateDefinition>;

export const manualCampaignTemplates = emailTemplateCatalog.filter(
  (item) => item.category === "campaign",
);
