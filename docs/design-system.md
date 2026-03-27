# Design System — Академия риэлторов

Единый источник правды по токенам, сетке и компонентам. Всё, что написано здесь, уже реализовано в коде — документ описывает то, что есть, и задаёт правила расширения.

---

## 1. Токены (Design Tokens)

Все значения живут в CSS-переменных в `apps/web/src/app/globals.css`. Нигде в компонентах не должны появляться захардкоженные цвета, радиусы или отступы — только `var(--*)`.

### Цвета

| Переменная | Значение | Назначение |
|---|---|---|
| `--background` | `#f5f7fb` | Фон страницы |
| `--foreground` | `#0f172a` | Основной текст |
| `--text` | `#0f172a` | Заголовки (alias foreground) |
| `--text-muted` | `#5b6472` | Подзаголовки, описания |
| `--muted` | `#5b6472` | Вторичный текст |
| `--muted-soft` | `#94a3b8` | Placeholder, disabled |
| `--surface` | `#ffffff` | Карточки, панели |
| `--surface-alt` | `#fbfcfe` | Альтернативный фон секций |
| `--surface-strong` | `#f1f4f9` | Выделенные блоки внутри карточек |
| `--surface-soft` | `#eef2ff` | Мягкий акцент (иконки) |
| `--border` | `#e2e8f0` | Обычная граница |
| `--border-strong` | `#cbd5e1` | Граница контролов |
| `--primary` | `#4f46e5` | Основной акцент, кнопки |
| `--primary-hover` | `#4338ca` | Hover состояние primary |
| `--primary-active` | `#3730a3` | Active состояние primary |
| `--primary-foreground` | `#ffffff` | Текст на primary-фоне |
| `--primary-soft` | `#eef2ff` | Фон иконок, мягкие акценты |
| `--focus` | `rgba(79,70,229,0.16)` | Ring при фокусе |
| `--success` | `#22c55e` | Положительный статус |
| `--warning` | `#f59e0b` | Предупреждение |
| `--error` | `#ef4444` | Ошибка |
| `--info` | `#2563eb` | Информация |

### Тени

| Переменная | Назначение |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(15,23,42,0.04)` — карточки |
| `--shadow-md` | `0 6px 18px rgba(15,23,42,0.08)` — hover карточек |
| `--shadow-lg` | `0 16px 40px rgba(15,23,42,0.1)` — модалки, поверх |
| `--shadow-brand` | `0 18px 48px rgba(79,70,229,0.24)` — primary кнопки |

### Радиусы

Система построена от наименьшего к наибольшему. Каждый уровень имеет смысловое назначение.

| Переменная | Значение | Где использовать |
|---|---|---|
| `--radius-xs` | `10px` | Чипы, теги, маленькие элементы |
| `--radius-sm` | `12px` | Инлайн-блоки, метки |
| `--radius-md` | `16px` | Внутренние блоки карточек, инпуты внутри форм |
| `--radius-lg` | `20px` | Карточки (основной радиус карточек) |
| `--radius-xl` | `24px` | Большие секции, hero-карточки |
| `--control-radius` | `14px` | Кнопки, поля ввода, select |
| `--icon-radius` | `14px` | Иконки 44×44 |
| `--icon-radius-sm` | `12px` | Иконки 40×40 и меньше |

### Контролы

| Переменная | Значение | Назначение |
|---|---|---|
| `--control-height` | `48px` | Высота input/button (default) |
| `--control-height-sm` | `40px` | Высота input/button (sm) |

---

## 2. Типографика

Используется `Geist Sans` (переменная `--font-geist-sans`). Нет глобальных Tailwind-классов `text-*` из дефолтной шкалы — всё через `text-[...]` с конкретным значением.

### Шкала шрифтов

| Роль | Размер | Высота строки | Трекинг | Где |
|---|---|---|---|---|
| Hero H1 | `clamp(2.55rem, 5.4vw, 4.6rem)` | `0.96` | `-0.04em` | Главный заголовок страницы |
| Section H2 | `clamp(1.8rem, 4vw, 3rem)` | `1.06` | `-0.03em` | Заголовки секций (SectionLead) |
| Card H2 | `28px` / `text-[28px]` | `36px` | `-0.02em` | Заголовки карточек с результатом |
| Card H2 fluid | `clamp(1.8rem,3.1vw,2.6rem)` | `1.06` | `-0.03em` | Gradient cards |
| Card H3 | `24px` / `text-2xl` | `32px` | `-0.02em` | Заголовки карточек |
| Card H3 small | `20px` / `text-xl` | `28px` | — | Вторичные заголовки |
| Body | `16px` | `28px` (leading-7) | — | Основной текст |
| Body large | `17px` | `32px` (leading-8) | — | Подзаголовки hero |
| Label/Meta | `12px` | `16px` (leading-4) | `0.18em` | UPPERCASE метки, eyebrow |
| Small | `14px` | `24px` (leading-6) | — | Вторичный контент |
| Badge | `13px` | `18px` | `0.04em` | Теги в каталоге |

**Правило eyebrow:** всегда `uppercase tracking-[0.18em] text-[12px] font-medium`.

---

## 3. Сетка (Grid System)

### Контейнер

```tsx
// PageContainer — всегда оборачивает контент страницы
<PageContainer> // max-w-[1200px] mx-auto px-6 md:px-8
  ...
