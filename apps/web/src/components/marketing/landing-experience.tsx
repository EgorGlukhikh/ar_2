"use client";

import { startTransition, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CircleHelp,
  Compass,
  GraduationCap,
  LayoutGrid,
  PlayCircle,
  ShieldCheck,
  Tv,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  MetricChip,
  PublicButton,
  SectionLead,
  publicBadgeClassName,
  publicCardClassName,
  publicGradientCardClassName,
  publicIconBoxClassName,
  publicSoftCardClassName,
} from "@/components/marketing/public-primitives";
import { getPublicCourseCover } from "@/lib/marketing-theme";
import { formatPublicCopy } from "@/lib/public-copy";
import { cn } from "@/lib/utils";

type LandingRole = "learn" | "author";

type LandingCourseCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessonCount: number;
  priceLabel: string;
};

type LandingExperienceProps = {
  publishedCourses: number;
  courses: LandingCourseCard[];
};

const roleCopy = {
  learn: {
    eyebrow: "Обучение и запуск курсов по недвижимости — в одном месте",
    title: "Закрывай сделки увереннее. Учись сам — или запускай свой курс.",
    text:
      "Короткие практичные программы для риэлторов: записи и онлайн-потоки, задания, шаблоны и материалы в каждом уроке. А если ты эксперт — размести программу в каталоге и открой продажи без техрутины.",
    primaryHref: "/catalog",
    primaryLabel: "Выбрать курс",
    primaryHint: "Есть бесплатные программы. Можно без регистрации.",
    secondaryHref: "#authors",
    secondaryLabel: "Разместить программу",
    secondaryHint: "Подключение автора — по заявке, ответим за 1 рабочий день.",
    heroCardEyebrow: "Для автора программы",
    heroCardTitle: "Запусти курс без ручной сборки и бесконечных «докинь ссылку в чат».",
    heroCardPoints: [
      "Собери уроки из видео, текста, файлов, тестов и заданий — всё в одном месте.",
      "Запусти онлайн-поток по расписанию: эфир, запись и материалы остаются в уроке.",
      "Бесплатные и платные программы — в общем каталоге с понятной покупкой.",
    ],
    heroCardCta: "Посмотреть требования к авторам",
    processTitle: "Как это работает для ученика",
    processText:
      "Человек должен увидеть свой путь за несколько секунд: выбрал курс, открыл уроки, применил в работе с клиентом.",
    steps: [
      {
        title: "Выбираешь курс",
        text: "Сразу видишь тему, формат, цену и что будет внутри программы.",
        icon: Compass,
      },
      {
        title: "Проходишь уроки",
        text: "Смотришь записи, скачиваешь материалы и выполняешь задания.",
        icon: BookOpen,
      },
      {
        title: "Применяешь в сделке",
        text: "Берёшь шаблоны и подходы прямо в работу с продавцом или покупателем.",
        icon: BriefcaseBusiness,
      },
    ],
    faq: [
      {
        question: "Нужно ли регистрироваться, чтобы посмотреть каталог?",
        answer:
          "Нет. Каталог и карточки программ можно смотреть без регистрации. Вход понадобится, когда решишь открыть доступ к курсу или продолжить обучение.",
      },
      {
        question: "Во всех курсах есть запись уроков?",
        answer:
          "В курсах в записи уроки доступны сразу. В онлайн-потоках после эфира в уроке остаются запись и материалы по занятию.",
      },
      {
        question: "Что внутри уроков кроме видео?",
        answer:
          "Тексты, файлы, задания, тесты и рабочие материалы. В зависимости от курса внутри могут быть шаблоны, чек-листы и дополнительные ссылки.",
      },
      {
        question: "Сколько времени занимает обучение?",
        answer:
          "Зависит от программы. На карточке курса видно количество уроков, формат и стоимость, поэтому можно выбрать короткий или более глубокий трек под свою задачу.",
      },
    ],
  },
  author: {
    eyebrow: "Платформа для экспертов, школ и авторов программ по недвижимости",
    title: "Запусти курс по недвижимости и открой продажи без техрутины.",
    text:
      "Собери программу в записи или в формате онлайн-потока, задай цену, опубликуй курс в каталоге и веди учеников в понятной структуре уроков. Всё выглядит как продукт, а не как папка со ссылками.",
    primaryHref: "#authors",
    primaryLabel: "Стать автором",
    primaryHint: "Покажем процесс подключения и требования к программе.",
    secondaryHref: "/catalog",
    secondaryLabel: "Смотреть курсы",
    secondaryHint: "Посмотри, как программы выглядят для ученика в каталоге.",
    heroCardEyebrow: "Для владельца курса",
    heroCardTitle: "Собери программу один раз и веди поток без ручной пересборки уроков.",
    heroCardPoints: [
      "Видео, тексты, файлы, тесты и задания собираются в одну программу без разрозненных сервисов.",
      "Можно запускать запись или онлайн-поток по расписанию и оставлять материалы после эфира.",
      "Курс публикуется в общем каталоге, где ученик сразу видит формат, цену и следующий шаг.",
    ],
    heroCardCta: "Оставить заявку автору",
    processTitle: "Как это работает для автора",
    processText:
      "Путь тоже должен читаться сразу: собрал программу, опубликовал курс, ведёшь учеников без ручного хаоса.",
    steps: [
      {
        title: "Собираешь программу",
        text: "Уроки, задания, материалы и эфиры живут в одной структуре без внешних таблиц и чатов.",
        icon: LayoutGrid,
      },
      {
        title: "Публикуешь в каталоге",
        text: "У курса есть цена, описание, обложка и понятная карточка для ученика.",
        icon: PlayCircle,
      },
      {
        title: "Ведёшь поток",
        text: "Проводишь эфиры, оставляешь запись и материалы, а студент двигается по урокам внутри платформы.",
        icon: Tv,
      },
    ],
    faq: [
      {
        question: "Какие форматы курсов можно размещать?",
        answer:
          "Сейчас поддерживаются курсы в записи и онлайн-потоки с вебинарами. После эфира запись и материалы можно оставить в том же уроке.",
      },
      {
        question: "Что входит в урок автора?",
        answer:
          "Видео, текстовые блоки, файлы, задания и тесты. Это позволяет собирать не просто папку с материалами, а полноценную учебную программу.",
      },
      {
        question: "Как быстро вы отвечаете по заявке автора?",
        answer:
          "В публичной коммуникации ориентируемся на ответ в течение одного рабочего дня. Дальше смотрим программу и помогаем с публикацией.",
      },
      {
        question: "Можно ли вести курс по расписанию?",
        answer:
          "Да. Для онлайн-потоков занятия можно привязывать ко времени, а после эфира сохранять запись и материалы в уроке.",
      },
    ],
  },
} as const;

