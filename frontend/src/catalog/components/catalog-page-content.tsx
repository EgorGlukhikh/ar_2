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

import { Button } from "@/components/ui/button";
import {
  PublicButton,
  SectionLead,
  publicBadgeClassName,
  publicCardClassName,
  publicIconBoxClassName,
} from "@/components/marketing/public-primitives";
import { startDemoCheckout } from "@/features/billing/actions";
import { getPublicCourseCover } from "@/lib/marketing-theme";
import { formatPublicCopy } from "@/lib/public-copy";
import { cn } from "@/lib/utils";
import type { PublicCatalogPayload } from "@shared/public-catalog/types";

const trustPoints = [
  "Есть бесплатные и платные программы под разные этапы работы риэлтора.",
  "Внутри не только видео: материалы, задания и рабочие шаблоны по теме.",
  "Курс можно открыть под конкретную задачу сделки, а не ради общей теории.",
];

function CourseAction({
  courseId,
  canCheckout,
  isFree,
  hasAccess,
}: {
  courseId: string;
  canCheckout: boolean;
  isFree: boolean;
  hasAccess: boolean;
}) {
  const actionLabel = hasAccess
    ? "Перейти к курсу"
    : isFree
      ? "Получить доступ"
      : "Оформить доступ";

  if (hasAccess) {
    return (
      <PublicButton href={`/learning/courses/${courseId}`} className="w-full justify-center sm:w-auto">
        {formatPublicCopy(actionLabel)}
      </PublicButton>
    );
  }

  if (!canCheckout) {
    return (
      <Button variant="outline" disabled className="w-full justify-center sm:w-auto">
        {formatPublicCopy("Цена не настроена")}
      </Button>
    );
  }

  return (
    <form action={startDemoCheckout} className="w-full sm:w-auto">
      <input type="hidden" name="courseId" value={courseId} />
      <Button type="submit" className="w-full justify-center">
        {formatPublicCopy(actionLabel)}
      </Button>
    </form>
  );
}

/**
 * Purpose: render the public catalog UI from a prepared backend payload.
 * Props:
 * - payload: normalized catalog DTOs
 * - isAuthenticated: whether the viewer already has a session
 */
export function CatalogPageContent({
  payload,
  isAuthenticated,
}: {
  payload: PublicCatalogPayload;
  isAuthenticated: boolean;
}) {
  const { courses, featuredCourse } = payload;

  return (
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
                <div className={cn(publicIconBoxClassName, "h-10 w-10 rounded-[var(--icon-radius-sm)]")}>
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
            <div className="relative h-60 overflow-hidden rounded-[var(--radius-md)]">
              <Image
                src={getPublicCourseCover(0)}
                alt={featuredCourse.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.72)_100%)]" />
            </div>
            <p className="mt-5 text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
              {formatPublicCopy("Сейчас часто выбирают")}
            </p>
            <h2 className="mt-3 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[var(--foreground)]">
              {formatPublicCopy(featuredCourse.title)}
            </h2>
            <p className="mt-3 max-w-[560px] text-base leading-7 text-[var(--muted)]">
              {formatPublicCopy(featuredCourse.description)}
            </p>
          </article>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {courses.length === 0 ? (
          <article className={`${publicCardClassName} md:col-span-2`}>
            <h2 className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[var(--foreground)]">
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
          courses.map((course, index) => (
            <article id={course.slug} key={course.id} className={publicCardClassName}>
              <div className="relative h-48 overflow-hidden rounded-[var(--radius-md)]">
                <Image
                  src={getPublicCourseCover(index + 1)}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className={publicBadgeClassName}>
                  {formatPublicCopy(`${course.lessonCount} уроков`)}
                </span>
                <span className={publicBadgeClassName}>
                  {formatPublicCopy(course.deliveryFormatLabel)}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
                {formatPublicCopy(course.title)}
              </h2>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                {formatPublicCopy(course.description)}
              </p>

              <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--surface-strong)] p-4">
                <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                  {formatPublicCopy("Что получишь")}
                </p>
                <p className="mt-3 text-base leading-7 text-[var(--foreground)]">
                  {formatPublicCopy(course.result)}
                </p>
              </div>

              <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--surface-strong)] p-4">
                <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                  {formatPublicCopy("Стоимость")}
                </p>
                <p className="mt-3 text-[28px] font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
                  {formatPublicCopy(course.priceLabel)}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <CourseAction
                  courseId={course.id}
                  canCheckout={course.canCheckout}
                  isFree={course.isFree}
                  hasAccess={course.hasAccess}
                />

                <Button asChild variant="outline" className="w-full justify-center whitespace-nowrap">
                  <Link href={isAuthenticated ? "/learning" : "/sign-in"}>
                    {formatPublicCopy(isAuthenticated ? "В кабинет" : "Войти")}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <Link
                href={course.hasAccess ? `/learning/courses/${course.id}` : "/catalog"}
                className="mt-5 inline-flex items-center gap-2 text-base font-medium !text-[var(--primary)] transition hover:!text-[var(--primary-hover)]"
              >
                {formatPublicCopy("Смотреть программу")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

