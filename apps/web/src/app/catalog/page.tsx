import { auth } from "@academy/auth";
import { CourseStatus, EnrollmentStatus, prisma } from "@academy/db";
import {
  ArrowUpRight,
  BookOpenText,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PublicButton, SectionLead } from "@/components/marketing/public-primitives";
import { startDemoCheckout } from "@/features/billing/actions";
import { courseStatusLabelMap } from "@/lib/labels";
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
            <header className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,_#182036_0%,_#2c4279_100%)] text-sm font-semibold text-white shadow-[0_16px_34px_rgba(24,32,54,0.2)]">
                  AR
                </div>
                <div>
                  <p className="font-[family:var(--font-landing-display)] text-lg font-semibold text-[#182036]">
                    Каталог курсов
                  </p>
                  <p className="max-w-sm text-sm leading-6 text-[#5f6982]">
                    Публичная витрина программ академии с бесплатным и платным доступом.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
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

            <section className="grid gap-8 py-10 xl:grid-cols-[0.86fr_1.14fr]">
              <div className="space-y-8">
                <SectionLead
                  eyebrow="Витрина"
                  title="Курс здесь должен смотреться как сильный продукт, а не как запись в таблице."
                  text="Каталог уже работает на реальных данных. Поэтому визуальная упаковка сразу проверяет, насколько уверенно проект будет выглядеть для автора и конечного покупателя."
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: BookOpenText,
                      label: "Опубликовано",
                      value: `${courses.length} программ`,
                    },
                    {
                      icon: WalletCards,
                      label: "Монетизация",
                      value: "Бесплатно и платно",
                    },
                    {
                      icon: ShieldCheck,
                      label: "После оплаты",
                      value: "Автодоступ в кабинет",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <article
                        key={item.label}
                        className="rounded-[28px] border border-white/85 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97)_0%,_rgba(249,250,253,0.94)_100%)] p-5 shadow-[0_18px_50px_rgba(24,32,54,0.07)]"
                      >
                        <div className="inline-flex rounded-[18px] bg-[linear-gradient(135deg,_rgba(38,80,216,0.16)_0%,_rgba(79,111,240,0.08)_100%)] p-3">
                          <Icon className="h-5 w-5 text-[#2650d8]" />
                        </div>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#7a6548]">
                          {item.label}
                        </p>
                        <p className="mt-3 text-xl font-semibold leading-tight text-[#182036]">
                          {item.value}
                        </p>
                      </article>
                    );
                  })}
                </div>

                {featuredCourse ? (
                  <article className="overflow-hidden rounded-[34px] border border-white/85 bg-white shadow-[0_28px_80px_rgba(24,32,54,0.08)]">
                    <div className="relative h-72">
                      <Image
                        src={getPublicCourseCover(0)}
                        alt={featuredCourse.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(24,32,54,0.06)_0%,_rgba(24,32,54,0.76)_100%)]" />
                      <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
                        <Sparkles className="h-4 w-4 text-[#ffd7b5]" />
                        Рекомендуем
                      </div>
                    </div>

                    <div className="space-y-4 p-6 md:p-7">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#edf2ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2650d8]">
                          {courseStatusLabelMap[featuredCourse.status]}
                        </span>
                        <span className="rounded-full bg-[#f5efe7] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a6548]">
                          {featuredCourse.modules.reduce(
                            (sum, module) => sum + module.lessons.length,
                            0,
                          )}{" "}
                          уроков
                        </span>
                      </div>

                      <h2 className="font-[family:var(--font-landing-display)] text-4xl font-semibold leading-[0.96] tracking-tight text-[#182036]">
                        {featuredCourse.title}
                      </h2>
                      <p className="max-w-3xl text-sm leading-8 text-[#5f6982]">
                        {featuredCourse.description || "Описание курса будет добавлено в следующем проходе."}
                      </p>
                    </div>
                  </article>
                ) : null}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {courses.length === 0 ? (
                  <article className="rounded-[30px] border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.9)] p-8 shadow-[0_18px_50px_rgba(24,32,54,0.05)] md:col-span-2">
                    <h2 className="text-2xl font-semibold text-[#182036]">
                      Пока нет опубликованных курсов
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f6982]">
                      Опубликуй курс и задай ему цену в рабочем контуре. После этого программа
                      автоматически появится здесь как часть публичной витрины.
                    </p>
                    <div className="mt-6">
                      <PublicButton href="/sign-in">Открыть платформу</PublicButton>
                    </div>
                  </article>
                ) : (
                  courses.map((course, index) => {
                    const defaultProduct = course.products[0];
                    const defaultPrice = defaultProduct?.prices[0];
                    const isFreeCourse = Boolean(defaultPrice && defaultPrice.amount === 0);
                    const lessonCount = course.modules.reduce(
                      (sum, module) => sum + module.lessons.length,
                      0,
                    );
                    const hasAccess = Array.isArray(course.enrollments)
                      ? course.enrollments.length > 0
                      : false;

                    return (
                      <article
                        key={course.id}
                        className="overflow-hidden rounded-[32px] border border-white/85 bg-white shadow-[0_22px_60px_rgba(24,32,54,0.08)]"
                      >
                        <div className="relative h-60">
                          <Image
                            src={getPublicCourseCover(index + 1)}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(24,32,54,0.05)_0%,_rgba(24,32,54,0.68)_100%)]" />
                          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/14 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                              {courseStatusLabelMap[course.status]}
                            </span>
                            <span className="rounded-full bg-white/14 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                              {lessonCount} уроков
                            </span>
                          </div>
                        </div>

                        <div className="space-y-5 p-6">
                          <div>
                            <h2 className="text-2xl font-semibold leading-[1.04] tracking-tight text-[#182036]">
                              {course.title}
                            </h2>
                            <p className="mt-2 text-sm text-[#7a6548]">/{course.slug}</p>
                            <p className="mt-4 text-sm leading-7 text-[#5f6982]">
                              {course.description || "Описание курса будет добавлено в следующем проходе."}
                            </p>
                          </div>

                          <div className="rounded-[26px] bg-[linear-gradient(180deg,_#f6efe7_0%,_#eef2ff_100%)] p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a6548]">
                              Стоимость
                            </p>
                            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#182036]">
                              {defaultPrice
                                ? isFreeCourse
                                  ? "Бесплатно"
                                  : formatMinorUnits(defaultPrice.amount, defaultPrice.currency)
                                : "Цена не задана"}
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#5f6982]">
                              {defaultProduct
                                ? "После демонстрационной оплаты пользователю автоматически открывается доступ к курсу."
                                : "Для этого курса еще не настроено предложение в административном контуре."}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            {hasAccess ? (
                              <PublicButton href={`/learning/courses/${course.id}`}>
                                Перейти к курсу
                              </PublicButton>
                            ) : defaultProduct && defaultPrice ? (
                              <form action={startDemoCheckout} className="contents">
                                <input type="hidden" name="courseId" value={course.id} />
                                <button
                                  type="submit"
                                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#2650d8_0%,_#4f6ff0_55%,_#7893ff_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(38,80,216,0.24)] transition hover:-translate-y-[1px] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2650d8] focus-visible:ring-offset-2"
                                >
                                  {isFreeCourse ? "Получить доступ" : "Оформить доступ"}
                                </button>
                              </form>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7dbe6] bg-white px-6 py-3 text-sm font-semibold text-[#9aa3b4]"
                              >
                                Цена не настроена
                              </button>
                            )}

                            <Link
                              href={session?.user ? "/learning" : "/sign-in"}
                              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#cfd7e8] bg-[rgba(255,255,255,0.88)] px-6 py-3 text-sm font-semibold text-[#182036] shadow-[0_10px_24px_rgba(24,32,54,0.06)] transition hover:-translate-y-[1px] hover:border-[#2650d8] hover:text-[#2650d8]"
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
