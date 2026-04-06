"use client";

import { BookOpen, Clock, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import type { PublicCourseCard } from "@shared/public-home/types";

type CoursePreviewModalProps = {
  course: PublicCourseCard;
  coverSrc?: string;
  onClose: () => void;
};

export function CoursePreviewModal({ course, coverSrc, onClose }: CoursePreviewModalProps) {
  const durationHours = Math.max(1, Math.ceil((course.lessonCount * 15) / 60));

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-xl flex-col rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]">
        {coverSrc ? (
          <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-t-[28px] sm:rounded-t-[28px]">
            <Image src={coverSrc} alt={course.title} fill className="object-cover" />
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Программа курса
            </p>
            <h2 className="mt-1.5 text-xl font-semibold leading-tight tracking-tight text-[var(--foreground)]">
              {course.title}
            </h2>
            {course.description ? (
              <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">{course.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 shrink-0 rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-y border-[var(--border)] px-6 py-3 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            {course.authorName}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            {course.lessonCount} уроков
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            ~{durationHours} ч
          </span>
          <span className="ml-auto text-sm font-semibold text-[var(--foreground)]">
            {course.priceLabel}
          </span>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {course.modules.length > 0 ? (
            course.modules.map((mod, i) => (
              <div key={mod.id}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="shrink-0 rounded-md bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                    Модуль {i + 1}
                  </span>
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {mod.title}
                  </p>
                </div>
                <div className="space-y-1">
                  {mod.lessons.map((lesson, li) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-lg bg-[var(--surface)] px-3 py-2"
                    >
                      <span className="w-5 shrink-0 text-right text-[10px] font-bold tabular-nums text-[var(--muted)]">
                        {li + 1}
                      </span>
                      <span className="text-sm text-[var(--foreground)]">{lesson.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">Программа скоро будет опубликована.</p>
          )}
        </div>

        <div className="space-y-3 border-t border-[var(--border)] px-6 py-5">
          <Link
            href={`/catalog#${course.slug}`}
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-[var(--control-radius)] bg-[var(--primary)] py-3.5 text-sm font-semibold !text-white shadow-[var(--shadow-brand)] transition hover:opacity-90 active:scale-[0.98]"
          >
            Открыть курс в каталоге
          </Link>
          <Link
            href="/sign-in"
            onClick={onClose}
            className="block text-center text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Войти или зарегистрироваться →
          </Link>
        </div>
      </div>
    </div>
  );
}
