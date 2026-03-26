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
- админский дашборд `/admin`
- страница пользователей `/admin/users`
- база знаний `/knowledge-base`
- публичные endpoints `GET /api/public/home`, `GET /api/courses`, `GET /api/user`
- checkout endpoint `GET /api/orders/[orderId]`
- регистрация `POST /api/auth/register`
- вход через Яндекс на `/sign-in`

Файлы нового среза:
- `frontend/src/landing/components/landing-experience.tsx`
- `frontend/src/landing/components/landing-course-carousel.tsx`
- `frontend/src/catalog/components/catalog-page-content.tsx`
- `frontend/src/auth/components/sign-in-page-content.tsx`
- `frontend/src/auth/components/auth-shell.tsx`
- `frontend/src/auth/components/sign-in-form.tsx`
- `frontend/src/auth/components/sign-up-form.tsx`
- `frontend/src/checkout/components/checkout-page-content.tsx`
- `frontend/src/admin/components/admin-dashboard-page-content.tsx`
- `frontend/src/admin/components/admin-users-page-content.tsx`
- `frontend/src/admin/components/course-access-page-content.tsx`
- `frontend/src/admin/components/courses-page-content.tsx`
- `frontend/src/learning/components/learning-dashboard-page-content.tsx`
- `frontend/src/knowledge-base/components/knowledge-base-page-content.tsx`
- `backend/src/public-home/get-public-home-payload.ts`
- `backend/src/public-catalog/get-public-catalog-payload.ts`
- `backend/src/public-checkout/get-public-checkout-payload.ts`
- `backend/src/auth/register-credentials-user.ts`
- `backend/src/public-auth/get-public-auth-screen-payload.ts`
- `backend/src/admin-dashboard/get-admin-dashboard-payload.ts`
- `backend/src/admin-users/get-admin-users-payload.ts`
- `backend/src/admin-course-access/get-admin-course-access-payload.ts`
- `backend/src/admin-courses/get-admin-courses-payload.ts`
- `backend/src/learning-dashboard/get-learning-dashboard-payload.ts`
- `database/src/public-home/public-home.repository.ts`
- `database/src/public-catalog/public-catalog.repository.ts`
- `database/src/public-checkout/public-checkout.repository.ts`
- `database/src/auth/auth.repository.ts`
- `database/src/admin-dashboard/admin-dashboard.repository.ts`
- `database/src/admin-users/admin-users.repository.ts`
- `database/src/admin-course-access/admin-course-access.repository.ts`
- `database/src/admin-courses/admin-courses.repository.ts`
- `database/src/learning-dashboard/learning-dashboard.repository.ts`
- `shared/src/public-home/types.ts`
- `shared/src/public-home/copy.ts`
- `shared/src/public-catalog/types.ts`
- `shared/src/public-auth/copy.ts`
- `shared/src/public-auth/types.ts`
- `shared/src/public-checkout/types.ts`
- `shared/src/admin-dashboard/types.ts`
- `shared/src/admin-users/types.ts`
- `shared/src/admin-course-access/types.ts`
- `shared/src/admin-courses/types.ts`
- `shared/src/learning-dashboard/types.ts`
- `shared/src/knowledge-base/types.ts`
- `shared/src/knowledge-base/content.ts`

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

OAuth:
- `YANDEX_CLIENT_ID`
- `YANDEX_CLIENT_SECRET`

## Railway

Во время `preDeployCommand` автоматически выполняются:
- `db:generate`
- `db:push`
- `db:seed`
- `db:sync-lesson-blocks`

## Рабочие контуры

- студенту в учебном кабинете оставляем минимальную навигацию: курсы, база знаний, выход
- автору и куратору даем отдельную кнопку `База знаний` с ролевыми инструкциями
- админу доступен графический дашборд и страница пользователей с фильтрами по роли, доступу и способу входа
- демо-оплаты пока остаются только в административном контуре
- на странице доступа к курсу админ может добавить студента, выдать бесплатный доступ или провести демо-списание для платного курса
- список курсов автора и учебный кабинет студента тоже переведены на layered-подход без прямого доступа страницы к Prisma
- старые адреса `/admin/letters` и `/author` больше не ломают сценарий и переводят на актуальные маршруты
- предпросмотр ролей у администратора работает через явный route-based flow, а не через неочевидное поведение формы в шапке

## Публичный контур

- лендинг собран по student-first логике: главный герой и основной маршрут ориентированы на ученика
- для преподавателя оставлен отдельный блок, а не переключение всей страницы
- секция курсов на лендинге листается кнопками, если программ больше трех
- иллюстрации оставляем только как вторичный визуальный слой: пустые состояния и вспомогательные зоны; центральные блоки лендинга, авторизации, checkout и базы знаний не должны от них ломаться
- в публичный каталог и landing-preview попадают только курсы с настроенной ценой по умолчанию
- на публичных страницах добавлен единый footer, чтобы витрина не обрывалась после последнего CTA
- базовые радиусы контролов централизованы через css-токены в `globals.css`; выпадающий список `Select` использует явную стрелку-иконку, а не случайные локальные стили

## Внутренние аккаунты

Сервисные аккаунты нужны только для разработки и внутренней проверки. В публичном UI они не показываются.

- Админ: `test@mail.ru` / `12345`
- Автор: `hp@mail.ru` / `123456789`

## Документация

- `docs/current-implementation-roadmap.md`
- `docs/10x-product-improvement-roadmap.md`
- `docs/academy-platform-functional-spec.md`
- GitHub issue `#1` — хронология работ
## Button contrast

- Primary and dark buttons must always use white text and white icons.
## Illustrations

- Local SVG illustrations are stored in `apps/web/public/illustrations`.
- The current illustration system uses unDraw assets adapted for platform pages.

## Вход через Яндекс

- на экране `/sign-in` используется отдельная черная кнопка `Войти через Яндекс`
- если email уже существует, Яндекс привязывается к существующему аккаунту
- если email новый, создается обычный учебный профиль
