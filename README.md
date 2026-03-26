# Академия риэлторов

Платформа обучения по недвижимости с публичной витриной, каталогом курсов, авторским кабинетом, учебным контуром и административной частью.

## Архитектурный принцип

Проект переводится на явную схему `frontend -> backend -> database`, а общие DTO и контент лежат в `shared`.

Слои:
- `frontend/` — UI, layout, интеракции
- `backend/` — orchestration, business-ready services, подготовка payload для экранов и API
- `database/` — repository-слой и доступ к Prisma
- `shared/` — типы, DTO, copy-константы и безопасные для переиспользования сущности

Текущее правило для новых экранов:
- страница не собирает данные вручную из Prisma
- страница вызывает backend-service
- backend-service обращается к database-repository
- database-layer работает только со storage

## Что уже переведено на новый слой

Первый production-срез:
- landing page `/`
- витрина курсов на лендинге
- hero/product-preview
- секция курсов с пагинацией по карточкам
- каталог курсов `/catalog`
- экран входа `/sign-in`
- checkout `/checkout/[orderId]`
- публичные endpoints `GET /api/public/home`, `GET /api/courses`, `GET /api/user`
- checkout endpoint `GET /api/orders/[orderId]`

Файлы нового среза:
- `frontend/src/landing/components/landing-experience.tsx`
- `frontend/src/landing/components/landing-course-carousel.tsx`
- `frontend/src/catalog/components/catalog-page-content.tsx`
- `frontend/src/auth/components/sign-in-page-content.tsx`
- `frontend/src/checkout/components/checkout-page-content.tsx`
- `backend/src/public-home/get-public-home-payload.ts`
- `backend/src/public-catalog/get-public-catalog-payload.ts`
- `backend/src/public-checkout/get-public-checkout-payload.ts`
- `database/src/public-home/public-home.repository.ts`
- `database/src/public-catalog/public-catalog.repository.ts`
- `database/src/public-checkout/public-checkout.repository.ts`
- `shared/src/public-home/types.ts`
- `shared/src/public-home/copy.ts`
- `shared/src/public-catalog/types.ts`
- `shared/src/public-auth/copy.ts`
- `shared/src/public-checkout/types.ts`

## UI-система

Главные правила:
- readability > grid
- если карточка становится уже `280px`, уменьшаем число колонок
- на светлом фоне текст темный
- на темном или gradient фоне текст белый
- hero всегда показывает продукт, а не декоративную картинку

Базовые UI-примитивы:
- `apps/web/src/components/marketing/public-primitives.tsx`
- `apps/web/src/components/system/system-ui.tsx`
- `apps/web/src/app/globals.css`

## Course Studio

Текущая логика редактора:
- курс состоит из модулей, уроков и block-based контента
- основные настройки урока вынесены отдельно от блока контента
- блоки редактируются в режиме просмотра или отдельного редактирования
- при вставке ссылки RUTUBE название ролика подставляется автоматически

## Логика курсов

Поддерживаются форматы:
- `CLASSIC` — курс в записи
- `LIVE_COHORT` — онлайн-поток по расписанию

Внутренний block-domain:
- `LessonBlock` используется как основная модель урока
- legacy-уроки синхронизируются в новую таблицу при deploy

## Локальный запуск

1. `npm install`
2. `npm run db:start`
3. `npm run db:generate`
4. `npm run db:push`
5. `npm run db:seed`
6. `npm run db:sync-lesson-blocks`
7. `npm run dev`

## Production env

Обязательные переменные:
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `AUTH_URL`
- `NEXTAUTH_URL`
- `APP_BASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Провайдеры по умолчанию:
- `PAYMENT_PROVIDER=demo`
- `VIDEO_PROVIDER=mock`
- `EMAIL_PROVIDER=mock`

Bootstrap-пользователь:
- `BOOTSTRAP_USER_EMAIL`
- `BOOTSTRAP_USER_PASSWORD`
- `BOOTSTRAP_USER_NAME`
- `BOOTSTRAP_USER_ROLE`

## Railway

Во время `preDeployCommand` автоматически выполняются:
- `db:generate`
- `db:push`
- `db:seed`
- `db:sync-lesson-blocks`

## Внутренние аккаунты

Сервисные аккаунты нужны только для разработки и внутренней проверки. В публичном UI они не показываются.

- Админ: `test@mail.ru` / `12345`
- Автор: `hp@mail.ru` / `123456789`

## Документация

- `docs/current-implementation-roadmap.md`
- `docs/10x-product-improvement-roadmap.md`
- `docs/academy-platform-functional-spec.md`
- GitHub issue `#1` — хронология работ
