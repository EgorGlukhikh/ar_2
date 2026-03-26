# Академия риэлторов

Платформа обучения для проекта «Академия риэлторов». Внутри уже есть публичная витрина, каталог курсов, экран входа, checkout, учебный кабинет, авторский контур и административная часть для управления курсами, студентами и продажами.

## Что есть в продукте

- лендинг с двумя сценариями: `Я учусь / Я автор`
- публичный каталог курсов
- вход по email и паролю
- роли `ADMIN`, `AUTHOR`, `CURATOR`, `STUDENT`
- создание и редактирование курсов, модулей и уроков
- block-based уроки: текст, видео, файлы, задания
- учебный кабинет с прогрессом и drip-логикой
- оформление доступа к курсам
- бесплатные и платные программы в одном каталоге
- базовая email-очередь и статусы доставки
- behavioral analytics по урокам и просмотрам

## Публичный UI

Публичный слой собран по spec из `codex_landing_spec` и использует общие design tokens:

- единая светлая база `#F5F7FB`
- основной бренд `#4F46E5`
- градиент `#20306F -> #2F49C8 -> #C58AA0 -> #E58C67`
- единая типографика на `Inter`
- одинаковые правила для кнопок:
  - светлая кнопка -> тёмный текст
  - тёмная или брендовая кнопка -> белый текст
- единые отступы, карточки, badge и focus-состояния

Под этот слой уже переведены:

- [landing](/C:/AR_codex/apps/web/src/app/page.tsx)
- [catalog](/C:/AR_codex/apps/web/src/app/catalog/page.tsx)
- [sign-in](/C:/AR_codex/apps/web/src/app/sign-in/page.tsx)
- [checkout](/C:/AR_codex/apps/web/src/app/checkout/[orderId]/page.tsx)

Базовые публичные примитивы лежат в:

- [public-primitives.tsx](/C:/AR_codex/apps/web/src/components/marketing/public-primitives.tsx)
- [public-copy.ts](/C:/AR_codex/apps/web/src/lib/public-copy.ts)
- [globals.css](/C:/AR_codex/apps/web/src/app/globals.css)

## Логика курсов

Сейчас в продукте поддерживаются два основных формата:

- `CLASSIC` — курс в записи: видео, тексты, файлы, задания
- `LIVE_COHORT` — онлайн-поток: занятия можно привязывать ко времени, а после эфира в уроке оставлять запись и материалы

Для новых и существующих уроков используется доменная модель `LessonBlock`. Legacy-уроки автоматически синхронизируются в новую таблицу при деплое.

В lesson studio блоки работают в двух режимах:

- просмотр
- отдельное редактирование

Это убирает одновременный показ превью блока и полей ввода в одном состоянии.

## Слаг курса

Слаг больше не вводится вручную. Он формируется автоматически из названия курса:

- название переводится в латиницу
- пробелы и символы превращаются в `kebab-case`
- при совпадении добавляется суффикс для уникальности

## Локальный запуск

1. Запустить Docker Desktop.
2. Выполнить `npm install`.
3. Выполнить `npm run db:start`.
4. Выполнить `npm run db:generate`.
5. Выполнить `npm run db:push`.
6. Выполнить `npm run db:seed`.
7. Выполнить `npm run db:sync-lesson-blocks`.
8. Выполнить `npm run dev`.

## Внутренние аккаунты

Сервисные аккаунты используются для локальной разработки, внутренней проверки и наполнения production-окружения. В публичном интерфейсе они не показываются.

- Администратор
  - email: `test@mail.ru`
  - пароль: `12345`
- Автор
  - email: `hp@mail.ru`
  - пароль: `123456789`

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

Текущие провайдеры по умолчанию:

- `PAYMENT_PROVIDER=demo`
- `VIDEO_PROVIDER=mock`
- `EMAIL_PROVIDER=mock`

Для bootstrap-пользователя в production:

- `BOOTSTRAP_USER_EMAIL`
- `BOOTSTRAP_USER_PASSWORD`
- `BOOTSTRAP_USER_NAME`
- `BOOTSTRAP_USER_ROLE`

## Railway

В Railway разворачиваются `web` и `Postgres`.

Во время `preDeployCommand` автоматически выполняются:

- `db:generate`
- `db:push`
- `db:seed`
- `db:sync-lesson-blocks`

Это значит, что стартовые курсы, bootstrap-пользователь и синхронизация legacy-уроков поднимаются без отдельного ручного шага.

## Документация

- roadmap: `docs/current-implementation-roadmap.md`
- 10x-план: `docs/10x-product-improvement-roadmap.md`
- функциональная спецификация: `docs/academy-platform-functional-spec.md`
- хронология работы: GitHub issue `#1`