const trustPoints = [
  "Проверяем структуру программы перед публикацией.",
  "Уроки, материалы и задания остаются внутри платформы.",
  "Есть курсы в записи и онлайн-потоки по расписанию.",
  "Каталог показывает тему, формат, цену и понятный следующий шаг.",
];

const audienceCards = [
  {
    eyebrow: "Для новичка",
    title: "Войти в профессию без хаоса из чатов и случайных советов",
    text: "Идёшь по шагам, берёшь шаблоны и собираешь базовую систему работы риэлтора.",
    icon: GraduationCap,
  },
  {
    eyebrow: "Для агента с опытом",
    title: "Закрыть конкретный пробел перед реальной сделкой",
    text: "Выбираешь короткую программу под задачу: показы, переговоры, документы, работа с продавцом или покупателем.",
    icon: BookOpen,
  },
  {
    eyebrow: "Для автора курса",
    title: "Превратить экспертизу в продукт, а не в папку с файлами",
    text: "Размещаешь запись или поток, задаёшь цену и ведёшь учеников в понятной структуре уроков.",
    icon: Tv,
  },
] as const;

const showcaseCopyBySlug: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  "ethics-safety-real-estate": {
    title: "Этика и безопасность в недвижимости: fair housing, privacy и доверие",
    description:
      "Как общаться без дискриминации, защищать данные клиента и безопасно проводить показы.",
  },
  "buyer-deal-finance-closing": {
    title: "Сделка с покупателем: финансирование, inspection и closing",
    description:
      "Ведение покупателя от бюджета и buyer agreement до инспекции, оффера и финального закрытия.",
  },
  "seller-listing-system": {
    title: "Листинг продавца: подготовка объекта, показы и multiple offers",
    description:
      "Путь продавца от постановки объекта в работу до показов, безопасности собственника и разбора офферов.",
  },
  "rieltor-client-intake": {
    title: "Первые 10 дней риэлтора: бриф клиента и маршрут сделки",
    description:
      "Как провести первый контакт, собрать рабочий бриф и не потерять клиента между звонком, показами и оффером.",
  },
};

