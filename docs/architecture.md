# Architecture

## Цель

Проект должен быть обслуживаем человеком без скрытой истории в голове и без обязательной помощи AI. Для этого мы фиксируем одну официальную карту кода и один допустимый data-flow.

## Официальная карта репозитория

- `apps/web` — единственный runtime entrypoint
- `packages/*` — переиспользуемые модули, доменные сервисы, shared contracts, database access

Переходный слой:

- `frontend/`
- `backend/`
- `database/`
- `shared/`

Эти папки считаются `legacy-transition layer`. Они могут временно использоваться существующим кодом, но новый код туда добавлять нельзя.

## Целевой data-flow

Для новых экранов, API routes и server actions:

1. route или page собирает экран
2. route/page вызывает feature service
3. feature service вызывает repository или data-access слой
4. repository работает с Prisma

Коротко:

`page/route -> feature service -> repository -> db`

## Границы ответственности

- `apps/web/src/app` — маршруты и композиция экранов
- `apps/web/src/features` — feature-level orchestration, loaders, server actions, view models
- `apps/web/src/components` — UI и layout без доступа к data-access
- `packages/auth` — auth logic и access helpers
- `packages/db` — Prisma client, schema, migrations, seed
- `packages/shared` — общие типы, enums, DTO, безопасные контракты

## Что запрещено для нового кода

- импортировать Prisma напрямую в `page.tsx`, `layout.tsx` и UI components
- пробивать границы пакетов relative-importами во внутренности других слоев
- добавлять новую бизнес-логику в корневые `frontend/backend/database/shared`
- запускать schema/data mutations из runtime startup
- делать read-only admin pages с побочными эффектами при открытии

## Миграционное правило

Любой перенос делается только так:

1. добавить новый совместимый path
2. переключить 1-2 потребителя
3. прогнать `lint`, `typecheck`, `build`, smoke
4. только потом удалять legacy-use

Big-bang rewrite запрещен.

## Definition of Done для этапа миграции

- приложение открывается локально
- Railway deploy продолжает подниматься
- `npm run lint` проходит
- `npm run typecheck` проходит
- `npm run build` проходит
- критические маршруты `/`, `/catalog`, `/sign-in`, `/learning`, `/admin` открываются или корректно редиректят
