"use client";

import { startTransition, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  CalendarClock,
  ChevronDown,
  GraduationCap,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Tv,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  MetricChip,
  PublicButton,
  SectionLead,
  publicButtonClassName,
} from "@/components/marketing/public-primitives";
import { getPublicCourseCover } from "@/lib/marketing-theme";
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
      "Короткие практичные программы для риэлторов: записи и онлайн-потоки, задания, шаблоны и материалы в каждом уроке. Начать можно с бесплатных программ и перейти к нужной теме без лишнего поиска.",
    primaryHref: "/catalog",
    primaryLabel: "Подобрать курс",
    primaryHint: "Есть бесплатные программы. Можно без регистрации.",
    secondaryHref: "/sign-in?role=author",
    secondaryLabel: "Разместить программу",
    secondaryHint: "Подключение автора — по заявке, ответим за 1 рабочий день.",
    cardEyebrow: "Для автора программы",
    cardTitle: "Запусти курс без ручной сборки и бесконечных «докинь ссылку в чат».",
    cardPoints: [
      "Собери уроки из видео, текста, файлов, тестов и заданий — всё в одном месте.",
      "Запусти онлайн-поток по расписанию: эфир, запись и материалы остаются в уроке.",
      "Бесплатные и платные программы — в общем каталоге с понятной покупкой.",
    ],
    cardCtaHref: "#authors",
    cardCtaLabel: "Посмотреть требования к авторам",
    howItWorksTitle: "Как это работает для ученика",
    howItWorksText:
      "Сценарий должен быть понятным за несколько секунд: выбрал курс, открыл уроки, применил в работе с клиентом.",
    steps: [
      {
        title: "Выбираешь курс",
        text: "Сразу видишь тему, формат, цену и что будет внутри программы.",
      },
      {
        title: "Проходишь уроки",
        text: "Смотришь записи, скачиваешь материалы, выполняешь задания и тесты.",
      },
      {
        title: "Применяешь в сделке",
        text: "Берёшь шаблоны и подходы прямо в работу с продавцом или покупателем.",
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
          "Да, в курсах в записи уроки доступны сразу. В онлайн-потоках после эфира в уроке остается запись и материалы по занятию.",
      },
      {
        question: "Что внутри уроков кроме видео?",
        answer:
          "Тексты, файлы, домашние задания, тесты и рабочие материалы. В зависимости от курса в уроке могут быть шаблоны и дополнительные ссылки.",
      },
      {
        question: "Сколько времени занимает обучение?",
        answer:
          "Зависит от программы. На карточке курса видно количество уроков и формат. Можно выбрать короткую программу под конкретную задачу сделки.",
      },
    ],
  },
  author: {
    eyebrow: "Платформа для экспертов, школ и авторов программ по недвижимости",
    title: "Запусти курс по недвижимости и открой продажи без техрутины.",
    text:
      "Собери программу в записи или в формате онлайн-потока, задай цену, опубликуй курс в каталоге и веди учеников в понятной структуре уроков. Всё выглядит как продукт, а не как папка со ссылками.",
    primaryHref: "/sign-in?role=author",
    primaryLabel: "Стать автором",
    primaryHint: "Покажем процесс подключения и требования к программе.",
    secondaryHref: "/catalog",
    secondaryLabel: "Смотреть курсы",
    secondaryHint: "Посмотри, как программы выглядят для ученика в каталоге.",
    cardEyebrow: "Для владельца курса",
    cardTitle: "Собери программу один раз и веди поток без ручной пересборки уроков.",
    cardPoints: [
      "Видео, тексты, файлы, тесты и задания собираются в одну программу без разрозненных сервисов.",
      "Можно запускать запись или онлайн-поток по расписанию и оставлять материалы после эфира.",
      "Курс публикуется в общем каталоге, где ученик сразу видит формат, цену и следующий шаг.",
    ],
    cardCtaHref: "/sign-in?role=author",
    cardCtaLabel: "Оставить заявку автору",
    howItWorksTitle: "Как это работает для автора",
    howItWorksText:
      "Человек должен сразу понимать путь: собрал программу, опубликовал курс, ведешь учеников без ручного хаоса.",
    steps: [
      {
        title: "Собираешь программу",
        text: "Уроки, задания, файлы и эфиры хранятся в одной структуре без внешних таблиц и чатов.",
      },
      {
        title: "Публикуешь в каталоге",
        text: "У курса есть цена, описание, обложка и понятная карточка для ученика.",
      },
      {
        title: "Ведёшь поток",
        text: "Проводишь эфиры, оставляешь запись и материалы, а студент движется по урокам внутри платформы.",
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
          "Видео, текстовые блоки, файлы, задания и тесты. Это позволяет собирать не просто папку с материалами, а нормальную учебную программу.",
      },
      {
        question: "Как быстро отвечаете по заявке автора?",
        answer:
          "На лендинге и в коммуникации ориентируемся на ответ в течение 1 рабочего дня. Дальше смотрим программу и помогаем с публикацией.",
      },
      {
        question: "Можно ли вести курс вживую по расписанию?",
        answer:
          "Да. Для онлайн-потоков занятия можно привязывать ко времени, а после эфира сохранять запись и материалы в уроке.",
      },
    ],
  },
} as const;

