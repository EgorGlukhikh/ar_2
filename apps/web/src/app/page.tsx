import { auth } from "@academy/auth";
import { CourseStatus, prisma } from "@academy/db";
import {
  ArrowUpRight,
  BookOpenText,
  CalendarClock,
  GraduationCap,
  PlayCircle,
  Sparkles,
  Tv,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  MetricChip,
  PublicButton,
  SectionLead,
} from "@/components/marketing/public-primitives";
import {
  getPublicCourseCover,
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";

const audienceCards = [
  {
    eyebrow: "Для новичка",
    title: "Войти в профессию без хаоса из чатов, роликов и случайных советов.",
    text: "Проходи уроки по порядку, возвращайся к записям, забирай шаблоны и собирай свою первую рабочую систему.",
    icon: GraduationCap,
  },
  {
    eyebrow: "Для агента с опытом",
    title: "Закрывать конкретные пробелы: показы, переговоры, сделки и работа с объектом.",
    text: "Можно взять отдельную программу под нужную задачу и быстро освежить тему перед реальной сделкой.",
    icon: BookOpenText,
  },
  {
    eyebrow: "Для автора курса",
    title: "Разместить свой курс и продавать его как понятный продукт, а не набор файлов.",
    text: "Поддерживаются курсы в записи и онлайн-потоки с вебинарами, а после эфира в уроке остается запись и материалы.",
    icon: Tv,
  },
];

const productPoints = [
  "Курсы в записи с видео, текстами, файлами и заданиями.",
  "Онлайн-потоки по расписанию с вебинарами и материалами после эфира.",
  "Бесплатные и платные программы в одном каталоге с понятной покупкой.",
];

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  const [publishedCourses, showcaseCourses] = await Promise.all([
    prisma.course.count({
      where: {
        status: CourseStatus.PUBLISHED,
      },
    }),
    prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 3,
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
              },
            },
          },
        },
        products: {
          where: {
            isActive: true,
          },
          include: {
            prices: {
              where: {
                isDefault: true,
              },
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          take: 1,
        },
      },
    }),
  ]);

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
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
                    Курсы по недвижимости для тех, кто хочет быстрее войти в профессию, усилить практику или разместить свою программу.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                <PublicButton href="/sign-in" tone="secondary">
                  Войти
                </PublicButton>
                <PublicButton href="/catalog">Смотреть курсы</PublicButton>
              </div>
            </header>

            <section className="grid gap-5 py-6 sm:gap-6 sm:py-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
              <div className="space-y-5 sm:space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e2d7c8] bg-[rgba(255,250,241,0.92)] px-3.5 py-2 text-xs font-medium text-[#7a6548] shadow-[0_12px_28px_rgba(24,32,54,0.05)] sm:px-4 sm:text-sm">
                  <Sparkles className="h-4 w-4 text-[#d27d45]" />
                  Обучение и размещение курсов в одном месте
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h1 className="max-w-[11ch] text-balance font-[family:var(--font-landing-display)] text-[clamp(2.2rem,11vw,5.6rem)] font-semibold leading-[0.92] tracking-tight text-[#182036]">
                    Учиться, запускать курс и держать все под рукой.
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-[#5f6982] sm:text-base sm:leading-8 md:text-lg">
                    Если ты агент, здесь можно взять курс по шагам и не распыляться на десятки разрозненных источников. Если ты эксперт или школа, здесь можно собрать программу, назначить цену и открыть продажи в понятном каталоге.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  <PublicButton href="/catalog">Выбрать курс</PublicButton>
                  <PublicButton href="/sign-in" tone="secondary">
                    Разместить свой курс
                  </PublicButton>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricChip label="В каталоге" value={`${publishedCourses} программ`} />
                  <MetricChip label="Форматы" value="Записи и онлайн-потоки" />
                  <MetricChip label="Внутри" value="Уроки, материалы, задания" />
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.03fr_0.97fr]">
                <article className="overflow-hidden rounded-[24px] bg-[linear-gradient(145deg,_#182036_0%,_#2240a3_56%,_#f08f68_100%)] p-5 text-white shadow-[0_28px_72px_rgba(24,32,54,0.22)] sm:rounded-[30px] sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60 sm:text-xs sm:tracking-[0.28em]">
                    Для владельца курса
                  </p>
                  <h2 className="mt-3 max-w-[13ch] font-[family:var(--font-landing-display)] text-[1.95rem] font-semibold leading-[0.94] sm:text-3xl">
                    Запуск курса без лишней техрутины и ручных сборок.
                  </h2>
                  <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                    {productPoints.map((point) => (
                      <div
                        key={point}
                        className="rounded-[18px] border border-white/12 bg-white/10 px-4 py-3 text-sm leading-6 text-white/88"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </article>

                <div className="grid gap-3 sm:gap-4">
                  <article className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,248,239,0.96)] p-5 shadow-[0_20px_45px_rgba(24,32,54,0.1)] sm:rounded-[28px]">
                    <div className="inline-flex rounded-2xl bg-white p-3 text-[#2650d8] shadow-sm">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-[#182036] sm:text-2xl">
                      Курс в записи
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5f6982] sm:leading-7">
                      Видео, тексты, файлы и тесты. Подходит для самостоятельного обучения в удобном темпе.
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
                      Занятия можно привязать ко времени по Москве, а после эфира оставить запись и материалы в этом же уроке.
                    </p>
                  </article>
                </div>
              </div>
            </section>

            <section className="space-y-6 border-t border-black/5 pt-6 sm:space-y-8 sm:pt-8">
              <SectionLead
                eyebrow="Кому подойдет"
                title="С первого экрана должно быть понятно, зачем сюда заходить."
                text="Здесь нет служебных формулировок. Человек сразу видит, что может пройти обучение или разместить собственную программу."
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

            <section className="space-y-6 border-t border-black/5 pt-6 sm:space-y-8 sm:pt-8">
              <SectionLead
                eyebrow="Курсы"
                title="Программа должна сразу объяснять пользу, формат и следующий шаг."
                text="Ниже показываем реальные курсы из каталога. На телефоне карточки стали компактнее и не растягивают страницу пустой высотой."
              />

              <div className="grid gap-4 xl:grid-cols-3 xl:gap-5">
                {showcaseCourses.map((course, index) => {
                  const lessonCount = course.modules.reduce(
                    (sum, module) => sum + module.lessons.length,
                    0,
                  );
                  const defaultPrice = course.products[0]?.prices[0];
                  const priceLabel =
                    defaultPrice && defaultPrice.amount === 0
                      ? "Бесплатно"
                      : defaultPrice
                        ? `${(defaultPrice.amount / 100).toFixed(0)} ₽`
                        : "Цена скоро";

                  return (
                    <article
                      key={course.id}
                      className="overflow-hidden rounded-[26px] border border-white/85 bg-white shadow-[0_20px_50px_rgba(24,32,54,0.08)] sm:rounded-[32px]"
                    >
                      <div className="relative h-44 sm:h-52">
                        <Image
                          src={getPublicCourseCover(index)}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(24,32,54,0.08)_0%,_rgba(24,32,54,0.74)_100%)]" />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                          <span className="rounded-full bg-white/16 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur sm:text-xs sm:tracking-[0.16em]">
                            {lessonCount} уроков
                          </span>
                          <span className="rounded-full bg-white/16 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur sm:text-xs sm:tracking-[0.16em]">
                            {priceLabel}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 p-5 sm:space-y-4 sm:p-6">
                        <h3 className="text-xl font-semibold leading-[1.05] tracking-tight text-[#182036] sm:text-2xl">
                          {course.title}
                        </h3>
                        <p className="text-sm leading-6 text-[#5f6982] sm:leading-7">
                          {course.description ||
                            "Описание курса можно дополнить продающей подводкой и коротким списком результатов."}
                        </p>
                        <Link
                          href="/catalog"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#182036] transition hover:text-[#2650d8]"
                        >
                          Открыть каталог
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="border-t border-black/5 pt-6 sm:pt-8">
              <div className="rounded-[26px] bg-[linear-gradient(135deg,_#182036_0%,_#2442ac_52%,_#f08f68_100%)] p-5 text-white shadow-[0_28px_75px_rgba(24,32,54,0.2)] sm:rounded-[34px] sm:p-8">
                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60 sm:text-xs sm:tracking-[0.34em]">
                      Следующий шаг
                    </p>
                    <h2 className="max-w-[15ch] font-[family:var(--font-landing-display)] text-[clamp(1.95rem,6vw,3.6rem)] font-semibold leading-[0.96] tracking-tight">
                      Выбери курс для себя или размести свою программу.
                    </h2>
                    <p className="max-w-2xl text-sm leading-7 text-white/82 sm:text-base sm:leading-8">
                      Платформа уже готова и для покупателей, и для авторов. Можно зайти в каталог, посмотреть формат обучения и перейти к следующему шагу без лишних экранов.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    <PublicButton href="/catalog" tone="ghost">
                      Перейти в каталог
                    </PublicButton>
                    <PublicButton href="/sign-in" tone="secondary">
                      Открыть кабинет
                    </PublicButton>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
