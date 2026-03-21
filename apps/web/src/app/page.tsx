import { auth } from "@academy/auth";
import { Manrope, Rubik } from "next/font/google";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  LayoutTemplate,
  MonitorPlay,
  PlayCircle,
  Search,
  Sparkles,
  UploadCloud,
  Video,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";

const display = Rubik({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-landing-display",
});

const body = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-landing-body",
});

const platformModes = [
  {
    title: "Учиться",
    description:
      "Проходить модули, смотреть видео, отмечать прогресс и возвращаться к материалам из личного кабинета.",
    icon: GraduationCap,
    accent: "from-[#fff1c7] to-[#ffe2a8]",
  },
  {
    title: "Запускать свои курсы",
    description:
      "Собирать программу, загружать уроки, настраивать цену и продавать доступ через единый каталог.",
    icon: UploadCloud,
    accent: "from-[#d8ecff] to-[#b9dcff]",
  },
  {
    title: "Проводить вебинары",
    description:
      "Использовать платформу как учебную площадку для эфиров, встреч с группой и сопровождения учеников.",
    icon: Video,
    accent: "from-[#ffe0db] to-[#ffc5ba]",
  },
];

const featuredCourses = [
  {
    title: "Старт в профессии риэлтора",
    meta: "12 уроков • практика с клиентом",
    price: "4 900 ₽",
    accent: "from-[#1f3cff] via-[#5f6cff] to-[#9da7ff]",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Сильные продажи объектов",
    meta: "9 уроков • скрипты и переговоры",
    price: "7 500 ₽",
    accent: "from-[#ff7c5a] via-[#ff9f7d] to-[#ffd1bf]",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Система агентства",
    meta: "15 уроков • управление и команда",
    price: "12 000 ₽",
    accent: "from-[#0f7b6c] via-[#27a694] to-[#a0eadb]",
    image:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
  },
];

const creatorBenefits = [
  "Загружать свои уроки и собирать программу без помощи разработчика.",
  "Продавать доступ к курсам через каталог и checkout-сценарии.",
  "Работать с авторами, кураторами и студентами в одной системе.",
  "Развивать продукт от курсов к вебинарам и сопровождающим форматам.",
];

const webinarHighlights = [
  "Страница вебинара с описанием, таймингом и доступом по роли.",
  "Материалы до и после эфира: файлы, конспекты, домашние задания.",
  "Продажа записи и доступ к повторному просмотру после события.",
];

const testimonials = [
  {
    name: "Анна, руководитель обучения",
    text: "Платформа закрывает сразу три задачи: обучение команды, продажу программ и удобный контроль прогресса.",
  },
  {
    name: "Егор, автор курса",
    text: "Мне важно, что курс можно не просто выложить, а красиво упаковать, продавать и потом расширить до вебинаров.",
  },
  {
    name: "Мария, студент",
    text: "Интерфейс понятный: видно программу, прогресс и следующий урок, к которому нужно перейти.",
  },
];

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

