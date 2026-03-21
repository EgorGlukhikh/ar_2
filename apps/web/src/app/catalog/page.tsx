import { auth } from "@academy/auth";
import { CourseStatus, EnrollmentStatus, prisma } from "@academy/db";
import { BookOpenText, ChevronRight, ShieldCheck, WalletCards } from "lucide-react";
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

  const leadCourse = courses[0] ?? null;

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <header className="flex flex-col gap-4 border-b border-black/5 pb-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c2442] text-sm font-semibold text-white">
                  AR
                </div>
                <div>
                  <p className="font-[family:var(--font-landing-display)] text-lg font-semibold">
                    Каталог курсов
                  </p>
                  <p className="text-sm leading-6 text-[#667087]">
                    Витрина программ, цен и входа в учебный кабинет.
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

            <div className="grid gap-8 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
              <div className="space-y-8">
                <SectionLead
                  eyebrow="Публичная витрина"
                  title="Курсы должны смотреться как продукт, который хочется открыть и купить."
                  text="Здесь видны опубликованные программы, их стоимость и сценарий получения доступа. Реальный платежный провайдер позже заменит demo-flow, но сама витрина останется такой же."
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { icon: BookOpenText, label: "Опубликовано", value: `${courses.length} программ` },
                    { icon: WalletCards, label: "Сценарий", value: "Demo checkout" },
                    { icon: ShieldCheck, label: "После оплаты", value: "Выдача доступа" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <article
                        key={item.label}
                        className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm"
                      >
                        <div className="inline-flex rounded-2xl bg-[#eef2ff] p-3">
                          <Icon className="h-5 w-5 text-[#2840db]" />
                        </div>
                        <p className="mt-4 text-sm text-[#697088]">{item.label}</p>
                        <p className="mt-2 text-xl font-semibold text-[#1c2442]">{item.value}</p>
                      </article>
                    );
                  })}
                </div>

                {leadCourse ? (
                  <article className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_24px_80px_rgba(28,36,66,0.08)]">
                    <div className="relative h-64">
                      <Image
                        src={getPublicCourseCover(0)}
                        alt={leadCourse.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(20,28,60,0.08)_0%,_rgba(20,28,60,0.72)_100%)]" />
                      <div className="absolute left-5 top-5 rounded-full bg-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                        Рекомендуем
                      </div>
                    </div>
                    <div className="space-y-4 p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[#eef2ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2840db]">
                          {courseStatusLabelMap[leadCourse.status]}
                        </span>
                        <span className="rounded-full bg-[#f4f6fa] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#677086]">
                          Уроков{" "}
                          {leadCourse.modules.reduce(
                            (sum, module) => sum + module.lessons.length,
                            0,
                          )}
                        </span>
                      </div>
                      <h2 className="font-[family:var(--font-landing-display)] text-3xl font-semibold text-[#1c2442]">
                        {leadCourse.title}
                      </h2>
                      <p className="text-sm leading-7 text-[#596177]">
                        {leadCourse.description || "Описание курса пока не заполнено."}
                      </p>
                    </div>
                  </article>
                ) : null}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {courses.length === 0 ? (
                  <article className="rounded-[28px] border border-dashed border-[#d7deef] bg-white p-8 shadow-sm md:col-span-2">
                    <h2 className="text-2xl font-semibold text-[#1c2442]">
                      Пока нет опубликованных курсов
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#596177]">
                      Опубликуй курс и задай ему цену в админке. После этого программа
                      появится здесь как часть каталога.
                    </p>
                    <div className="mt-6">
                      <PublicButton href="/sign-in">Открыть платформу</PublicButton>
                    </div>
                  </article>
                ) : (
                  courses.map((course, index) => {
                    const defaultProduct = course.products[0];
                    const defaultPrice = defaultProduct?.prices[0];
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
                        className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_20px_60px_rgba(28,36,66,0.08)]"
                      >
                        <div className="relative h-56">
                          <Image
                            src={getPublicCourseCover(index + 1)}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(20,28,60,0.08)_0%,_rgba(20,28,60,0.64)_100%)]" />
                          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/16 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                              {courseStatusLabelMap[course.status]}
                            </span>
                            <span className="rounded-full bg-white/16 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                              {lessonCount} уроков
                            </span>
                          </div>
                        </div>

                        <div className="space-y-5 p-6">
                          <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-[#1c2442]">
                              {course.title}
                            </h2>
                            <p className="mt-2 text-sm text-[#697088]">/{course.slug}</p>
                            <p className="mt-4 text-sm leading-7 text-[#596177]">
                              {course.description || "Описание курса пока не заполнено."}
                            </p>
                          </div>

                          <div className="rounded-[24px] bg-[linear-gradient(180deg,_#f6f8ff_0%,_#fffaf7_100%)] p-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b8296]">
                              Стоимость
                            </p>
                            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1c2442]">
                              {defaultPrice
                                ? formatMinorUnits(defaultPrice.amount, defaultPrice.currency)
                                : "Цена не задана"}
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#596177]">
                              {defaultProduct
                                ? "После demo-оплаты пользователю автоматически открывается доступ к курсу."
                                : "В админке еще не настроено предложение для этого курса."}
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
                                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2840db] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(40,64,219,0.24)] transition hover:bg-[#1f34bf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2840db] focus-visible:ring-offset-2"
                                >
                                  Оплатить курс
                                </button>
                              </form>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7deef] bg-white px-6 py-3 text-sm font-semibold text-[#9aa3b4]"
                              >
                                Цена не настроена
                              </button>
                            )}

                            <Link
                              href={session?.user ? "/learning" : "/sign-in"}
                              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#cfd7f3] bg-white px-6 py-3 text-sm font-semibold text-[#1c2442] transition hover:border-[#2840db] hover:text-[#2840db]"
                            >
                              {session?.user ? "Открыть кабинет" : "Войти"}
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
