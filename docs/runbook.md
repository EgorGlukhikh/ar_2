# Runbook

## Локальная разработка

1. `npm install`
2. `npm run db:start`
3. `npm run db:generate`
4. `npm run db:push`
5. `npm run db:seed`
6. `npm run db:sync-lesson-blocks`
7. `npm run dev`

Быстрые проверки:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

Smoke для уже запущенного приложения:

- `SMOKE_BASE_URL=http://127.0.0.1:3000 npm run smoke`

## Railway

Разделяем deploy на отдельные операции:

- `railway:build` — сборка приложения
- `railway:release` — schema preparation
- `railway:start` — запуск web runtime
- `railway:bootstrap` — разовая seed/bootstrap операция

### Нормальный порядок для существующего окружения

1. build
2. release
3. start
4. smoke-check `/api/health`, `/`, `/sign-in`, один admin route, один learning route

### Для нового окружения

Если это пустая база, после первого успешного release отдельно запускаем:

- `npm run railway:bootstrap`

Bootstrap не должен быть частью каждого deploy.

## Что проверять после деплоя

- `GET /api/health`
- landing page
- `GET /sign-in`
- один admin route
- один learning route

Если старт приложения требует schema mutation или seed вручную на каждом релизе, это считается регрессией deploy-процесса.

## Incident notes

- не исправлять проблемы в production через ad-hoc изменения startup scripts
- schema fixes делать через явный release path
- demo/seed данные запускать только осознанно и отдельно от runtime