</PageContainer>
```

### 12-колоночная сетка

```tsx
// PageGrid — базовая сетка
<PageGrid className="items-start">
  <div className="xl:col-span-6">...</div>
  <div className="xl:col-span-6">...</div>
</PageGrid>
```

**Поведение по брейкпоинтам:**

| Брейкпоинт | Колонки | Gap |
|---|---|---|
| `default` (< 768px) | 1 | 24px |
| `md` (768px+) | 8 | 24px |
| `xl` (1280px+) | 12 | `var(--grid-gutter)` = 24px |

**Стандартные паттерны разбивки:**

| Паттерн | Классы | Применение |
|---|---|---|
| 6 + 6 (равные половины) | `xl:col-span-6` + `xl:col-span-6` | Hero, параллельные секции |
| 4 + 8 (акцент слева) | `xl:col-span-4` + `xl:col-span-8` | SectionLead + CardsGrid |
| 8 + 4 (акцент справа) | `xl:col-span-8` + `xl:col-span-4` | Контент + CTA |
| 7 + 5 (асимметрия) | `xl:col-span-7` + `xl:col-span-5` | Gradient card + карточки |
| 4 + 4 + 4 (тройка) | используй `CardGrid columns="3"` | Trust-points, шаги |

**Важно:** `xl:col-span-*` работает только внутри `<PageGrid>`. Вложенный `<PageGrid>` допустим — колонки считаются заново.

### Вспомогательные компоненты сетки

```tsx
// GridSection — семантическая обёртка для секции
<GridSection id="value"> // <section> с space-y-8 md:space-y-10
  <PageGrid>...</PageGrid>
</GridSection>

// SectionShell — визуальная карточка-секция
<SectionShell> // border + bg-surface + padding + rounded-xl + shadow-sm
  ...
</SectionShell>

// CardGrid — сетка для карточек (не использует col-span)
<CardGrid columns="3"> // 1 → 2 → 3 колонки
  ...
</CardGrid>
// columns: "2" | "3" | "4"

// SectionVisual — обёртка для правой визуальной части
<SectionVisual> // min-w-0 (предотвращает overflow в grid)
  ...
</SectionVisual>
```

---

## 4. Компоненты

Компоненты разделены на три слоя по назначению.

### Слой 1: UI-компоненты (`apps/web/src/components/ui/`)

Базовые интерактивные элементы. Используются везде — и на публичных страницах, и в рабочем кабинете.

#### Button

```tsx
import { Button } from "@/components/ui/button";

// Варианты
<Button>Основное действие</Button>                    // default — primary
<Button variant="outline">Вторичное</Button>           // outline
<Button variant="ghost">Третичное</Button>             // ghost

