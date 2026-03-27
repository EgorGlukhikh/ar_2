# Контекст для передачи другому агенту

Дата фиксации: `2026-03-25`  
Рабочая директория: `D:\AR_codex`

## 1. Что это за проект

Проект: платформа обучения для «Академии риэлторов».

Цель продукта:
- продавать курсы как цифровые продукты;
- давать студентам нормальный учебный кабинет;
- позволять авторам собирать и публиковать свои программы;
- поддерживать домашние задания, проверку, прогресс и аналитику;
- в перспективе использовать платформу и под вебинары/живые эфиры.

Изначальный ориентир по рынку: `GetCourse`, `Skillbox`, официальные help-центры edtech-платформ и публичные feature-страницы конкурентов.

## 2. Технологический стек

- `Next.js 15`
- `React 19`
- `Prisma 7`
- `Auth.js` c `email + password`
- `PostgreSQL`
- workspace-структура / modular monolith
- production target: `Railway`

Репозиторий:
- GitHub: `https://github.com/EgorGlukhikh/ar_2`

## 3. Деплой и окружение

Production стенд:
- `https://web-production-c3abb.up.railway.app`

Health endpoint:
- `https://web-production-c3abb.up.railway.app/api/health`

В Railway используется схема:
- сервис `web`
- сервис `Postgres`

Минимальные production env:
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

Если включать реальные письма через Resend:
- `EMAIL_PROVIDER=resend`
- `EMAIL_FROM_EMAIL`
- `EMAIL_FROM_NAME`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `CRON_SECRET`

Для отложенной email-очереди нужен Railway cron / job на:
- `POST /api/cron/email-queue`
- заголовок `x-cron-secret: <CRON_SECRET>`

## 4. Что уже собрано в продукте

### Публичный слой

- лендинг;
- страница входа;
- каталог курсов;
- demo checkout / demo оплата;
- блоки под сценарии:
  - обучение;
  - публикация своих программ;
  - вебинары / живые запуски.

### Авторизация и роли

- email/password auth;
- роли:
  - `ADMIN`
  - `AUTHOR`
  - `CURATOR`
  - `SALES_MANAGER`
  - `STUDENT`
- role preview для администратора;
- role-based redirect после входа;
- invite-flow для команды.

### Внутренний контур

- рабочий shell для команды;
- управление курсами;
- управление студентами;
- управление письмами;
- аналитика;
- домашние задания;
- команда / приглашения.

### Курсы и редактор

- курсы;
- модули;
- уроки;
- block-based editor урока;
- в уроке могут жить одновременно:
  - текст;
  - видео;
  - файл / материал;
  - задание;
- notion-like направление редактора уже начато:
  - структура курса слева;
  - рабочая область по центру.

### Видео

- foundation для `private/public RUTUBE`;
- поддержка embed;
- поддержка managed video foundation;
- упрощенный сценарий: ссылка на видео или загрузка файла.

### Платежи

- demo billing;
- demo checkout;
- автоматическая выдача доступа после demo-оплаты;
- архитектура уже подготовлена под реальных провайдеров.

### Домашние задания

- блок `Задание` в уроке;
- сдача студентом;
- статусы;
- комментарии проверяющего;
- история проверки;
- foundation под открытие следующего модуля после принятия.

### Email и маркетинг

- email-центр;
- очередь отправки;
- системные письма;
- маркетинговая цепочка из 5 писем;
- статусы:
  - `queued`
  - `sent`
  - `delivered`
  - `opened`
  - `clicked`
  - `failed`

### Аналитика

- foundation behavioral analytics;
- события по урокам;
- tracking прохождения;
- admin-side обзор;
- groundwork под более глубокую аналитику студентов.

## 5. Текущий зафиксированный план

Актуальный файл:
- `D:\AR_codex\docs\current-implementation-roadmap.md`

