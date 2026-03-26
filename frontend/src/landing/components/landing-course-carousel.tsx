"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  publicBadgeClassName,
  publicButtonClassName,
  publicCardClassName,
} from "@/components/marketing/public-primitives";
import { MotionReveal } from "@/components/marketing/motion-reveal";
import { getPublicCourseCover } from "@/lib/marketing-theme";
import { formatPublicCopy } from "@/lib/public-copy";
import { cn } from "@/lib/utils";
import { showcaseCopyBySlug } from "@shared/public-home/copy";
import type { PublicCourseCard } from "@shared/public-home/types";

function Copy({ value, className }: { value: string; className?: string }) {
  return <span className={className}>{formatPublicCopy(value)}</span>;
}

/**
 * Purpose: render public landing course cards without shrinking them below a readable width.
 * Props:
 * - courses: normalized public course DTOs from backend/shared layer.
 * Usage:
 * - place inside the landing courses section; it will switch between 1/2/3 cards per page.
 */
export function LandingCourseCarousel({ courses }: { courses: PublicCourseCard[] }) {
  const [cardsPerView, setCardsPerView] = useState(3);
  const [page, setPage] = useState(0);

  useEffect(() => {
    function syncCardsPerView() {
      if (window.innerWidth >= 1280) {
        setCardsPerView(3);
        return;
      }

      if (window.innerWidth >= 768) {
        setCardsPerView(2);
        return;
      }

      setCardsPerView(1);
    }

    syncCardsPerView();
    window.addEventListener("resize", syncCardsPerView);
    return () => window.removeEventListener("resize", syncCardsPerView);
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(courses.length / cardsPerView)),
    [cardsPerView, courses.length],
  );

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages - 1));
  }, [totalPages]);

  const visibleCourses = useMemo(() => {
    const start = page * cardsPerView;
    return courses.slice(start, start + cardsPerView);
  }, [cardsPerView, courses, page]);

  const showControls = courses.length > 3;

  return (
    <div className="space-y-6">
      {showControls ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-[var(--muted)]">
            <Copy value="Если программ больше трех, можно листать подборки и смотреть следующие карточки без узких колонок." />
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
              disabled={page === 0}
              aria-label="Предыдущая группа курсов"
              className={cn(
                publicButtonClassName("secondary"),
                "min-h-12 min-w-12 px-0",
                page === 0 && "pointer-events-none opacity-45",
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index)}
                  aria-label={`Показать группу курсов ${index + 1}`}
                  aria-current={page === index ? "page" : undefined}
                  className={cn(
                    "min-h-12 min-w-12 rounded-[var(--control-radius)] border px-4 text-sm font-semibold transition",
                    page === index
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-brand)]"
                      : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPage((currentPage) => Math.min(totalPages - 1, currentPage + 1))}
              disabled={page === totalPages - 1}
              aria-label="Следующая группа курсов"
              className={cn(
                publicButtonClassName("secondary"),
                "min-h-12 min-w-12 px-0",
                page === totalPages - 1 && "pointer-events-none opacity-45",
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-6",
          cardsPerView === 1 && "grid-cols-1",
          cardsPerView === 2 && "md:grid-cols-2",
          cardsPerView === 3 && "md:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {visibleCourses.map((course, index) => {
          const copy = showcaseCopyBySlug[course.slug];

          return (
            <MotionReveal key={course.id} variant="scale" delay={index * 100} className="h-full">
              <article className={cn(publicCardClassName, "h-full")}>
                <div className="relative h-56 overflow-hidden rounded-[16px]">
                  <Image
                    src={getPublicCourseCover(index + page * cardsPerView)}
                    alt={copy?.title ?? course.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className={publicBadgeClassName}>
                    <Copy value={`${course.lessonCount} уроков`} />
                  </span>
                  <span className={publicBadgeClassName}>
                    <Copy value={course.priceLabel} />
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
                  <Copy value={copy?.title ?? course.title} />
                </h3>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                  <Copy value={copy?.description ?? course.description} />
                </p>

                <Link
                  href={`/catalog#${course.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-base font-medium text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
                >
                  <Copy value="Смотреть программу" />
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </MotionReveal>
          );
        })}
      </div>
    </div>
  );
}