// Размеры
<Button size="sm">Маленькая</Button>                   // 40px
<Button>Обычная</Button>                               // 48px (default)
<Button size="lg">Большая</Button>                     // 56px

// Композиция с Link (через Radix Slot)
<Button asChild variant="outline">
  <Link href="/catalog">В каталог</Link>
</Button>

// Форм-кнопка
<Button type="submit" className="w-full justify-center">
  Сохранить
</Button>
```

**Правила:**
- `disabled` — никогда не через `pointer-events-none`, только `disabled` атрибут
- `asChild` — для Link-кнопок, не оборачивай `<a>` в `<button>`
- `w-full justify-center` — для кнопок полной ширины

#### Input / Label / Textarea / Select

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

// Стандартный паттерн поля
<div className="space-y-2">
  <Label htmlFor="field-id">Название поля</Label>
  <Input id="field-id" name="fieldName" type="text" required />
</div>
```

**Правила:**
- Всегда связывать `<Label htmlFor>` с `<Input id>`
- `name` обязателен для server actions
- Никогда не использовать сырые `<input>`/`<label>` с `className` — только компоненты

#### Badge

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Активен</Badge>
<Badge variant="neutral">Нейтральный</Badge>
<Badge variant="success">Завершён</Badge>
<Badge variant="warning">На проверке</Badge>
```

---

### Слой 2: Маркетинговые примитивы (`apps/web/src/components/marketing/public-primitives.tsx`)

Используются только на публичных страницах (`/`, `/catalog`, `/checkout`, `/sign-in`, `/sign-up`).

#### Классы карточек

```tsx
import {
  publicCardClassName,
  publicSoftCardClassName,
  publicGradientCardClassName,
  publicIconBoxClassName,
  publicBadgeClassName,
} from "@/components/marketing/public-primitives";

// Обычная карточка (белая, с hover-lift)
<article className={publicCardClassName}>...</article>

// Мягкая карточка (surface-alt, без hover)
<article className={publicSoftCardClassName}>...</article>

// Градиентная карточка (brand gradient, белый текст)
<article className={publicGradientCardClassName}>...</article>

// Иконка в карточке
<div className={publicIconBoxClassName}>
  <Icon className="h-5 w-5" />
</div>

// Тег/badge в каталоге
<span className={publicBadgeClassName}>12 уроков</span>
```

#### PublicButton — ссылка-кнопка

```tsx
import { PublicButton } from "@/components/marketing/public-primitives";

// Используется когда action — это навигация (href)
<PublicButton href="/catalog">Выбрать курс</PublicButton>
<PublicButton href="/sign-in" tone="secondary">Войти</PublicButton>
<PublicButton href="/catalog" tone="ghost">Смотреть</PublicButton>
<PublicButton href="/sign-up" tone="dark">Начать</PublicButton>
```

**Правило:** `PublicButton` — только для `<Link>`. Для `<form>` action → `<Button type="submit">`.

#### SectionLead — заголовок секции

```tsx
import { SectionLead } from "@/components/marketing/public-primitives";

<SectionLead
  eyebrow="Для кого"
  title="Заголовок секции"
  text="Описание, которое объясняет ценность для пользователя."
/>

// На тёмном фоне (gradient-card)
<SectionLead eyebrow="..." title="..." text="..." light />
```

#### MetricChip — числовая метрика

```tsx
import { MetricChip } from "@/components/marketing/public-primitives";

<MetricChip label="В каталоге" value="12 программ" />
```

---

### Слой 3: Workspace-примитивы (`apps/web/src/components/workspace/workspace-primitives.tsx`)

Используются только в рабочем кабинете: admin, student-learning, course-studio.

```tsx
import {
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
  WorkspaceEmptyState,
  CourseThumb,
} from "@/components/workspace/workspace-primitives";

// Шапка страницы
<WorkspacePageHeader
  eyebrow="Раздел"
  title="Название страницы"
  description="Описание что здесь делается."
  actions={<Button>Действие</Button>}
/>

// Панель с контентом
<WorkspacePanel
  eyebrow="Подраздел"
  title="Заголовок панели"
  description="Краткое описание."