Порядок фаз:
1. `Course Studio UX`
2. `Homework Review V2`
3. `Role-Specific Workspaces`
4. `Student Analytics Dashboard`
5. `Catalog / Checkout Polish`
6. `Реальные интеграции`
7. `Files / Media / Submissions`
8. `Final Design Pass`

Дополнительный стратегический файл:
- `D:\AR_codex\docs\10x-product-improvement-roadmap.md`

## 6. Что было ключевым запросом пользователя по UX

### По editor / курсам

Пользователь хочет редактор курса ближе к `Notion`:
- слева дерево модулей и уроков;
- по нажатию на урок открывается центральный canvas;
- лишние служебные блоки нужно убирать;
- настройки урока не должны засорять экран;
- блоки урока должны быть сворачиваемыми;
- блоки урока должны добавляться через popup `Выберите блок`;
- нужны типы блоков вроде:
  - текст;
  - видео;
  - задание;
  - файл / материал;
- блоки внутри урока должны перетаскиваться;
- слева структура курса должна обновляться сразу.

### По визуалу

- убирать английские слова из интерфейса;
- делать интерфейс функциональным в первую очередь, без лишних подсказок на экране;
- если нужен onboarding, он должен быть отдельным слоем, а не постоянным шумом;
- лендинг должен быть сильнее и ближе к edtech-уровню вроде `Skillbox`, но без слепого копирования.

### По продуктовой логике

- можно проходить курсы;
- можно загружать и продавать свои курсы;
- можно использовать платформу под вебинары;
- нужна командная работа: автор, куратор, продажи, админ;
- нужна аналитика по тому, где студент перестал смотреть или учиться.

## 7. Последние значимые изменения

По git log перед передачей:
- `92076e7 feat: polish landing and homework review flow`
- `fa30004 feat: add module reordering and clean ui copy`
- `cd9a94a feat: streamline course studio and landing layout`
- `664048a docs: lock execution roadmap`
- `35c0745 feat: add workspace invites and tighten landing layout`
- `fd65788 feat: add role-based workspace access`
- `0366e26 feat: add homework workflow and simplify course studio`
- `c15e041 feat: rebuild lesson studio as block editor`
- `4ea0159 feat: add email automation and student analytics`
- `6137dc1 feat: unify workspace ui and add 10x roadmap`

### Что было сделано в последних пакетах

- лендинг стал плотнее и чище;
- добавлен `Стать автором`;
- вычищалась русификация интерфейса;
- homework review flow стал глубже;
- появились invite-flow и role-based workspaces;
- курс-студия была упрощена и двигалась в notion-like сторону;
- модульная структура и drag/drop начали доводиться.

## 8. Хронология

Хронология работ ведется в GitHub issue:
- `#1`

Требование пользователя:
- комментарии в хронологии и `README` должны быть на русском;
- по крупным этапам нужно делать запись в issue.

## 9. GitHub и доступ

На момент передачи:
- `git` доступ к `origin` работает;
- `gh` CLI был переавторизован и снова работает;
- можно:
  - пушить в `main`;
  - писать в issue через `gh`.

Важно:
- секреты и токены не сохранять в этот файл;
- токен, который пользователь присылал в чат, лучше потом перевыпустить из соображений безопасности.

## 10. ByteRover / memory

Попытка использовать `ByteRover` в этой сессии не дала рабочего результата.

Причины:
- сначала была проблема с PowerShell execution policy;
- затем `cmd /c brv status` показал, что локальная установка `byterover-cli` сломана:
  - отсутствует `run.js` внутри глобального npm-модуля.

Вывод:
- на данный момент ByteRover нельзя считать рабочим источником памяти;
- опора должна быть на репозиторий, docs и issue-хронологию.

## 11. Что осталось нерешенным прямо сейчас

### Продуктовые хвосты

- дожать `Course Studio UX`;
- продолжить cleanup editor;
- довести drag-and-drop структуры;
- добить `Homework Review V2`;
- усилить role-specific dashboards;
- довести student analytics;
- сделать еще один проход по лендингу и каталогу.

