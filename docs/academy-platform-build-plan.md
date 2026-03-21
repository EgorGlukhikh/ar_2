# Академия риэлторов: план сборки и архитектура

## 1. Рекомендуемая архитектура

Рекомендуемый подход: `modular monolith`.

Почему не микросервисы:

- проект стартует с пустой базы;
- домен еще будет меняться;
- для команды поддержки это даст лишнюю операционную сложность;
- интеграций и фоновых процессов уже достаточно, чтобы не раздувать инфраструктуру раньше времени.

Почему не “один огромный Next.js без границ”:

- быстро превращается в хаотичный монолит;
- доменные зависимости начинают течь между оплатами, курсами, CRM и видео;
- такие проекты тяжело масштабировать живой команде.

Итог:

- один основной продуктовый backend-контур;
- четкие границы доменов;
- отдельные адаптеры под внешние сервисы;
- очереди и фоновые воркеры как отдельный runtime.

## 2. Стек

- `Next.js 15` — веб-приложение, кабинет, админка, SSR/ISR.
- `TypeScript` — единый типизированный слой.
- `Prisma` — ORM, схема, миграции, типы.
- `PostgreSQL` — основная БД.
- `shadcn/ui` — UI-компоненты.
- `Auth.js` или эквивалентный auth-layer — сессии, login flow.
- `Redis` — кэш, очереди, rate limiting, ephemeral state.
- `BullMQ` или эквивалент — фоновые задачи.
- `Cloudflare Stream` или аналог managed video platform — видеохранилище и delivery.
- `Uppy` + resumable uploads — загрузка больших видео.
- `S3-compatible storage` — документы, файлы домашних заданий, материалы курса.

## 3. Предлагаемая структура репозитория

```text
apps/
  web/
    app/
    features/
    components/
    server/
    styles/

packages/
  db/
    prisma/
    src/

  auth/
  shared/
  ui/
  course-domain/
  learning-domain/
  video-domain/
  billing-domain/
  crm-domain/
  messaging-domain/
  notifications-domain/
  analytics-domain/

workers/
  media-worker/
  payment-worker/
  notification-worker/

docs/
```

Принцип:

- UI и delivery в `apps/web`;
- доменная логика в `packages/*-domain`;
- внешние интеграции через adapter-слой внутри домена;
- фоновые процессы в `workers`.

## 4. Правила архитектуры

1. Prisma-схема общая, но доменные сервисы разнесены по модулям.
2. Ни один домен не должен напрямую знать детали чужого провайдера.
3. Все интеграции идут через интерфейсы:
   - `VideoProvider`;
   - `PaymentProvider`;
   - `NotificationProvider`;
   - `FileStorageProvider`.
4. Webhooks всегда пишутся в event log перед бизнес-обработкой.
5. Доступы к курсам выдаются не из UI, а из доменного application service.
6. UI не принимает решений по оплатам, доступам и статусам — только вызывает use cases.

## 5. Основные домены

### 5.1 Identity & Access

- users;
- roles;
- invitations;
- sessions;
- access policies.

### 5.2 Catalog & Content

- courses;
- programs;
- modules;
- lessons;
- lesson blocks;
- lesson assets.

### 5.3 Learning

- enrollments;
- progress;
- lesson completion;
- schedule/drip access;
- certificates.

### 5.4 Assessments

- quizzes;
- question bank;
- attempts;
- homework assignments;
- homework submissions;
- homework reviews.

### 5.5 Video

- media assets;
- source types;
- upload sessions;
- processing jobs;
- playback tokens;
- watermark policies.

### 5.6 Billing

- products;
- prices;
- orders;
- payments;
- invoices;
- coupons;
- payment providers;
- payment events.

### 5.7 CRM

- leads;
- deals;
- notes;
- tags;
- source attribution;
- manager ownership.

### 5.8 Messaging

- conversations;
- participants;
- messages;
- attachments;
- system messages.

### 5.9 Notifications

- templates;
- deliveries;
- channels;
- retries;
- delivery logs.

## 6. Черновая модель сущностей

Минимальный набор таблиц:

- `User`
- `Profile`
- `RoleAssignment`
- `Invitation`
- `Course`
- `CourseAuthor`
- `Module`
- `Lesson`
- `LessonBlock`
- `MediaAsset`
- `MediaSource`
- `Enrollment`
- `AccessGrant`
- `ProgressSnapshot`
- `Quiz`
- `QuizQuestion`
- `QuizAttempt`
- `HomeworkAssignment`
- `HomeworkSubmission`
- `HomeworkReview`
- `Product`
- `Price`
- `Order`
- `OrderItem`
- `Payment`
- `Invoice`
- `PaymentAttempt`
- `PaymentWebhookEvent`
- `Lead`
- `Conversation`
- `Message`
- `Notification`