>
  {/* content */}
</WorkspacePanel>

// Стат-карточка
<WorkspaceStatCard
  label="Студентов"
  value="42"
  hint="За последние 30 дней"
  icon={Users}
/>

// Пустое состояние
<WorkspaceEmptyState
  title="Ничего нет"
  description="Добавьте первый элемент."
  action={<Button>Добавить</Button>}
/>
```

---

## 5. Правила написания разметки

### Текст и копирайт

```tsx
import { formatPublicCopy } from "@/lib/public-copy";

// На публичных страницах — всегда через formatPublicCopy
<p>{formatPublicCopy("Текст для пользователя")}</p>

// В кабинете — можно напрямую (это служебный UI)
<p>Добавить студента</p>
```

### Вложенность PageGrid

```tsx
// Допустимо — вложенная сетка в правой колонке
<PageGrid>
  <div className="xl:col-span-4">
    <SectionLead ... />
  </div>
  <div className="xl:col-span-8">
    <PageGrid className="items-stretch">  {/* вложенная 12-col */}
      <article className="xl:col-span-7">...</article>
      <div className="xl:col-span-5">...</div>
    </PageGrid>
  </div>
</PageGrid>
```

### Семантика

- `<section>` → крупные смысловые блоки страницы (используй `GridSection`)
- `<article>` → самостоятельные карточки контента
- `<div>` → вёрстка, обёртки без смысла
- `<header>` → шапка страницы или секции
- `<h1>` → один на страницу (hero)
- `<h2>` → заголовки секций (SectionLead генерирует h2)
- `<h3>` → заголовки карточек

### Отступы между секциями

```tsx
// Корневой контейнер страниц landing
<div className="space-y-16 md:space-y-20 lg:space-y-[var(--section-gap)]">
  {/* секции */}
</div>

// --section-gap = 96px
```

---

## 6. Слои сканирования Tailwind

Tailwind v4 настроен в `apps/web/src/app/globals.css`:

```css
@import "tailwindcss";
@source "../../../../frontend/src";  /* сканирует frontend/src/ */
```

Все компоненты из `frontend/src/` обрабатываются. Компоненты из `apps/web/src/` сканируются автоматически.

**Правило:** если добавляешь новую папку за пределами `apps/web/src/` и `frontend/src/` — добавь `@source` директиву в `globals.css`.

---

## 7. Архитектура файлов

```
apps/web/src/
├── app/
│   └── globals.css            ← токены + Tailwind import + @source
├── components/
│   ├── ui/                    ← Слой 1: базовые компоненты
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   └── badge.tsx
│   ├── layout/
│   │   └── page-grid.tsx      ← сетка (PageGrid, CardGrid, SectionShell...)
│   ├── marketing/
│   │   └── public-primitives.tsx  ← Слой 2: маркетинговые примитивы
│   └── workspace/
│       └── workspace-primitives.tsx  ← Слой 3: workspace-примитивы

frontend/src/
├── landing/                   ← страница лендинга
├── catalog/                   ← страница каталога
├── checkout/                  ← страница оплаты
├── auth/                      ← формы входа/регистрации
├── admin/                     ← страницы администратора
└── learning/                  ← учебный кабинет
```

---

## 8. Что НЕ делать

| Нельзя | Правильно |
|---|---|
| `<button className="bg-indigo-600 ...">` | `<Button>` |
| `<input className="border rounded ...">` | `<Input>` |
| `<label className="text-sm ...">` | `<Label>` |
| `rounded-2xl` (Tailwind-радиус) | `rounded-[var(--radius-md)]` |
| `text-indigo-600` | `text-[var(--primary)]` |
| `shadow-md` (Tailwind-тень) | `shadow-[var(--shadow-md)]` |
| `gap-6 xl:col-span-6` без `PageGrid` | сначала `<PageGrid>`, потом колонки |
| Hardcode `#4f46e5` | `var(--primary)` |
| Писать `publicButtonClassName` на `<button>` | `<Button>` + `<PublicButton href>` |
