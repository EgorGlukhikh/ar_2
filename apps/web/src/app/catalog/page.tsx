import { auth } from "@academy/auth";
import {
  CourseDeliveryFormat,
  CourseStatus,
  EnrollmentStatus,
  prisma,
} from "@academy/db";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  PublicButton,
  SectionLead,
  publicBadgeClassName,
  publicButtonClassName,
  publicCardClassName,
  publicIconBoxClassName,
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
import { formatPublicCopy } from "@/lib/public-copy";

const showcaseCopyBySlug: Record<
  string,
  {
    title: string;
    description: string;
    result: string;
  }
> = {
  "ethics-safety-real-estate": {
    title: "Этика и безопасность в недвижимости: fair housing, privacy и доверие",
    description:
      "Как общаться без дискриминации, защищать данные клиента и безопасно проводить показы.",
    result: "Снижаешь риски в работе с клиентом и увереннее ведёшь показы.",
  },
  "buyer-deal-finance-closing": {
    title: "Сделка с покупателем: финансирование, inspection и closing",
    description:
      "Ведение покупателя от бюджета и buyer agreement до инспекции, оффера и финального закрытия.",
    result: "Лучше контролируешь путь покупателя от первого разговора до сделки.",
  },
  "seller-listing-system": {
    title: "Листинг продавца: подготовка объекта, показы и multiple offers",
    description:
      "Путь продавца от постановки объекта в работу до показов, безопасности собственника и разбора офферов.",
    result: "Строишь понятный маршрут сделки продавца без хаоса и потерь по ходу.",
  },
  "rieltor-client-intake": {
    title: "Первые 10 дней риэлтора: бриф клиента и маршрут сделки",
    description:
      "Как провести первый контакт, собрать рабочий бриф и не потерять клиента между звонком, показами и оффером.",
    result: "Быстрее входишь в профессию и собираешь рабочую систему на старте.",
  },
};

const trustPoints = [
  "Есть бесплатные и платные программы под разные этапы работы.",
  "Внутри не только видео: материалы, задания и рабочие шаблоны по теме.",
  "Курс можно открыть под конкретную задачу сделки, а не ради общей теории.",
];

type CatalogPageCourse = Awaited<ReturnType<typeof getCourses>>[number];

async function getCourses(userId?: string) {
  return prisma.course.findMany({
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
      enrollments: userId
        ? {
            where: {
              userId,
              status: {
                not: EnrollmentStatus.CANCELED,
              },
            },
            take: 1,
          }
        : false,
    },
  });
}

function CourseAction({
  course,
  isFreeCourse,
  hasAccess,
}: {
  course: CatalogPageCourse;
  isFreeCourse: boolean;
  hasAccess: boolean;
}) {
  const defaultProduct = course.products[0];
  const actionLabel = hasAccess
    ? "Перейти к курсу"
    : isFreeCourse
      ? "Получить доступ"
      : "Оформить доступ";

  if (hasAccess) {
    return (
      <PublicButton href={`/learning/courses/${course.id}`} className="w-full justify-center sm:w-auto">
        {formatPublicCopy(actionLabel)}
      </PublicButton>
    );
  }

  if (!defaultProduct) {
    return (
      <button
        type="button"
        disabled
        className={`${publicButtonClassName("secondary")} w-full justify-center sm:w-auto`}
      >
        {formatPublicCopy("Цена не настроена")}
      </button>
    );
  }

  return (
    <form action={startDemoCheckout} className="w-full sm:w-auto">
      <input type="hidden" name="courseId" value={course.id} />
      <button type="submit" className={`${publicButtonClassName("primary")} w-full justify-center`}>
        {formatPublicCopy(actionLabel)}
      </button>
    </form>
  );
}