const trustPoints = [
  "Курсы в записи и онлайн-потоки в одном каталоге.",
  "Материалы, задания и тесты остаются внутри уроков.",
  "Программы можно выбирать под конкретную задачу сделки.",
  "Автору не нужно вручную собирать уроки по чатам и ссылкам.",
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
    icon: BookOpenText,
  },
  {
    eyebrow: "Для автора курса",
    title: "Превратить экспертизу в продукт, а не в папку с файлами",
    text: "Размещаешь запись или поток, задаёшь цену и ведёшь учеников в понятной структуре уроков.",
    icon: Tv,
  },
];

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
    <>
      <header className="flex flex-col gap-4 border-b border-black/5 pb-4 sm:pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(145deg,_#182036_0%,_#2c4279_100%)] text-sm font-semibold text-white shadow-[0_16px_34px_rgba(24,32,54,0.2)] sm:h-12 sm:w-12 sm:rounded-[18px]">
            AR
          </div>
          <div>
            <p className="font-[family:var(--font-landing-display)] text-base font-semibold text-[#182036] sm:text-lg">
              Академия риэлторов
            </p>
            <p className="max-w-md text-sm leading-6 text-[#5f6982]">
              Курсы по недвижимости: для новичков, практикующих агентов и авторов программ.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <nav className="hidden flex-wrap gap-5 text-sm font-medium text-[#5f6982] md:flex">
            <Link href="#courses" className="transition hover:text-[#182036]">
              Курсы
            </Link>
            <Link href="#authors" className="transition hover:text-[#182036]">
              Для авторов
            </Link>
            <Link href="#formats" className="transition hover:text-[#182036]">
              Форматы
            </Link>
            <Link href="#faq" className="transition hover:text-[#182036]">
              FAQ
            </Link>
          </nav>

          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            <PublicButton href="/sign-in" tone="secondary">
              Войти
            </PublicButton>
            <PublicButton href={buildUrlWithRole(pathname, new URLSearchParams(searchParams), "learn")}>
              Подобрать курс
            </PublicButton>
          </div>
        </div>
      </header>

      <section className="grid gap-5 py-6 sm:gap-6 sm:py-8 xl:grid-cols-[1.04fr_0.96fr] xl:items-center">
        <div className="space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e2d7c8] bg-[rgba(255,250,241,0.92)] px-3.5 py-2 text-xs font-medium text-[#7a6548] shadow-[0_12px_28px_rgba(24,32,54,0.05)] sm:px-4 sm:text-sm">
            <Sparkles className="h-4 w-4 text-[#d27d45]" />
            {activeCopy.eyebrow}
          </div>

          <div className="inline-flex rounded-full border border-[#d6dbee] bg-white/85 p-1 shadow-[0_12px_26px_rgba(24,32,54,0.06)]">
            {([
              { value: "learn", label: "Я учусь" },
              { value: "author", label: "Я автор" },
            ] as const).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleRoleChange(item.value)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5",
                  role === item.value
                    ? "bg-[linear-gradient(135deg,_#2650d8_0%,_#4f6ff0_55%,_#7893ff_100%)] text-white shadow-[0_16px_34px_rgba(38,80,216,0.2)]"
                    : "text-[#5f6982] hover:text-[#182036]",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h1 className="max-w-[11.5ch] text-balance font-[family:var(--font-landing-display)] text-[clamp(2.3rem,10vw,5.5rem)] font-semibold leading-[0.92] tracking-tight text-[#182036]">
              {activeCopy.title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#5f6982] sm:text-base sm:leading-8 md:text-lg">
              {activeCopy.text}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2.5 rounded-[24px] border border-white/85 bg-white/88 p-4 shadow-[0_16px_36px_rgba(24,32,54,0.06)] sm:p-5">
              <Link href={activeCopy.primaryHref} className={publicButtonClassName("primary")}>
                {activeCopy.primaryLabel}
              </Link>
              <p className="text-sm leading-6 text-[#5f6982]">{activeCopy.primaryHint}</p>
            </div>

            <div className="space-y-2.5 rounded-[24px] border border-white/85 bg-white/88 p-4 shadow-[0_16px_36px_rgba(24,32,54,0.06)] sm:p-5">
              <Link href={activeCopy.secondaryHref} className={publicButtonClassName("secondary")}>
                {activeCopy.secondaryLabel}
              </Link>
              <p className="text-sm leading-6 text-[#5f6982]">{activeCopy.secondaryHint}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricChip
              label="В каталоге"
              value={`${publishedCourses} программ на старте`}
            />
            <MetricChip label="Форматы" value="Записи и онлайн-потоки" />
            <MetricChip label="Внутри" value="Уроки, материалы, задания" />
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.03fr_0.97fr]">
          <article
            id="authors"
            className="overflow-hidden rounded-[24px] bg-[linear-gradient(145deg,_#182036_0%,_#2240a3_56%,_#f08f68_100%)] p-5 text-white shadow-[0_28px_72px_rgba(24,32,54,0.22)] sm:rounded-[30px] sm:p-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60 sm:text-xs sm:tracking-[0.28em]">
              {activeCopy.cardEyebrow}
            </p>
            <h2 className="mt-3 max-w-[13ch] font-[family:var(--font-landing-display)] text-[1.95rem] font-semibold leading-[0.94] sm:text-3xl">
              {activeCopy.cardTitle}
            </h2>
            <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
              {activeCopy.cardPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-[18px] border border-white/12 bg-white/10 px-4 py-3 text-sm leading-6 text-white/88"
                >
                  {point}
                </div>
              ))}
            </div>
            <Link
              href={activeCopy.cardCtaHref}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-white/80"
            >
              {activeCopy.cardCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <div id="formats" className="grid gap-3 sm:gap-4">
            <article className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,248,239,0.96)] p-5 shadow-[0_20px_45px_rgba(24,32,54,0.1)] sm:rounded-[28px]">
              <div className="inline-flex rounded-2xl bg-white p-3 text-[#2650d8] shadow-sm">
                <PlayCircle className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[#182036] sm:text-2xl">
                Курс в записи
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#5f6982] sm:leading-7">
                Видео, текст, файлы и тесты. Учишься в своём темпе и возвращаешься к урокам, когда нужно.
              </p>
            </article>

            <article className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-[0_20px_45px_rgba(24,32,54,0.08)] sm:rounded-[28px]">
              <div className="inline-flex rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                <CalendarClock className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[#182036] sm:text-2xl">
                Онлайн-поток
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#5f6982] sm:leading-7">
                Занятия по расписанию по МСК. После эфира в уроке остаются запись, материалы и домашняя работа.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-3 border-t border-black/5 py-6 sm:grid-cols-2 sm:py-8 xl:grid-cols-4">
        {trustPoints.map((item) => (
          <article
            key={item}
            className="rounded-[22px] border border-white/85 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97)_0%,_rgba(249,250,253,0.94)_100%)] p-4 shadow-[0_16px_36px_rgba(24,32,54,0.06)]"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[var(--primary-soft)] p-2">
                <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <p className="text-sm leading-6 text-[#182036]">{item}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-6 border-t border-black/5 pt-6 sm:space-y-8 sm:pt-8">
        <SectionLead
          eyebrow="Как это работает"
          title={activeCopy.howItWorksTitle}
          text={activeCopy.howItWorksText}
        />

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {activeCopy.steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[24px] border border-white/85 bg-white p-5 shadow-[0_18px_45px_rgba(24,32,54,0.07)] sm:rounded-[30px] sm:p-6"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#2650d8_0%,_#4f6ff0_55%,_#7893ff_100%)] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(38,80,216,0.2)]">
                {index + 1}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[#182036]">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#5f6982]">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6 border-t border-black/5 pt-6 sm:space-y-8 sm:pt-8">
        <SectionLead
          eyebrow="Кому подойдет"
          title="Кому подойдёт Академия"
          text="Выбери свой сценарий: старт в профессии, точечная прокачка навыков или запуск собственной программы."
        />

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {audienceCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-[24px] border border-white/85 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97)_0%,_rgba(249,250,253,0.94)_100%)] p-5 shadow-[0_18px_45px_rgba(24,32,54,0.07)] sm:rounded-[30px] sm:p-6"
              >
                <div className="inline-flex rounded-[18px] bg-[linear-gradient(135deg,_rgba(38,80,216,0.16)_0%,_rgba(79,111,240,0.08)_100%)] p-3">
                  <Icon className="h-5 w-5 text-[#2650d8]" />
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7a6548] sm:mt-5 sm:text-xs sm:tracking-[0.28em]">
                  {card.eyebrow}
                </p>
                <h3 className="mt-2.5 text-xl font-semibold leading-tight text-[#182036] sm:mt-3 sm:text-2xl">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#5f6982] sm:mt-4 sm:leading-7">
                  {card.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="courses" className="space-y-6 border-t border-black/5 pt-6 sm:space-y-8 sm:pt-8">
        <SectionLead
          eyebrow="Курсы"
          title="Выбирай программу под задачу сделки"
          text="В каждой карточке сразу видно: формат, объём, цена и чему научишься. Открыл, понял, пошёл делать."
        />

        <div className="grid gap-4 xl:grid-cols-3 xl:gap-5">
          {courses.map((course, index) => {
            const showcaseCopy = showcaseCopyBySlug[course.slug];

            return (
            <article
              key={course.id}
              className="overflow-hidden rounded-[26px] border border-white/85 bg-white shadow-[0_20px_50px_rgba(24,32,54,0.08)] sm:rounded-[32px]"
            >
              <div className="relative h-44 sm:h-52">
                <Image
                  src={getPublicCourseCover(index)}
                  alt={showcaseCopy?.title ?? course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(24,32,54,0.08)_0%,_rgba(24,32,54,0.74)_100%)]" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                  <span className="rounded-full bg-white/16 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur sm:text-xs sm:tracking-[0.16em]">
                    {course.lessonCount} уроков
                  </span>
                  <span className="rounded-full bg-white/16 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur sm:text-xs sm:tracking-[0.16em]">
                    {course.priceLabel}
                  </span>
                </div>
              </div>

              <div className="space-y-3 p-5 sm:space-y-4 sm:p-6">
                <h3 className="text-xl font-semibold leading-[1.05] tracking-tight text-[#182036] sm:text-2xl">
                  {showcaseCopy?.title ?? course.title}
                </h3>
                <p className="text-sm leading-6 text-[#5f6982] sm:leading-7">
                  {showcaseCopy?.description ?? course.description}
                </p>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#182036] transition hover:text-[#2650d8]"
                >
                  Смотреть программу
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
            );
          })}
        </div>
      </section>

      <section id="faq" className="space-y-6 border-t border-black/5 pt-6 sm:space-y-8 sm:pt-8">
        <SectionLead
          eyebrow="FAQ"
          title="Ответы на вопросы перед следующим шагом"
          text="Оставили только те ответы, которые помогают быстрее решиться: ученику — начать обучение, автору — понять формат размещения."
        />

        <div className="inline-flex rounded-full border border-[#d6dbee] bg-white/85 p-1 shadow-[0_12px_26px_rgba(24,32,54,0.06)]">
          {([
            { value: "learn", label: "Ученику" },
            { value: "author", label: "Автору" },
          ] as const).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleRoleChange(item.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5",
                role === item.value
                  ? "bg-[linear-gradient(135deg,_#2650d8_0%,_#4f6ff0_55%,_#7893ff_100%)] text-white shadow-[0_16px_34px_rgba(38,80,216,0.2)]"
                  : "text-[#5f6982] hover:text-[#182036]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {activeCopy.faq.map((item) => (
            <details
              key={item.question}
              className="group rounded-[24px] border border-white/85 bg-white p-5 shadow-[0_16px_36px_rgba(24,32,54,0.06)]"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                <span className="text-lg font-semibold leading-snug text-[#182036]">
                  {item.question}
                </span>
                <ChevronDown className="mt-1 h-5 w-5 flex-none text-[#5f6982] transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5f6982]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-black/5 pt-6 sm:pt-8">
        <div className="rounded-[26px] bg-[linear-gradient(135deg,_#182036_0%,_#2442ac_52%,_#f08f68_100%)] p-5 text-white shadow-[0_28px_75px_rgba(24,32,54,0.2)] sm:rounded-[34px] sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60 sm:text-xs sm:tracking-[0.34em]">
                Готовы начать?
              </p>
              <h2 className="max-w-[15ch] font-[family:var(--font-landing-display)] text-[clamp(1.95rem,6vw,3.6rem)] font-semibold leading-[0.96] tracking-tight">
                Выбери курс — или подай заявку на размещение программы
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/82 sm:text-base sm:leading-8">
                Зайди в каталог, посмотри форматы и начни с того, что даст результат уже в ближайшей сделке.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              <PublicButton href="/catalog" tone="ghost">
                Перейти в каталог
              </PublicButton>
              <PublicButton href="/sign-in?role=author" tone="secondary">
                Стать автором
              </PublicButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
