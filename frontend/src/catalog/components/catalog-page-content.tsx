"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  PublicButton,
  publicCardClassName,
  publicInsetCardClassName,
  publicSoftInsetCardClassName,
} from "@/components/marketing/public-primitives";
import { startDemoCheckout } from "@/features/billing/actions";
import { getPublicCourseCover } from "@/lib/marketing-theme";
import { formatPublicCopy } from "@/lib/public-copy";
import type { PublicCatalogCourse, PublicCatalogPayload } from "@shared/public-catalog/types";

function CourseAction({
  courseId,
  canCheckout,
  isFree,
  hasAccess,
  isAuthenticated,
}: {
  courseId: string;
  canCheckout: boolean;
  isFree: boolean;
  hasAccess: boolean;
  isAuthenticated: boolean;
}) {
  if (hasAccess) {
    return (
      <PublicButton href={`/learning/courses/${courseId}`} className="w-full justify-center">
        {formatPublicCopy("Перейти к курсу")}
      </PublicButton>
    );
  }

  if (isFree && !isAuthenticated) {
    return (
      <PublicButton href="/sign-in" className="w-full justify-center">
        {formatPublicCopy("Получить доступ")}
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

function CourseProgramDialog({
  course,
  coverIndex,
  isAuthenticated,
  onClose,
}: {
  course: PublicCatalogCourse;
  coverIndex: number;
  isAuthenticated: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020617]/56 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-course-dialog-title"
        className="relative flex max-h-[calc(100vh-3rem)] w-full max-w-[980px] flex-col overflow-hidden rounded-[32px] border border-white/12 bg-white shadow-[0_36px_120px_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white/92 text-[var(--foreground)] shadow-sm transition hover:bg-white"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative min-h-[260px] overflow-hidden bg-[var(--foreground)] lg:min-h-full">
            <Image
              src={getPublicCourseCover(coverIndex)}
              alt={course.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <span className="inline-flex rounded-full border border-white/18 bg-black/42 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/88 backdrop-blur-sm">
                {course.deliveryFormatLabel}
              </span>
              <h2
                id="catalog-course-dialog-title"
                className="mt-4 max-w-[16ch] text-[clamp(1.8rem,3vw,2.8rem)] font-semibold leading-[1.02] tracking-[-0.03em]"
              >
                {formatPublicCopy(course.title)}
              </h2>
              <p className="mt-4 max-w-[44ch] text-sm leading-7 text-white/76 sm:text-[15px]">
                {formatPublicCopy(course.description)}
              </p>
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
              <div className={`${publicSoftInsetCardClassName} rounded-[24px] p-5`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {formatPublicCopy("Что получишь")}
                </p>
                <p className="mt-2 text-base leading-7 text-[var(--foreground)]">
                  {formatPublicCopy(course.result)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`${publicInsetCardClassName} rounded-[22px] p-4`}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Формат
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">
                    {course.deliveryFormatLabel}
                  </p>
                </div>
                <div className={`${publicInsetCardClassName} rounded-[22px] p-4`}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Уроков
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">
                    {course.lessonCount}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Программа курса
                  </p>
                  <p className="text-sm text-[var(--muted)]">{course.modules.length} модулей</p>
                </div>

                <div className="space-y-3">
                  {course.modules.map((module, moduleIndex) => (
                    <article
                      key={module.id}
                      className={`${publicInsetCardClassName} rounded-[24px] p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-semibold text-[var(--primary)]">
                          {moduleIndex + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold leading-6 text-[var(--foreground)]">
                            {module.title}
                          </h3>
                          <ul className="mt-2 space-y-1.5">
                            {module.lessons.map((lesson) => (
                              <li key={lesson.id} className="text-sm leading-6 text-[var(--muted)]">
                                {lesson.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border)] bg-white px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[32px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                    {formatPublicCopy(course.priceLabel)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {course.lessonCount} уроков внутри программы
                  </p>
                </div>

                <div className="w-full max-w-[320px]">
                  <CourseAction
                    courseId={course.id}
                    canCheckout={course.canCheckout}
                    isFree={course.isFree}
                    hasAccess={course.hasAccess}
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.slug === selectedSlug) ?? null,
    [courses, selectedSlug],
  );

  const selectedIndex = useMemo(
    () => Math.max(0, courses.findIndex((course) => course.slug === selectedSlug)),
    [courses, selectedSlug],
  );

  useEffect(() => {
    function syncFromHash() {
      const slug = window.location.hash.replace(/^#/, "");
      if (!slug) {
        setSelectedSlug(null);
        return;
      }

      const exists = courses.some((course) => course.slug === slug);
      setSelectedSlug(exists ? slug : null);
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [courses]);

  function openCourse(slug: string) {
    setSelectedSlug(slug);
    window.history.replaceState(null, "", `#${slug}`);
  }

  function closeCourse() {
    setSelectedSlug(null);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  if (courses.length === 0) {
    return (
      <div className={`${publicCardClassName} p-10 text-center`}>
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
    <>
      <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <article
            id={course.slug}
            key={course.id}
            role="button"
            tabIndex={0}
            aria-label={`Открыть программу курса ${course.title}`}
            onClick={() => openCourse(course.slug)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openCourse(course.slug);
              }
            }}
            className={`${publicCardClassName} group flex h-full cursor-pointer flex-col overflow-hidden p-0`}
          >
            <div className="relative h-52 shrink-0 overflow-hidden">
              <Image
                src={getPublicCourseCover(index + 1)}
                alt={course.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {course.deliveryFormatLabel}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h2 className="min-h-[76px] text-[17px] font-semibold leading-[1.4] tracking-[-0.02em] text-[var(--foreground)] line-clamp-3">
                {formatPublicCopy(course.title)}
              </h2>

              <p className="mt-2 min-h-[76px] line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                {formatPublicCopy(course.description)}
              </p>

              <div className={`mt-4 min-h-[116px] ${publicSoftInsetCardClassName} px-4 py-3`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {formatPublicCopy("Что получишь")}
                </p>
                <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-[var(--foreground)]">
                  {formatPublicCopy(course.result)}
                </p>
              </div>

              <div className="mt-5 min-h-[58px]">
                <p className="text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                  {formatPublicCopy(course.priceLabel)}
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                  {course.lessonCount} уроков
                </p>
              </div>

              <div
                className="mt-4 space-y-2"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <CourseAction
                  courseId={course.id}
                  canCheckout={course.canCheckout}
                  isFree={course.isFree}
                  hasAccess={course.hasAccess}
                  isAuthenticated={isAuthenticated}
                />

                <button
                  type="button"
                  onClick={() => openCourse(course.slug)}
                  className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
                >
                  {formatPublicCopy("Смотреть программу")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {selectedCourse ? (
        <CourseProgramDialog
          course={selectedCourse}
          coverIndex={selectedIndex + 1}
          isAuthenticated={isAuthenticated}
          onClose={closeCourse}
        />
      ) : null}
    </>
  );
}
