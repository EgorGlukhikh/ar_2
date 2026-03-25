# Академия риэлторов

Платформа обучения для проекта «Академия риэлторов».

## Стек

- Next.js 15
- React 19
- Prisma 7
- Auth.js c `email + password`
- PostgreSQL
- modular monolith на workspace-пакетах
- Railway как production target

## Что уже работает

- публичный лендинг, вход и каталог курсов
- email/password авторизация
- админский контур для курсов, модулей, уроков, студентов и доступов
- редактор курса с логикой `модули слева -> тело редактирования справа`
- урок, в котором одновременно могут жить текст, видео и прикрепленный материал
- demo checkout и demo-оплата с автоматической выдачей доступа
- video foundation для `private/public RUTUBE`, embed и managed upload
- email-центр с очередью, служебными письмами и маркетинговой цепочкой из 5 писем
- статусы `queued / sent / delivered / opened / clicked / failed`
- behavioral analytics по урокам и просмотрам видео
- preview-режимы ролей для админа: `админ / автор / студент`

## Локальный запуск

1. Запустить Docker Desktop.
2. Выполнить `npm install`.
3. Выполнить `npm run db:start`.
4. Выполнить `npm run db:generate`.
5. Выполнить `npm run db:push`.
6. Выполнить `npm run db:seed`.
7. Выполнить `npm run db:sync-lesson-blocks`.
8. Выполнить `npm run dev`.

## Тестовый админ

- Email: `test@mail.ru`
- Пароль: `12345`

## Production env

Обязательные:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `AUTH_URL`
- `NEXTAUTH_URL`
- `APP_BASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Текущие провайдеры:

- `PAYMENT_PROVIDER=demo`
- `VIDEO_PROVIDER=mock`
- `EMAIL_PROVIDER=mock`

Если включаем реальные письма через Resend:

- `EMAIL_PROVIDER=resend`
- `EMAIL_FROM_EMAIL`
- `EMAIL_FROM_NAME`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`

Для фоновой обработки очереди писем:

- `CRON_SECRET`

## Railway

В Railway уже развертывается `web` + `Postgres`.

При деплое `preDeployCommand` автоматически выполняет `db:generate`, `db:push`, `db:seed` и `db:sync-lesson-blocks`, поэтому существующие legacy-уроки синхронизируются в `LessonBlock` без ручного шага.

Для production email-цепочек нужен scheduled trigger:

1. Создать cron/job, который вызывает `POST /api/cron/email-queue`
2. Передавать заголовок `x-cron-secret: <CRON_SECRET>`
3. Периодичность: раз в 10-15 минут

Без cron-route письма из отложенной цепочки не будут уходить строго по расписанию.

## Что желательно подключить внешне

Реально нужно для production:

- `Resend` для доставляемости и webhook-статусов писем
- cron/job runner в Railway для email-очереди

Сильно желательно для следующего этапа:

- `Cloudflare Stream` или `Mux`, если нужна точная видео-аналитика не только для RUTUBE, но и для managed video
- `PostHog`, если захотим вынести продуктовую аналитику и сегментацию из внутренней БД в отдельный аналитический контур

## Ведение проекта

- roadmap: `docs/current-implementation-roadmap.md`
- 10x-план улучшений: `docs/10x-product-improvement-roadmap.md`
- хронология работ: GitHub issue `#1`
