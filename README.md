# Академия риэлторов

Платформа обучения для проекта "Академия риэлторов".

## Стек

- Next.js 15
- React 19
- Prisma 7
- Auth.js credentials auth
- PostgreSQL через Docker Compose
- modular monolith на workspace-пакетах

## Что уже собрано

- авторизация по `email + password`
- админская зона для курсов, модулей, уроков, студентов, доступов и прогресса
- учебная зона ученика с курсами и прохождением уроков
- video foundation с provider abstraction, embed-поддержкой и сущностью `VideoAsset`
- demo billing flow с каталогом, checkout и автоматической выдачей доступа после успешной оплаты

## Деплой

- основной production target проекта: `Railway`
- runtime приложения и managed PostgreSQL собираются в Railway-first конфигурации
- локальная разработка остается на `Docker Compose`

## Локальный запуск

1. Запустить Docker Desktop.
2. Выполнить `npm install`.
3. Выполнить `npm run db:start`.
4. Выполнить `npm run db:generate`.
5. Выполнить `npm run db:push`.
6. Выполнить `npm run db:seed`.
7. Выполнить `npm run dev`.

## Тестовый админ

- Email: `test@mail.ru`
- Password: `12345`

Эти данные предназначены только для локальной разработки и берутся из корневого `.env`.

## Ведение проекта

- product roadmap: `docs/current-implementation-roadmap.md`
- единая хронология работ ведется в одном GitHub issue