function FeatureCard({ title, description, icon: Icon, accent }: FeatureCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_25px_60px_rgba(28,36,66,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(28,36,66,0.12)]">
      <div
        className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${accent} opacity-80`}
      />
      <div className="relative">
        <div className="inline-flex rounded-2xl bg-white/95 p-3 shadow-sm ring-1 ring-black/5">
          <Icon className="h-5 w-5 text-[#1c2442]" />
        </div>
        <h3 className="mt-14 text-2xl font-semibold text-[#1c2442]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-[#5c6175]">{description}</p>
      </div>
    </article>
  );
}

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  tone?: "default" | "light";
};

function SectionHeader({
  eyebrow,
  title,
  description,
  tone = "default",
}: SectionHeaderProps) {
  return (
    <div className="max-w-3xl space-y-3">
      <p
        className={`text-sm font-semibold uppercase tracking-[0.28em] ${
          tone === "light" ? "text-white/70" : "text-[#58607a]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`font-[family:var(--font-landing-display)] text-4xl font-semibold tracking-tight md:text-5xl ${
          tone === "light" ? "text-white" : "text-[#1c2442]"
        }`}
      >
        {title}
      </h2>
      <p
        className={`text-base leading-8 ${
          tone === "light" ? "text-white/82" : "text-[#5c6175]"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  return (
    <main
      className={`${display.variable} ${body.variable} min-h-screen bg-[linear-gradient(180deg,_#f6f1ff_0%,_#fff7ef_48%,_#eef5ff_100%)] text-[#1c2442]`}
    >
      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[rgba(255,255,255,0.78)] p-4 shadow-[0_40px_120px_rgba(44,40,84,0.12)] backdrop-blur md:p-6">
          <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-[#cfd9ff] blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#ffd9c9] blur-3xl" />

          <div className="relative rounded-[30px] border border-white/80 bg-[#fffdfb] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] md:px-8 md:py-8">
            <header className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c2442] text-lg font-semibold text-white">
                  AR
                </div>
                <div>
                  <p className="font-[family:var(--font-landing-display)] text-xl font-semibold">
                    Академия риэлторов
                  </p>
                  <p className="text-sm text-[#6b7288]">
                    Обучение, продажи курсов и эфиры на одной платформе
                  </p>
                </div>
              </div>

              <nav className="flex flex-wrap items-center gap-2 text-sm text-[#5c6175]">
                <a
                  href="#modes"
                  className="rounded-full px-4 py-2 transition hover:bg-[#f0f3ff] hover:text-[#1c2442]"
                >
                  Возможности
                </a>
                <a
                  href="#courses"
                  className="rounded-full px-4 py-2 transition hover:bg-[#f0f3ff] hover:text-[#1c2442]"
                >
                  Курсы
                </a>
                <a
                  href="#creators"
                  className="rounded-full px-4 py-2 transition hover:bg-[#f0f3ff] hover:text-[#1c2442]"
                >
                  Авторы
                </a>
                <a
                  href="#webinars"
                  className="rounded-full px-4 py-2 transition hover:bg-[#f0f3ff] hover:text-[#1c2442]"
                >
                  Вебинары
                </a>
              </nav>

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href="/sign-in">Войти</Link>
                </Button>
                <Button asChild>
                  <Link href="/catalog">Смотреть курсы</Link>
                </Button>
              </div>
            </header>

            <div className="grid gap-10 px-1 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe5ff] bg-white px-4 py-2 text-sm text-[#5c6175] shadow-sm">
                  <Sparkles className="h-4 w-4 text-[#ff7c5a]" />
                  Платформа для обучения, запуска курсов и живых эфиров
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-3xl font-[family:var(--font-landing-display)] text-5xl font-semibold leading-[0.95] tracking-tight text-[#1c2442] md:text-7xl">
                    Учиться, публиковать свои курсы и проводить вебинары в одном месте.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-[#5c6175]">
                    Платформа помогает не только проходить обучение, но и
                    загружать собственные программы, продавать доступ к ним и
                    использовать кабинет как базу для вебинаров и сопровождения
                    учеников.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/catalog">
                      Смотреть каталог
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/sign-in">Открыть платформу</Link>
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm">
                    <p className="text-sm text-[#6b7288]">Форматы</p>
                    <p className="mt-2 text-2xl font-semibold">Курсы + эфиры</p>
                  </div>
                  <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm">
                    <p className="text-sm text-[#6b7288]">Монетизация</p>
                    <p className="mt-2 text-2xl font-semibold">Каталог + checkout</p>
                  </div>
                  <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm">
                    <p className="text-sm text-[#6b7288]">Роли</p>
                    <p className="mt-2 text-2xl font-semibold">Админ, автор, студент</p>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[520px]">
                <div className="absolute inset-0 rounded-[34px] bg-[linear-gradient(145deg,_#2037d2_0%,_#5571ff_38%,_#ff8d6b_100%)] shadow-[0_40px_90px_rgba(59,73,174,0.32)]" />
                <div className="absolute inset-5 rounded-[28px] border border-white/25 bg-[rgba(255,255,255,0.1)] backdrop-blur-sm" />

                <div className="absolute left-12 top-28 overflow-hidden rounded-[28px] border border-white/30 shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=900&q=80"
                    alt="Автор курса с планшетом"
                    width={260}
                    height={320}
                    className="h-[210px] w-[160px] object-cover md:h-[300px] md:w-[220px]"
                  />
                </div>

                <div className="absolute bottom-24 right-12 overflow-hidden rounded-[28px] border border-white/30 shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"
                    alt="Рабочее место для онлайн-обучения"
                    width={280}
                    height={220}
                    className="h-[150px] w-[200px] object-cover md:h-[190px] md:w-[250px]"
                  />
                </div>

                <div className="absolute left-6 top-6 rounded-[22px] bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#eef2ff] p-3">
                      <BookOpenText className="h-5 w-5 text-[#2037d2]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7288]">Готовые продукты</p>
                      <p className="font-semibold">Курсы и траектории</p>
                    </div>
                  </div>
                </div>

                <div className="absolute right-6 top-20 rounded-[22px] bg-[#fff7f1] p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-3">
                      <WalletCards className="h-5 w-5 text-[#ff7c5a]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#7a6a61]">Продажи</p>
                      <p className="font-semibold text-[#1c2442]">Каталог и checkout</p>
                    </div>
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2 flex h-72 w-72 -translate-x-1/2 -translate-y-1/2 flex-col justify-between rounded-[36px] border border-white/30 bg-[linear-gradient(180deg,_rgba(255,255,255,0.18)_0%,_rgba(255,255,255,0.06)_100%)] p-6 shadow-[0_24px_60px_rgba(14,23,83,0.35)] backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-white/20 p-3">
                      <MonitorPlay className="h-6 w-6 text-white" />
                    </div>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
                      live + course
                    </span>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-white/75">
                      Сценарии платформы
                    </p>
                    <p className="mt-3 font-[family:var(--font-landing-display)] text-4xl font-semibold leading-none text-white">
                      От лендинга курса до вебинарной комнаты.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/15 p-4 text-white">
                      <p className="text-sm text-white/70">Студенты</p>
                      <p className="mt-2 text-xl font-semibold">Личный кабинет</p>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-4 text-white">
                      <p className="text-sm text-white/70">Авторы</p>
                      <p className="mt-2 text-xl font-semibold">Загрузка и продажи</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-8 max-w-[250px] rounded-[22px] bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#eef8f5] p-3">
                      <CalendarDays className="h-5 w-5 text-[#0f7b6c]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7288]">Вебинары</p>
                      <p className="font-semibold">События и записи</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 right-8 rounded-[22px] bg-[#1c2442] px-4 py-3 text-white shadow-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <PlayCircle className="h-4 w-4" />
                    Комната эфира открыта
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-black/5 bg-[linear-gradient(90deg,_#2439d0_0%,_#5970ff_48%,_#ff8f6d_100%)] p-4 text-white md:grid-cols-4">
              {[
                "Каталог курсов",
                "Кабинет студента",
                "Загрузка своего контента",
                "Сценарии для вебинаров",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-medium"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="modes" className="mt-12 space-y-8">
          <SectionHeader
            eyebrow="Возможности платформы"
            title="Один продукт под три сценария роста."
            description="Система должна быть полезна и ученику, и автору курса, и команде, которая развивает академию как бизнес."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {platformModes.map((mode) => (
              <FeatureCard key={mode.title} {...mode} />
            ))}
          </div>
        </section>

        <section
          id="courses"
          className="mt-12 grid gap-8 rounded-[36px] border border-white/70 bg-[rgba(255,255,255,0.72)] p-6 shadow-[0_35px_100px_rgba(44,40,84,0.08)] backdrop-blur md:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow="Каталог"
              title="Курсы можно красиво упаковать и сразу продавать."
              description="Каталог помогает показать программу, ценность и стоимость курса так, чтобы он выглядел как полноценный цифровой продукт."
            />

            <div className="flex min-w-[280px] items-center gap-3 rounded-full border border-black/5 bg-white px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-[#6b7288]" />
              <span className="text-sm text-[#6b7288]">
                Поиск по направлениям, авторам и программам
              </span>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <article
                key={course.title}
                className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_20px_50px_rgba(28,36,66,0.08)]"
              >
                <div className="relative h-48 overflow-hidden p-5">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${course.accent} opacity-70`} />
                  <div className="relative flex h-full items-end justify-between">
                    <div className="rounded-2xl bg-white/15 px-3 py-2 text-sm font-medium text-white backdrop-blur">
                      Премиальный курс
                    </div>
                    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                      <LayoutTemplate className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xl font-semibold text-[#1c2442]">
                      {course.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#5c6175]">
                      {course.meta}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-semibold text-[#1c2442]">
                      {course.price}
                    </p>
                    <Link
                      href="/catalog"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#1c2442]"
                    >
                      В каталог
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article
            id="creators"
            className="overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(160deg,_#1c2442_0%,_#29356b_58%,_#4353a1_100%)] p-6 text-white shadow-[0_40px_100px_rgba(23,30,70,0.22)]"
          >
            <SectionHeader
              eyebrow="Для авторов"
              title="Загружайте свои программы и превращайте их в продукт."
              description="Платформа должна быть удобной не только для студентов, но и для автора, который хочет быстро запустить курс и начать продажи."
              tone="light"
            />

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                {creatorBenefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 p-4"
                  >
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-[#ffd6b7]" />
                    <p className="text-sm leading-7 text-white/82">{benefit}</p>
                  </div>
                ))}
              </div>

              <div className="relative min-h-[320px] rounded-[28px] bg-[linear-gradient(180deg,_rgba(255,255,255,0.12)_0%,_rgba(255,255,255,0.06)_100%)] p-5 backdrop-blur">
                <div className="absolute left-5 top-5 rounded-2xl bg-white px-4 py-3 text-[#1c2442] shadow-xl">
                  <p className="text-sm text-[#6b7288]">Кабинет автора</p>
                  <p className="font-semibold">Редактор программы</p>
                </div>
                <div className="absolute right-5 top-20 overflow-hidden rounded-[28px] border border-white/15 shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80"
                    alt="Автор онлайн-курса"
                    width={320}
                    height={380}
                    className="h-[180px] w-[160px] object-cover md:h-[220px] md:w-[200px]"
                  />
                </div>
                <div className="absolute bottom-5 left-5 right-5 space-y-3">
                  <div className="rounded-2xl bg-white p-4 text-[#1c2442] shadow-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Курс: Система агентства</p>
                      <BriefcaseBusiness className="h-4 w-4 text-[#4353a1]" />
                    </div>
                    <p className="mt-2 text-sm text-[#6b7288]">
                      Модули, уроки, цена, доступы, кураторы
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 p-4 text-white">
                      <p className="text-sm text-white/70">Продажи</p>
                      <p className="mt-2 text-xl font-semibold">Каталог + checkout</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 text-white">
                      <p className="text-sm text-white/70">Команда</p>
                      <p className="mt-2 text-xl font-semibold">Авторы и кураторы</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article
            id="webinars"
            className="overflow-hidden rounded-[34px] border border-white/70 bg-white p-6 shadow-[0_35px_100px_rgba(44,40,84,0.1)]"
          >
            <SectionHeader
              eyebrow="Вебинары"
              title="Из курса легко вырасти в живую площадку для эфиров."
              description="Если нужно вести вебинары, запуски, созвоны с группой или платные эфиры, архитектура платформы может поддержать и этот сценарий."
            />

            <div className="mt-8 grid gap-4">
              <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,_#eef4ff_0%,_#fff2eb_100%)] p-5">
                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[24px] border border-white/70 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6b7288]">
                        Live room
                      </p>
                      <span className="rounded-full bg-[#ffede6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff7c5a]">
                        эфир
                      </span>
                    </div>
                    <div className="mt-5 rounded-[22px] bg-[#1c2442] p-5 text-white">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white/10 p-3">
                          <MonitorPlay className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm text-white/65">Комната трансляции</p>
                          <p className="text-xl font-semibold">
                            Живой урок + чат + материалы
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-[22px]">
                      <Image
                        src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80"
                        alt="Онлайн-вебинар на ноутбуке"
                        width={900}
                        height={560}
                        className="h-44 w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {webinarHighlights.map((item) => (
                      <div
                        key={item}
                        className="rounded-[22px] border border-black/5 bg-white p-4 shadow-sm"
                      >
                        <p className="text-sm leading-7 text-[#5c6175]">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-12 space-y-8">
          <SectionHeader
            eyebrow="Отзывы о сценарии"
            title="Платформа должна выглядеть как продукт, а не как набор служебных экранов."
            description="Визуальная подача важна не только для лендинга, но и для ощущения от всей академии: от первого касания до покупки и обучения."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <article
                key={item.name}
                className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_18px_50px_rgba(28,36,66,0.08)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#2439d0_0%,_#ff8f6d_100%)] text-lg font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1c2442]">{item.name}</p>
                    <p className="text-sm text-[#6b7288]">Сценарий платформы</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-[#5c6175]">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,_#1c2442_0%,_#3146b6_48%,_#ff8f6d_100%)] p-8 text-white shadow-[0_40px_110px_rgba(40,45,102,0.22)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                Следующий шаг
              </p>
              <h2 className="font-[family:var(--font-landing-display)] text-4xl font-semibold tracking-tight md:text-5xl">
                Платформа уже может стать и школой, и витриной курсов, и базой для вебинаров.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-white/82">
                Дальше можно усиливать упаковку, маркетинг, роль авторов и
                сценарии живых запусков, не ломая уже собранную архитектуру.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button
                asChild
                className="bg-white text-[#1c2442] hover:bg-white/90"
              >
                <Link href="/catalog">Открыть каталог</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/sign-in">Войти в платформу</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