## 7. Видео: реализация по слоям

### 7.1 Модель

`MediaAsset`

- внутренний ID;
- тип: `video`, `document`, `image`, `archive`;
- статус: `draft`, `uploading`, `processing`, `ready`, `failed`, `archived`;
- owner;
- duration;
- thumbnail;
- visibility policy.

`MediaSource`

- `managed_upload`;
- `rutube_embed`;
- `cloud_import`;
- `external_embed`.

### 7.2 Поток обработки

Сценарий 1: прямой аплоад автора

1. UI создает upload session.
2. Бэкенд получает одноразовый upload URL от video provider.
3. Клиент грузит файл напрямую.
4. Вебхук/воркер фиксирует завершение обработки.
5. Урок получает готовый `MediaAsset`.

Сценарий 2: импорт по ссылке

1. Автор вставляет ссылку на файл.
2. Система валидирует источник.
3. Провайдер забирает файл по URL.
4. После обработки меняется статус на `ready`.

Сценарий 3: RUTUBE

1. Автор вставляет URL или embed code.
2. Система нормализует `videoId` и access key.
3. Урок рендерит внешний player adapter.

## 8. Платежи: реализация по слоям

### 8.1 Базовый интерфейс

```ts
interface PaymentProvider {
  createPaymentLink(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPaymentStatus(input: GetPaymentStatusInput): Promise<PaymentStatusResult>;
  handleWebhook(input: PaymentWebhookInput): Promise<void>;
  cancelPayment?(input: CancelPaymentInput): Promise<void>;
}
```

### 8.2 Провайдеры

- `RobokassaPaymentProvider`
- `TBankInvoiceProvider`
- `Bank131PaymentProvider`
- `ManualInvoiceProvider`

### 8.3 Правило запуска

Сначала подключаем один онлайн-провайдер и manual flow.

Рекомендуемый порядок:

1. `Robokassa`
2. `ManualInvoiceProvider`
3. `T-Bank`
4. `Bank 131`

Так мы быстрее выходим в рабочий контур и не усложняем первый релиз лишними интеграциями.

## 9. Этапы сборки

## Phase 0. Discovery & Foundation

- финализировать scope MVP;
- описать роли и права;
- спроектировать Prisma schema v1;
- подготовить дизайн-систему и layout-kit;
- поднять dev/stage environments;
- зафиксировать adapter contracts.

Результат:

- согласованный scope;
- архитектурный baseline;
- dev-ready repository.

## Phase 1. Core LMS

- auth;
- роли;
- курсы/модули/уроки;
- student cabinet;
- author cabinet light;
- прогресс;
- текстовые уроки;
- базовые файловые вложения.

Результат:

- платформа уже умеет обучать без продаж и защищенного видео.

## Phase 2. Video Platform

- managed video provider;
- resumable upload;
- background processing;
- thumbnails/posters;
- RUTUBE adapter;
- cloud import flow;
- playback security;
- watermark support.

Результат:

- полноценные видеоуроки;
- миграция существующих курсов;
- авторская загрузка.

## Phase 3. Billing & Access

- products and prices;
- order flow;
- Robokassa integration;
- manual invoice flow;
- automatic access granting;
- payment event log;
- manager payment actions.

Результат:

- можно продавать курсы в production.

## Phase 4. Homework, Curators, CRM

- тесты;
- домашки;
- review workflow;
- comments;
- lead management;
- conversations;
- manager inbox.

Результат:

- платформа закрывает обучение + сопровождение + продажи.

## Phase 5. Growth Layer

- T-Bank and Bank 131 integrations;
- advanced analytics;
- automations;
- cohort management;
- certificates;
- funnel features;
- segmentation.

Результат:

- продукт приближается к уровню GetCourse по бизнес-функциям.

## 10. Что проверить до старта реализации

1. Нужен ли multi-brand/multi-school режим с первого релиза.
2. Нужны ли потоки/cohorts уже в MVP.
3. Нужно ли разделение B2C и B2B продаж.
4. Нужен ли встроенный чат сразу или достаточно thread-based messaging.
5. Нужны ли сертификаты в первом релизе.
6. Нужны ли вебинары внутри платформы или хватит embed/integration.

## 11. Практический следующий шаг

Следующий рабочий этап после этих документов:

1. утвердить MVP-границы;
2. зафиксировать ER-модель;
3. создать репозиторий приложения на `Next.js 15`;
4. развернуть Prisma schema v1;
5. собрать каркас модулей и adapter contracts;
6. только после этого начинать UI и интеграции.
