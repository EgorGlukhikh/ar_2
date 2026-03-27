import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  PublicButton,
} from "@/components/marketing/public-primitives";
import { startDemoCheckout } from "@/features/billing/actions";
import { getPublicCourseCover } from "@/lib/marketing-theme";
import { formatPublicCopy } from "@/lib/public-copy";
import type { PublicCatalogPayload } from "@shared/public-catalog/types";

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
  if (hasAccess) {
    return (
      <PublicButton href={`/learning/courses/${courseId}`} className="w-full justify-center">
        {formatPublicCopy("Перейти к курсу")}
      </PublicButton>
    );
  }

  if (!canCheckout) {
    return (
      <Button variant="outline" disabled className="w-full justify-center">
        {formatPublicCopy("Цена не настроена")}
      </Button>
    );
  }

  return (
    <form action={startDemoCheckout} className="w-full">
      <input type="hidden" name="courseId" value={courseId} />
      <Button type="submit" className="w-full justify-center">
        {formatPublicCopy(isFree ? "Получить доступ" : "Оформить доступ")}
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
  const { courses } = payload;

  if (courses.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-[var(--shadow-sm)]">
        <h2 className="text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
          {formatPublicCopy("Пока нет опубликованных курсов")}
        </h2>
        <p className="mx-auto mt-4 max-w-[480px] text-base leading-7 text-[var(--muted)]">
          {formatPublicCopy(
            "Как только программа будет опубликована, она появится здесь как часть публичного каталога.",
          )}
        </p>
        <div className="mt-6 flex justify-center">
          <PublicButton href="/sign-in">
            {formatPublicCopy("Открыть платформу")}
          </PublicButton>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, index) => (
        <article
          id={course.slug}
          key={course.id}
          className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
        >
          {/* Cover image */}
          <div className="relative h-52 shrink-0">
            <Image
              src={getPublicCourseCover(index + 1)}
              alt={course.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {course.deliveryFormatLabel}
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5">
            <h2 className="text-[17px] font-semibold leading-[1.4] tracking-[-0.02em] text-[var(--foreground)]">
              {formatPublicCopy(course.title)}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
              {formatPublicCopy(course.description)}
            </p>

            <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--surface-strong)] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {formatPublicCopy("Что получишь")}
              </p>
              <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--foreground)]">
                {formatPublicCopy(course.result)}
              </p>
            </div>

            {/* Price + lessons */}
            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                  {formatPublicCopy(course.priceLabel)}
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                  {course.lessonCount} уроков
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 space-y-2">
              <CourseAction
                courseId={course.id}
                canCheckout={course.canCheckout}
                isFree={course.isFree}
                hasAccess={course.hasAccess}
              />
              <Link
                href={course.hasAccess ? `/learning/courses/${course.id}` : "#" + course.slug}
                className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
              >
                {formatPublicCopy("Смотреть программу")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
