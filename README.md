# Академия риэлторов

Платформа обучения для проекта «Академия риэлторов». Внутри уже есть публичная витрина, каталог курсов, учебный кабинет, авторский контур и административная часть для управления курсами, студентами и продажами.

## Что умеет продукт сейчас

- публичный лендинг, каталог и экран входа
- авторизация по email и паролю
- роли `ADMIN`, `AUTHOR`, `CURATOR`, `STUDENT`
- создание и редактирование курсов, модулей и уроков
- block-based уроки: текст, видео, файлы, задания
- учебный кабинет с прогрессом и drip-логикой
- оформление доступа к курсам
- каталог с бесплатными и платными программами
- базовая email-очередь и статусы доставки
- behavioral analytics по урокам и просмотрам

## Логика курсов

Сейчас в продукте поддерживаются два основных формата:

- `CLASSIC` — курс в записи: видео, тексты, файлы, задания
- `LIVE_COHORT` — онлайн-поток: занятия можно привязывать ко времени, а после эфира в уроке оставлять запись и материалы

Для новых и существующих уроков используется доменная модель `LessonBlock`. Legacy-уроки автоматически синхронизируются в новую таблицу при деплое.

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

Если включаем реальные письма через Resend:

- `EMAIL_PROVIDER=resend`
- `EMAIL_FROM_EMAIL`
- `EMAIL_FROM_NAME`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`

Для фоновой обработки email-очереди:

- `CRON_SECRET`

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

Для production email-цепочек нужен cron/job:

1. Вызывать `POST /api/cron/email-queue`
2. Передавать заголовок `x-cron-secret: <CRON_SECRET>`
3. Запускать раз в 10-15 минут

## Что желательно подключить дальше

Для production уже полезно:

- `Resend` для доставляемости и webhook-статусов писем
- cron/job runner в Railway для email-очереди

Следующий слой развития:

- интеграция с реальным video pipeline
- richer live-course flow для вебинаров и записей
- полноценный block CRUD для lesson studio
- role-specific workspaces без служебного шума

## Документация по проекту

- roadmap: `docs/current-implementation-roadmap.md`
- 10x-план: `docs/10x-product-improvement-roadmap.md`
- функциональная спецификация: `docs/academy-platform-functional-spec.md`
- хронология работы: GitHub issue `#1`