export default async function CatalogPage() {
  const session = await auth();
  const courses = await getCourses(session?.user?.id);
  const featuredCourse = courses[0] ?? null;

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <header className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.9)] px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur md:px-6">
              <div className="flex min-h-20 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[var(--foreground)] text-sm font-semibold text-white">
                    AR
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatPublicCopy("Каталог курсов")}
                    </p>
                    <p className="max-w-[560px] text-sm leading-6 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Выбирай программу под задачу сделки: старт в профессии, работа с продавцом, путь покупателя, переговоры, безопасность и документы.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <PublicButton href="/" tone="secondary">
                    {formatPublicCopy("На главную")}
                  </PublicButton>
                  {session?.user ? (
                    <PublicButton href="/after-sign-in">
                      {formatPublicCopy("В кабинет")}
                    </PublicButton>
                  ) : (
                    <PublicButton href="/sign-in">
                      {formatPublicCopy("Войти")}
                    </PublicButton>
                  )}
                </div>
              </div>
            </header>

            <section className="grid gap-8 xl:grid-cols-[0.94fr_1.06fr]">
              <div className="space-y-8">
                <SectionLead
                  eyebrow="Подбор курса"
                  title="Открыл каталог, увидел свою задачу и понял следующий шаг"
                  text="Здесь сразу видно, какой формат у программы, сколько внутри уроков, есть ли бесплатный вход и чем она поможет в реальной работе."
                />

                <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                  {[
                    {
                      icon: PlayCircle,
                      label: "Форматы",
                      value: "Записи и онлайн-потоки",
                    },
                    {
                      icon: BookOpen,
                      label: "Внутри",
                      value: "Уроки, материалы и задания",
                    },
                    {
                      icon: CalendarClock,
                      label: "Доступ",
                      value: "Бесплатно и платно",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <article key={item.label} className={publicCardClassName}>
                        <div className={publicIconBoxClassName}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                          {formatPublicCopy(item.label)}
                        </p>
                        <p className="mt-3 text-lg font-semibold leading-7 text-[var(--foreground)]">
                          {formatPublicCopy(item.value)}
                        </p>
                      </article>
                    );
                  })}
                </div>

                <div className="grid gap-4">
                  {trustPoints.map((item) => (
                    <article key={item} className={publicCardClassName}>
                      <div className="flex items-start gap-3">
                        <div className={cn(publicIconBoxClassName, "h-10 w-10 rounded-[12px]")}>
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <p className="text-sm leading-6 text-[var(--foreground)]">
                          {formatPublicCopy(item)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                {featuredCourse ? (
                  <article className={publicCardClassName}>
                    <div className="relative h-60 overflow-hidden rounded-[16px]">
                      <Image
                        src={getPublicCourseCover(0)}
                        alt={showcaseCopyBySlug[featuredCourse.slug]?.title ?? featuredCourse.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.72)_100%)]" />
                    </div>
                    <p className="mt-5 text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                      {formatPublicCopy("Сейчас часто выбирают")}
                    </p>
                    <h2 className="mt-3 text-[32px] font-semibold leading-10 tracking-[-0.02em] text-[var(--foreground)]">
                      {formatPublicCopy(
                        showcaseCopyBySlug[featuredCourse.slug]?.title ?? featuredCourse.title,
                      )}
                    </h2>
                    <p className="mt-3 max-w-[560px] text-base leading-7 text-[var(--muted)]">
                      {formatPublicCopy(
                        showcaseCopyBySlug[featuredCourse.slug]?.description ??
                          featuredCourse.description ??
                          "Короткая программа с понятным результатом для работы риэлтора.",
                      )}
                    </p>
                  </article>
                ) : null}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {courses.length === 0 ? (
                  <article className={`${publicCardClassName} md:col-span-2`}>
                    <h2 className="text-[32px] font-semibold leading-10 tracking-[-0.02em] text-[var(--foreground)]">
                      {formatPublicCopy("Пока нет опубликованных курсов")}
                    </h2>
                    <p className="mt-4 max-w-[560px] text-base leading-7 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Как только программа будет опубликована, она появится здесь как часть публичного каталога.",
                      )}
                    </p>
                    <div className="mt-6">
                      <PublicButton href="/sign-in">
                        {formatPublicCopy("Открыть платформу")}
                      </PublicButton>
                    </div>
                  </article>
                ) : (
                  courses.map((course, index) => {
                    const defaultPrice = course.products[0]?.prices[0];
                    const isFreeCourse = Boolean(defaultPrice && defaultPrice.amount === 0);
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
                    const copy = showcaseCopyBySlug[course.slug];

                    return (
                      <article id={course.slug} key={course.id} className={publicCardClassName}>
                        <div className="relative h-48 overflow-hidden rounded-[16px]">
                          <Image
                            src={getPublicCourseCover(index + 1)}
                            alt={copy?.title ?? course.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <span className={publicBadgeClassName}>
                            {formatPublicCopy(`${lessonCount} уроков`)}
                          </span>
                          <span className={publicBadgeClassName}>
                            {formatPublicCopy(formatLabel)}
                          </span>
                        </div>

                        <h2 className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
                          {formatPublicCopy(copy?.title ?? course.title)}
                        </h2>
                        <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                          {formatPublicCopy(
                            copy?.description ??
                              course.description ??
                              "Короткая программа с понятным результатом для работы риэлтора.",
                          )}
                        </p>

                        <div className="mt-5 rounded-[16px] bg-[var(--surface-strong)] p-4">
                          <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                            {formatPublicCopy("Что получишь")}
                          </p>
                          <p className="mt-3 text-base leading-7 text-[var(--foreground)]">
                            {formatPublicCopy(
                              copy?.result ?? "Понятный следующий шаг в работе по этой теме.",
                            )}
                          </p>
                        </div>

                        <div className="mt-4 rounded-[16px] bg-[var(--surface-strong)] p-4">
                          <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                            {formatPublicCopy("Стоимость")}
                          </p>
                          <p className="mt-3 text-[28px] font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
                            {defaultPrice
                              ? isFreeCourse
                                ? formatPublicCopy("Бесплатно")
                                : formatMinorUnits(defaultPrice.amount, defaultPrice.currency)
                              : formatPublicCopy("Цена скоро")}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                          <CourseAction
                            course={course}
                            isFreeCourse={isFreeCourse}
                            hasAccess={hasAccess}
                          />

                          <Link
                            href={session?.user ? "/learning" : "/sign-in"}
                            className={`${publicButtonClassName("secondary")} justify-center sm:w-auto`}
                          >
                            {formatPublicCopy(session?.user ? "Открыть кабинет" : "Войти")}
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </div>

                        <Link
                          href={hasAccess ? `/learning/courses/${course.id}` : "/catalog"}
                          className="mt-5 inline-flex items-center gap-2 text-base font-medium text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
                        >
                          {formatPublicCopy("Смотреть программу")}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
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

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
