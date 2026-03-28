# Contributing

## Базовое правило

Новые фичи строим по одной и той же схеме, чтобы человек и AI добавляли изменения одинаково.

## Шаблон новой фичи

1. создать route или page в `apps/web/src/app`
2. вынести orchestration в `apps/web/src/features/<feature>`
3. вынести доступ к данным в repository или package-level data access
4. держать общие типы и view models в `packages/shared` или в feature contract
5. собирать UI из существующих компонентов и примитивов

## Куда класть код

- новый экран: `apps/web/src/app/...`
- feature service, loader, server action: `apps/web/src/features/...`
- reusable UI primitive: `apps/web/src/components/...`
- auth/domain/shared package logic: `packages/*`
- Prisma schema, seed, db scripts: `packages/db`

## Что нельзя делать даже если так быстрее

- не добавлять новый код в `frontend/`, `backend/`, `database/`, `shared`
- не импортировать `@academy/db` в UI components
- не тянуть Prisma напрямую в новые page/layout файлы
- не смешивать read flow и side effects на server page
- не встраивать deploy-only операции в `railway:start`

## Как добавлять страницу

Страница должна быть тонкой:

- получить session или route params
- вызвать feature-level loader/service
- передать готовый view model в UI

Если page начинает содержать permission logic, сложный `prisma.include`, derived state и мутации сразу, это сигнал, что часть логики нужно вынести.

## Как добавлять сервис

Feature service должен:

- принимать простые входные параметры
- возвращать готовые данные для экрана или команды
- скрывать детали storage
- быть пригодным для unit/integration тестов

## Checklist перед merge

- изменения не расширяют legacy-root
- route/page не ходит в Prisma напрямую, если это новый код
- `lint`, `typecheck`, `build` проходят
- если изменен critical flow, добавлен или обновлен smoke-check или тест
- в GitHub issue `#1` добавлен короткий комментарий по этапу работ