### Реальные интеграции

- реальные письма через `Resend`;
- реальные платежи;
- production video provider;
- cron queue для email.

### Файлы

- полноценное хранилище материалов и вложений, а не только ссылки.

## 12. Отдельный незакрытый запрос пользователя

Пользователь попросил создать тестовый доступ для Юры в роли автора курса:
- email: `hp@mail.ru`
- пароль: `123456789`
- роль: `AUTHOR`

На момент этой передачи это было запрошено, но не зафиксировано как выполненное.

## 13. Где смотреть в коде в первую очередь

### Документация

- `D:\AR_codex\README.md`
- `D:\AR_codex\docs\current-implementation-roadmap.md`
- `D:\AR_codex\docs\10x-product-improvement-roadmap.md`

### Публичный слой

- `D:\AR_codex\apps\web\src\app\page.tsx`
- `D:\AR_codex\apps\web\src\app\catalog\page.tsx`
- `D:\AR_codex\apps\web\src\app\sign-in\page.tsx`
- `D:\AR_codex\apps\web\src\components\marketing\public-primitives.tsx`
- `D:\AR_codex\apps\web\src\lib\marketing-theme.ts`

### Внутренний слой

- `D:\AR_codex\apps\web\src\app\admin`
- `D:\AR_codex\apps\web\src\app\learning`
- `D:\AR_codex\apps\web\src\components\workspace`

### Курсы и редактор

- `D:\AR_codex\apps\web\src\app\admin\courses\[courseId]\content\page.tsx`
- `D:\AR_codex\apps\web\src\components\admin\lesson-block-studio.tsx`
- `D:\AR_codex\apps\web\src\components\admin\admin-lesson-video-manager.tsx`
- `D:\AR_codex\apps\web\src\features\admin\course-actions.ts`
- `D:\AR_codex\apps\web\src\lib\lesson-content.ts`

### Домашки

- `D:\AR_codex\apps\web\src\app\admin\homework\page.tsx`
- `D:\AR_codex\apps\web\src\features\homework\actions.ts`
- `D:\AR_codex\apps\web\src\app\learning\courses\[courseId]\page.tsx`

### Команда и роли

- `D:\AR_codex\apps\web\src\app\admin\team\page.tsx`
- `D:\AR_codex\apps\web\src\features\admin\invite-actions.ts`
- `D:\AR_codex\apps\web\src\app\invite\[token]\page.tsx`
- `D:\AR_codex\apps\web\src\lib\admin.ts`

### Email и аналитика

- `D:\AR_codex\apps\web\src\app\admin\emails\page.tsx`
- `D:\AR_codex\apps\web\src\app\admin\analytics\page.tsx`
- `D:\AR_codex\apps\web\src\features\email\service.ts`
- `D:\AR_codex\apps\web\src\components\learning\lesson-engagement-tracker.tsx`

### База

- `D:\AR_codex\packages\db\prisma\schema.prisma`

## 14. Рекомендуемый следующий шаг для нового агента

1. Прочитать:
   - `README.md`
   - `docs/current-implementation-roadmap.md`
   - этот handoff-файл
2. Проверить `git status`
3. Проверить `gh auth status`
4. При необходимости создать автора Юру:
   - `hp@mail.ru`
   - `123456789`
   - роль `AUTHOR`
5. Затем продолжить строго по фазе `Course Studio UX`

## 15. Короткая суть проекта в одном абзаце

Это уже не пустой MVP, а работающий каркас edtech-платформы с ролями, курсами, редактором уроков, домашками, демо-платежами, email-центром, invite-flow и аналитикой. Главная задача следующего агента — не строить заново, а довести курс-студию, домашки, role-specific workspaces и продающий слой до состояния устойчивого продукта, сохраняя единый визуальный язык, русскоязычный интерфейс и дисциплину по roadmap.
