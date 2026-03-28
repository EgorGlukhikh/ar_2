# Академия риэлторов

Учебная платформа на `Next.js 15`, `React 19`, `TypeScript`, `Prisma 7`, `PostgreSQL`, `Tailwind 4` и `Auth.js v5 beta`.

Проект находится в переходной фазе: runtime уже живет в `apps/*` и `packages/*`, а часть legacy-логики все еще остается в корневых `frontend/`, `backend/`, `database/`, `shared/`. Новые изменения нужно строить по целевой схеме, не расширяя legacy-root.

## Репозиторий

- `apps/web` — Next.js runtime, маршруты, feature composition
- `packages/auth` — auth-конфиг и auth helpers
- `packages/db` — Prisma schema, client, seed и database scripts
- `packages/shared` — общие типы и контракты
- `packages/billing-domain`, `packages/video-domain` — доменные библиотеки
- `frontend`, `backend`, `database`, `shared` — legacy transition layer, новые фичи туда не добавляем

## Локальный запуск

1. `npm install`
2. `npm run db:start`
3. `npm run db:generate`
4. `npm run db:push`
5. `npm run db:seed`
6. `npm run db:sync-lesson-blocks`
7. `npm run dev`

Тестовый админ по умолчанию:

- email: `test@mail.ru`
- password: `123456`

Дополнительный workspace-пользователь создается только через `BOOTSTRAP_USER_*`.

## Проверки

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run smoke` — проверка ключевых маршрутов по уже запущенному приложению, использует `SMOKE_BASE_URL`

## Railway

Текущий production flow разделен на отдельные шаги:

- `npm run railway:build` — build артефакта
- `npm run railway:release` — подготовка schema на окружении Railway
- `npm run railway:start` — только запуск web runtime
- `npm run railway:bootstrap` — разовая инициализация demo/seed данных при необходимости

`railway:start` больше не меняет схему базы на старте. Это сделано специально, чтобы deploy был предсказуемее и не зависел от скрытых runtime-мутаций.

## Основные env

Обязательный минимум:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `AUTH_URL`
- `NEXTAUTH_URL`
- `APP_BASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Часто используемые опциональные настройки:

- `EMAIL_PROVIDER`, `EMAIL_FROM_EMAIL`, `EMAIL_FROM_NAME`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET`
- `CRON_SECRET`
- `VIDEO_PROVIDER`
- `PAYMENT_PROVIDER`
- `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`

Смотри полный пример в `.env.example`.

## Документация

- `docs/architecture.md` — целевая карта репозитория и архитектурные границы
- `docs/contributing.md` — как добавлять новые фичи человеку и через AI
- `docs/runbook.md` — локальный запуск, Railway release/bootstrap и smoke-check
- `docs/current-implementation-roadmap.md` — продуктовый и технический контекст
- GitHub issue `#1` — хронология ключевых этапов разработки
