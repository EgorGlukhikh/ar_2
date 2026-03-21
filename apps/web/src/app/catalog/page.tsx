import { auth } from "@academy/auth";
import { CourseStatus, EnrollmentStatus, prisma } from "@academy/db";
import Link from "next/link";

import { startDemoCheckout } from "@/features/billing/actions";
import { courseStatusLabelMap } from "@/lib/labels";
import { formatMinorUnits } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f9ff_0%,_#f1f5ff_100%)] px-6 py-10">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Каталог курсов
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                Доступные программы
              </h1>
              <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
                Здесь видны опубликованные курсы, их цена и сценарий тестовой
                покупки. После реальной интеграции этот экран останется
                витриной, а изменится только платежный провайдер.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/">На главную</Link>
              </Button>
              {session?.user ? (
                <Button asChild>
                  <Link href="/after-sign-in">В кабинет</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/sign-in">Войти</Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-2">
          {courses.length === 0 ? (
            <article className="rounded-[24px] border border-dashed border-[var(--border)] bg-white p-8 shadow-sm xl:col-span-2">
              <p className="text-lg font-semibold text-[var(--foreground)]">
                Пока нет опубликованных курсов
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Опубликуй курс и задай ему цену в админке, после чего он
                появится здесь.
              </p>
            </article>
          ) : (
            courses.map((course) => {
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
                  className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="success">
                      {courseStatusLabelMap[course.status]}
                    </Badge>
                    <Badge variant="neutral">Уроков {lessonCount}</Badge>
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    {course.title}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">/{course.slug}</p>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                    {course.description || "Описание курса пока не заполнено."}
                  </p>

                  <div className="mt-6 rounded-[24px] bg-[var(--surface)] p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Стоимость
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                      {defaultPrice
                        ? formatMinorUnits(defaultPrice.amount, defaultPrice.currency)
                        : "Цена не задана"}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                      {defaultProduct
                        ? "После тестовой оплаты пользователь получает доступ к курсу и видит его в учебном кабинете."
                        : "В админке еще не настроено предложение для этого курса."}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {hasAccess ? (
                      <Button asChild>
                        <Link href={`/learning/courses/${course.id}`}>
                          Перейти к курсу
                        </Link>
                      </Button>
                    ) : defaultProduct && defaultPrice ? (
                      <form action={startDemoCheckout}>
                        <input type="hidden" name="courseId" value={course.id} />
                        <Button type="submit">Оплатить курс</Button>
                      </form>
                    ) : (
                      <Button type="button" variant="outline" disabled>
                        Цена не настроена
                      </Button>
                    )}

                    <Button asChild variant="outline">
                      <Link href={session?.user ? "/learning" : "/sign-in"}>
                        {session?.user ? "Открыть кабинет" : "Войти"}
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