function buildUrlWithRole(
  pathname: string,
  searchParams: URLSearchParams,
  role: LandingRole,
) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("role", role);
  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

function Copy({ value, className }: { value: string; className?: string }) {
  return <span className={className}>{formatPublicCopy(value)}</span>;
}

export function LandingExperience({
  publishedCourses,
  courses,
}: LandingExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<LandingRole>("learn");
  const activeCopy = roleCopy[role];

  useEffect(() => {
    const roleParam = searchParams.get("role");

    if (roleParam === "learn" || roleParam === "author") {
      setRole(roleParam);
      window.localStorage.setItem("academy-landing-role", roleParam);
      return;
    }

    const storedRole = window.localStorage.getItem("academy-landing-role");

    if (storedRole === "learn" || storedRole === "author") {
      setRole(storedRole);
      startTransition(() => {
        router.replace(buildUrlWithRole(pathname, new URLSearchParams(searchParams), storedRole), {
          scroll: false,
        });
      });
    }
  }, [pathname, router, searchParams]);

  function handleRoleChange(nextRole: LandingRole) {
    setRole(nextRole);
    window.localStorage.setItem("academy-landing-role", nextRole);
    startTransition(() => {
      router.replace(buildUrlWithRole(pathname, new URLSearchParams(searchParams), nextRole), {
        scroll: false,
      });
    });
  }

  return (
    <div className="space-y-16 md:space-y-20 lg:space-y-24">
      <header className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.9)] px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur md:px-6 md:py-5">
        <div className="flex min-h-20 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[var(--foreground)] text-sm font-semibold text-white">
              AR
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                <Copy value="Академия риэлторов" />
              </p>
              <p className="max-w-[540px] text-sm leading-6 text-[var(--muted)]">
                <Copy value="Курсы по недвижимости: для новичков, практикующих агентов и авторов программ." />
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <nav className="hidden flex-wrap gap-6 text-base text-[var(--muted)] md:flex">
              <Link href="#courses" className="transition hover:text-[var(--foreground)]">
                <Copy value="Курсы" />
              </Link>
              <Link href="#authors" className="transition hover:text-[var(--foreground)]">
                <Copy value="Для авторов" />
              </Link>
              <Link href="#formats" className="transition hover:text-[var(--foreground)]">
                <Copy value="Форматы" />
              </Link>
              <Link href="#faq" className="transition hover:text-[var(--foreground)]">
                <Copy value="FAQ" />
              </Link>
            </nav>

            <div className="flex flex-wrap gap-3">
              <PublicButton href="/sign-in" tone="secondary">
                <Copy value="Войти" />
              </PublicButton>
              <PublicButton href="/catalog">
                <Copy value="Подобрать курс" />
              </PublicButton>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-8 xl:grid-cols-2 xl:items-center">
        <div className="space-y-8">
          <div className={publicBadgeClassName}>
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
            <Copy value={activeCopy.eyebrow} />
          </div>

          <div className="inline-flex rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-strong)] p-1 shadow-[var(--shadow-sm)]">
            {([
              { value: "learn", label: "Я учусь" },
              { value: "author", label: "Я автор" },
            ] as const).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleRoleChange(item.value)}
                className={cn(
                  "min-h-[calc(var(--control-height)-8px)] rounded-[calc(var(--control-radius)-4px)] px-5 text-sm font-semibold transition duration-200",
                  role === item.value
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-brand)] hover:text-[var(--primary-foreground)]"
                    : "text-[var(--foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
                )}
              >
                <Copy value={item.label} />
              </button>
            ))}
          </div>

          <div className="max-w-[620px] space-y-5">
            <h1 className="max-w-[11ch] text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-[var(--foreground)]">
              <Copy value={activeCopy.title} />
            </h1>
            <p className="max-w-[560px] text-[18px] leading-8 text-[var(--muted)]">
              <Copy value={activeCopy.text} />
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={publicSoftCardClassName}>
              <PublicButton href={activeCopy.primaryHref} className="w-full justify-center">
                <Copy value={activeCopy.primaryLabel} />
              </PublicButton>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                <Copy value={activeCopy.primaryHint} />
              </p>
            </div>

            <div className={publicSoftCardClassName}>
              <PublicButton
                href={activeCopy.secondaryHref}
                tone="secondary"
                className="w-full justify-center"
              >
                <Copy value={activeCopy.secondaryLabel} />
              </PublicButton>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                <Copy value={activeCopy.secondaryHint} />
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricChip
              label="В каталоге"
              value={`${publishedCourses} программы на старте`}
            />
            <MetricChip label="Форматы" value="Записи и онлайн-потоки" />
            <MetricChip label="Внутри" value="Уроки, материалы и задания" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <article id="authors" className={publicGradientCardClassName}>
            <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-white/68">
              <Copy value={activeCopy.heroCardEyebrow} />
            </p>
            <h2 className="mt-4 max-w-[13ch] text-[32px] font-semibold leading-10 tracking-[-0.02em] text-white">
              <Copy value={activeCopy.heroCardTitle} />
            </h2>
            <div className="mt-6 space-y-3">
              {activeCopy.heroCardPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-[16px] border border-white/15 bg-white/10 px-4 py-4 text-sm leading-6 text-white/88"
                >
                  <Copy value={point} />
                </div>
              ))}
            </div>
            <Link
              href="/sign-in?role=author"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white transition hover:text-white/80"
            >
              <Copy value={activeCopy.heroCardCta} />
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <div id="formats" className="grid gap-4">
            <article className={publicCardClassName}>
              <div className={publicIconBoxClassName}>
                <PlayCircle className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
                <Copy value="Курс в записи" />
              </h3>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                <Copy value="Видео, текст, файлы и тесты. Учишься в своём темпе и возвращаешься к урокам, когда нужно." />
              </p>
            </article>

            <article className={publicCardClassName}>
              <div className={publicIconBoxClassName}>
                <Tv className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
                <Copy value="Онлайн-поток" />
              </h3>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                <Copy value="Занятия по расписанию. После эфира запись, материалы и домашка остаются в том же уроке." />
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trustPoints.map((item) => (
            <article key={item} className="flex items-start gap-3 rounded-[16px] bg-[var(--surface-strong)] p-4">
              <div className={cn(publicIconBoxClassName, "h-10 w-10 rounded-[12px]")}>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="text-sm leading-6 text-[var(--foreground)]">
                <Copy value={item} />
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border)]" />

      <section className="grid gap-8 xl:grid-cols-4 xl:items-start">
        <SectionLead
          eyebrow="Кому подходит"
          title="Выбери свой сценарий: старт в профессии, точечная прокачка или запуск своей программы"
          text="Подача должна сразу показывать, куда идти дальше: учиться, усиливать навык или размещать свой курс."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
          {audienceCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.title} className={publicCardClassName}>
                <div className={publicIconBoxClassName}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                  <Copy value={card.eyebrow} />
                </p>
                <h3 className="mt-3 text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
                  <Copy value={card.title} />
                </h3>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                  <Copy value={card.text} />
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-6 shadow-[var(--shadow-sm)] md:p-8">
        <div className="grid gap-8 xl:grid-cols-4 xl:items-start">
          <SectionLead
            eyebrow="Как это работает"
            title={activeCopy.processTitle}
            text={activeCopy.processText}
            className="xl:sticky xl:top-8"
          />

          <div className="grid gap-6 md:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
            {activeCopy.steps.map((step) => {
              const Icon = step.icon;

              return (
                <article key={step.title} className={publicCardClassName}>
                  <div className={publicIconBoxClassName}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold leading-7 text-[var(--foreground)]">
                    <Copy value={step.title} />
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                    <Copy value={step.text} />
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--border)]" />

      <section id="courses" className="space-y-8">
        <SectionLead
          eyebrow="Каталог"
          title="Выбирай программу под задачу сделки"
          text="В каждой карточке сразу видно формат, объём, цена и чему научишься. Открыл, понял и пошёл делать."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {courses.slice(0, 3).map((course, index) => {
            const copy = showcaseCopyBySlug[course.slug];

            return (
              <article key={course.id} className={publicCardClassName}>
                <div className="relative h-52 overflow-hidden rounded-[16px]">
                  <Image
                    src={getPublicCourseCover(index)}
                    alt={copy?.title ?? course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className={publicBadgeClassName}>
                    <Copy value={`${course.lessonCount} уроков`} />
                  </span>
                  <span className={publicBadgeClassName}>
                    <Copy value={course.priceLabel} />
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
                  <Copy value={copy?.title ?? course.title} />
                </h3>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                  <Copy value={copy?.description ?? course.description} />
                </p>
                <Link
                  href={`/catalog#${course.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-base font-medium text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
                >
                  <Copy value="Смотреть программу" />
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section id="faq" className="space-y-8">
        <SectionLead
          eyebrow="FAQ"
          title="Снимаем последние вопросы до старта"
          text="Этот блок нужен не для галочки, а чтобы быстро закрыть сомнения ученика или автора перед действием."
        />

        <div className="grid gap-4">
          {activeCopy.faq.map((item) => (
            <details
              key={item.question}
              className="group rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-xl font-semibold leading-8 text-[var(--foreground)]">
                <Copy value={item.question} />
                <CircleHelp className="mt-1 h-5 w-5 flex-none text-[var(--primary)] transition group-open:rotate-12" />
              </summary>
              <p className="mt-4 max-w-[760px] text-base leading-7 text-[var(--muted)]">
                <Copy value={item.answer} />
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-[#1e285d] bg-[image:var(--brand-gradient)] bg-cover bg-center px-6 py-8 text-white shadow-[var(--shadow-brand)] md:px-8 md:py-12">
        <div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
          <SectionLead
            eyebrow="Готовы начать?"
            title="Выбери курс — или подай заявку на размещение программы"
            text="Зайди в каталог, посмотри форматы и начни с того, что даст результат уже в ближайшей сделке."
            light
          />

          <div className="flex flex-col gap-3 sm:flex-row xl:items-end">
            <PublicButton href="/catalog" tone="secondary" className="min-w-[220px]">
              <Copy value="Перейти в каталог" />
            </PublicButton>
            <PublicButton href="/sign-in?role=author" tone="ghost" className="min-w-[220px]">
              <Copy value="Стать автором" />
            </PublicButton>
          </div>
        </div>
      </section>
    </div>
  );
}
