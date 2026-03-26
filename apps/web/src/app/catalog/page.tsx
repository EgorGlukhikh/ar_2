import { auth } from "@academy/auth";
import {
  CourseDeliveryFormat,
  CourseStatus,
  EnrollmentStatus,
  prisma,
} from "@academy/db";
import {
  ArrowUpRight,
  BookOpenText,
  CalendarClock,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  PublicButton,
  SectionLead,
} from "@/components/marketing/public-primitives";
import { startDemoCheckout } from "@/features/billing/actions";
import {
  getPublicCourseCover,
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";
import { formatMinorUnits } from "@/lib/money";

const showcaseCopyBySlug: Record<
  string,
  {
    title: string;
    description: string;
    result: string;
  }
> = {
  "ethics-safety-real-estate": {
    title:
      "Этика и безопасность в недвижимости: fair housing, privacy и доверие",
    description:
      "Как общаться без дискриминации, защищать данные клиента и безопасно проводить показы.",
    result: "Снижаешь риски в работе с клиентом и увереннее ведешь показы.",
  },
  "buyer-deal-finance-closing": {
    title:
      "Сделка с покупателем: финансирование, inspection и closing",
    description:
      "Ведение покупателя от бюджета и buyer agreement до инспекции, оффера и финального закрытия.",
    result: "Лучше контролируешь путь покупателя от первого разговора до closing.",
  },
  "seller-listing-system": {
    title:
      "Листинг продавца: подготовка объекта, показы и multiple offers",
    description:
      "Путь продавца от постановки объекта в работу до показов, безопасности собственника и разбора офферов.",
    result: "Строишь понятный маршрут сделки продавца без хаоса и потерь по ходу.",
  },
  "rieltor-client-intake": {
    title:
      "Первые 10 дней риэлтора: бриф клиента и маршрут сделки",
    description:
      "Как провести первый контакт, собрать рабочий бриф и не потерять клиента между звонком, показами и оффером.",
    result: "Быстрее входишь в профессию и собираешь рабочую систему на старте.",
  },
};

const trustPoints = [
  "Есть бесплатные и платные программы под разные этапы работы.",
  "Внутри не только видео: материалы, задания и рабочие шаблоны по теме.",
  "Курс можно открыть под конкретную задачу сделки, а не ради «общей теории».",
];

export default async function CatalogPage() {
  const session = await auth();

  const courses = await prisma.course.findMany({
    where: {
      status: CourseStatus.PUBLISHED,
    },
    orderBy: {
      updatedAt: "desc",
    },
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
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        take: 1,
      },
      enrollments: session?.user
        ? {
            where: {
              userId: session.user.id,
              status: {
                not: EnrollmentStatus.CANCELED,
              },
            },
            take: 1,
          }
        : false,
    },
  });

  const featuredCourse = courses[0] ?? null;

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
                    Каталог курсов
                  </p>
                  <p className="max-w-xl text-sm leading-6 text-[#5f6982]">
                    Выбирай программу под задачу сделки: старт в профессии,
                    работа с продавцом, путь покупателя, переговоры,
                    безопасность и документы.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                <PublicButton href="/" tone="secondary">
                  На главную
                </PublicButton>
                {session?.user ? (
                  <PublicButton href="/after-sign-in">В кабинет</PublicButton>
                ) : (
                  <PublicButton href="/sign-in">Войти</PublicButton>
                )}
              </div>
            </header>

            <section className="grid gap-5 py-6 sm:gap-6 sm:py-8 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-5 sm:space-y-6">
                <SectionLead
                  eyebrow="Подбор курса"
                  title="Открыл каталог, увидел свою задачу, понял следующий шаг"
                  text="Здесь сразу видно, какой формат у программы, сколько внутри уроков, есть ли бесплатный вход и чему она поможет в реальной работе."
                />

                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <article className="rounded-[24px] border border-white/85 bg-white p-4 shadow-[0_16px_36px_rgba(24,32,54,0.07)] sm:rounded-[28px] sm:p-5">
                    <PlayCircle className="h-5 w-5 text-[#2650d8]" />
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a6548] sm:mt-4 sm:text-xs sm:tracking-[0.24em]">
                      Форматы
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#182036] sm:mt-3 sm:text-xl">
                      Записи и онлайн-потоки
                    </p>
                  </article>

                  <article className="rounded-[24px] border border-white/85 bg-white p-4 shadow-[0_16px_36px_rgba(24,32,54,0.07)] sm:rounded-[28px] sm:p-5">
                    <BookOpenText className="h-5 w-5 text-[#2650d8]" />
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a6548] sm:mt-4 sm:text-xs sm:tracking-[0.24em]">
                      Внутри
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#182036] sm:mt-3 sm:text-xl">
                      Уроки, материалы, задания
                    </p>
                  </article>

                  <article className="rounded-[24px] border border-white/85 bg-white p-4 shadow-[0_16px_36px_rgba(24,32,54,0.07)] sm:rounded-[28px] sm:p-5">
                    <CalendarClock className="h-5 w-5 text-[#2650d8]" />
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a6548] sm:mt-4 sm:text-xs sm:tracking-[0.24em]">
                      Доступ
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#182036] sm:mt-3 sm:text-xl">
                      Бесплатно и платно
                    </p>
                  </article>
                </div>

                <div className="grid gap-3">
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
                </div>

                {featuredCourse ? (
                  <article className="overflow-hidden rounded-[26px] border border-white/85 bg-white shadow-[0_20px_50px_rgba(24,32,54,0.08)] sm:rounded-[32px]">
                    <div className="relative h-48 sm:h-60">
                      <Image
                        src={getPublicCourseCover(0)}
                        alt={
                          showcaseCopyBySlug[featuredCourse.slug]?.title ??
                          featuredCourse.title
                        }
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(24,32,54,0.08)_0%,_rgba(24,32,54,0.76)_100%)]" />
                    </div>

                    <div className="space-y-3 p-5 sm:space-y-4 sm:p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a6548] sm:text-xs sm:tracking-[0.24em]">
                        Сейчас часто выбирают
                      </p>
                      <h2 className="font-[family:var(--font-landing-display)] text-[2rem] font-semibold leading-[0.96] tracking-tight text-[#182036] sm:text-4xl">
                        {showcaseCopyBySlug[featuredCourse.slug]?.title ??
                          featuredCourse.title}
                      </h2>
                      <p className="text-sm leading-7 text-[#5f6982]">
                        {showcaseCopyBySlug[featuredCourse.slug]?.description ??
                          featuredCourse.description ??
                          "Короткая программа с понятным результатом для работы риэлтора."}
                      </p>
                    </div>
                  </article>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2 md:gap-5">
                {courses.length === 0 ? (
                  <article className="rounded-[26px] border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.9)] p-6 shadow-[0_16px_40px_rgba(24,32,54,0.05)] md:col-span-2 sm:rounded-[30px] sm:p-8">
                    <h2 className="text-2xl font-semibold text-[#182036]">
                      Пока нет опубликованных курсов
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f6982]">
                      Как только программа будет опубликована, она появится
                      здесь как часть публичного каталога.
                    </p>
                    <div className="mt-6">
                      <PublicButton href="/sign-in">
                        Открыть платформу
                      </PublicButton>
                    </div>
                  </article>
                ) : (
                  courses.map((course, index) => {
                    const defaultProduct = course.products[0];
                    const defaultPrice = defaultProduct?.prices[0];
                    const isFreeCourse = Boolean(
                      defaultPrice && defaultPrice.amount === 0,
                    );
                    const lessonCount = course.modules.reduce(
                      (sum, module) => sum + module.lessons.length,
                      0,
                    );
                    const hasAccess = Array.isArray(course.enrollments)
                      ? course.enrollments.length > 0
                      : false;
                    const formatLabel =
                      course.deliveryFormat === CourseDeliveryFormat.LIVE_COHORT
                        ? "Онлайн-поток"
                        : "Курс в записи";
                    const showcaseCopy = showcaseCopyBySlug[course.slug];

                    return (
                      <article
                        key={course.id}
                        className="overflow-hidden rounded-[26px] border border-white/85 bg-white shadow-[0_20px_50px_rgba(24,32,54,0.08)] sm:rounded-[32px]"
                      >
                        <div className="relative h-44 sm:h-48">
                          <Image
                            src={getPublicCourseCover(index + 1)}
                            alt={showcaseCopy?.title ?? course.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(24,32,54,0.06)_0%,_rgba(24,32,54,0.7)_100%)]" />
                          <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                            <div className="rounded-full bg-white/16 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur sm:text-xs sm:tracking-[0.16em]">
                              {lessonCount} уроков
                            </div>
                            <div className="rounded-full bg-white/16 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur sm:text-xs sm:tracking-[0.16em]">
                              {formatLabel}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 p-5 sm:space-y-5 sm:p-6">
                          <div>
                            <h2 className="text-xl font-semibold leading-[1.05] tracking-tight text-[#182036] sm:text-2xl">
                              {showcaseCopy?.title ?? course.title}
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-[#5f6982]">
                              {showcaseCopy?.description ??
                                course.description ??
                                "Короткая программа с понятным результатом для работы риэлтора."}
                            </p>
                          </div>

                          <div className="rounded-[22px] bg-[linear-gradient(180deg,_#f6efe7_0%,_#eef2ff_100%)] p-4 sm:rounded-[26px] sm:p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a6548] sm:text-xs sm:tracking-[0.24em]">
                              Что получишь
                            </p>
                            <p className="mt-2 text-sm font-medium leading-6 text-[#182036] sm:mt-3 sm:text-base sm:leading-7">
                              {showcaseCopy?.result ??
                                "Понятный следующий шаг в работе по этой теме."}
                            </p>
                          </div>

                          <div className="rounded-[22px] bg-[linear-gradient(180deg,_#f6efe7_0%,_#eef2ff_100%)] p-4 sm:rounded-[26px] sm:p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a6548] sm:text-xs sm:tracking-[0.24em]">
                              Стоимость
                            </p>
                            <p className="mt-2 text-[1.8rem] font-semibold tracking-tight text-[#182036] sm:mt-3 sm:text-3xl">
                              {defaultPrice
                                ? isFreeCourse
                                  ? "Бесплатно"
                                  : formatMinorUnits(
                                      defaultPrice.amount,
                                      defaultPrice.currency,
                                    )
                                : "Цена скоро"}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2.5 sm:gap-3">
                            {hasAccess ? (
                              <PublicButton href={`/learning/courses/${course.id}`}>
                                Перейти к курсу
                              </PublicButton>
                            ) : defaultProduct && defaultPrice ? (
                              <form action={startDemoCheckout} className="contents">
                                <input
                                  type="hidden"
                                  name="courseId"
                                  value={course.id}
                                />
                                <button
                                  type="submit"
                                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#2650d8_0%,_#4f6ff0_55%,_#7893ff_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(38,80,216,0.24)] transition hover:-translate-y-[1px] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2650d8] focus-visible:ring-offset-2 sm:min-h-12 sm:px-6 sm:py-3 [&_svg]:text-current"
                                >
                                  {isFreeCourse
                                    ? "Получить доступ"
                                    : "Оформить доступ"}
                                </button>
                              </form>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7dbe6] bg-white px-5 py-2.5 text-sm font-semibold text-[#9aa3b4] sm:min-h-12 sm:px-6 sm:py-3"
                              >
                                Цена не настроена
                              </button>
                            )}

                            <Link
                              href={session?.user ? "/learning" : "/sign-in"}
                              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#cfd7e8] bg-[rgba(255,255,255,0.92)] px-5 py-2.5 text-sm font-semibold text-[#182036] shadow-[0_10px_24px_rgba(24,32,54,0.06)] transition hover:-translate-y-[1px] hover:border-[#2650d8] hover:text-[#2650d8] sm:min-h-12 sm:px-6 sm:py-3 [&_svg]:text-current"
                            >
                              {session?.user ? "Открыть кабинет" : "Войти"}
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
