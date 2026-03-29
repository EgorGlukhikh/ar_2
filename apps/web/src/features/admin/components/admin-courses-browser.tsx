"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Filter,
  LayoutTemplate,
  Tags,
  WalletCards,
} from "lucide-react";

import type { AdminCoursesPayload } from "@shared/admin-courses/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseThumb } from "@/components/workspace/workspace-primitives";
import { cn } from "@/lib/utils";

type TopicFilterValue = string;
type TagFilterValue = string;

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function getTopicLabel(value: string | null) {
  return value?.trim() ? value.trim() : "Без темы";
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)] shadow-[var(--shadow-sm)]"
          : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[#dce4ff] hover:text-[var(--foreground)]",
      )}
    >
      {children}
    </button>
  );
}

export function AdminCoursesBrowser({
  payload,
}: {
  payload: AdminCoursesPayload;
}) {
  const [activeTopic, setActiveTopic] = useState<TopicFilterValue>("all");
  const [activeTag, setActiveTag] = useState<TagFilterValue>("all");

  const topics = useMemo(() => {
    const uniqueTopics = Array.from(
      new Set(payload.courses.map((course) => getTopicLabel(course.topic))),
    ).sort((left, right) => left.localeCompare(right, "ru"));

    return ["all", ...uniqueTopics];
  }, [payload.courses]);

  const tags = useMemo(() => {
    const uniqueTags = Array.from(
      new Set(payload.courses.flatMap((course) => course.tags.map((tag) => tag.trim())).filter(Boolean)),
    ).sort((left, right) => left.localeCompare(right, "ru"));

    return ["all", ...uniqueTags];
  }, [payload.courses]);

  const visibleCourses = useMemo(() => {
    return payload.courses.filter((course) => {
      const matchesTopic =
        activeTopic === "all" || getTopicLabel(course.topic) === activeTopic;
      const matchesTag =
        activeTag === "all" ||
        course.tags.some((tag) => normalizeToken(tag) === normalizeToken(activeTag));

      return matchesTopic && matchesTag;
    });
  }, [activeTag, activeTopic, payload.courses]);

  return (
    <div className="space-y-5">
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[linear-gradient(180deg,_rgba(245,247,255,0.96)_0%,_rgba(255,255,255,0.98)_100%)] p-5 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              <Filter className="h-3.5 w-3.5" />
              Фильтры каталога
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Темы и теги помогают быстро собирать курсы в понятные группы. Это не
              кнопки-действия, а рабочие фильтры списка.
            </p>
          </div>

          <div className="rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
            Показано курсов:{" "}
            <span className="font-semibold text-[var(--foreground)]">{visibleCourses.length}</span>
            {" "}из {payload.totalCourses}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              <LayoutTemplate className="h-3.5 w-3.5" />
              Темы
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => {
                const isActive = activeTopic === topic;
                const label = topic === "all" ? "Все темы" : topic;

                return (
                  <FilterChip
                    key={topic}
                    active={isActive}
                    onClick={() => setActiveTopic(topic)}
                  >
                    {label}
                  </FilterChip>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              <Tags className="h-3.5 w-3.5" />
              Теги
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.length > 1 ? (
                tags.map((tag) => {
                  const isActive = activeTag === tag;
                  const label = tag === "all" ? "Все теги" : tag;

                  return (
                    <FilterChip
                      key={tag}
                      active={isActive}
                      onClick={() => setActiveTag(tag)}
                    >
                      {label}
                    </FilterChip>
                  );
                })
              ) : (
                <div className="rounded-full border border-dashed border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]">
                  Пока нет тегов. Их можно задать в карточке курса.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {visibleCourses.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-white p-8 text-center shadow-[var(--shadow-sm)]">
          <p className="text-lg font-semibold text-[var(--foreground)]">
            По выбранным фильтрам курсы не найдены
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Сбрось тему или тег, чтобы увидеть другие программы.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setActiveTopic("all")}>
              Сбросить тему
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setActiveTag("all")}>
              Сбросить тег
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {visibleCourses.map((course) => (
            <article
              key={course.id}
              className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
            >
              <CourseThumb
                title={course.title}
                subtitle={`/${course.slug}`}
                compact
                imageUrl={course.coverUrl ?? undefined}
                className="aspect-[4/3] min-h-0"
              />

              <div className="mt-5 flex flex-1 flex-col gap-5">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={course.statusVariant}>{course.statusLabel}</Badge>
                    <Badge variant="neutral">{getTopicLabel(course.topic)}</Badge>
                    <Badge variant="neutral">Модулей {course.moduleCount}</Badge>
                    <Badge variant="neutral">Уроков {course.lessonCount}</Badge>
                  </div>

                  <div className="space-y-3">
                    <h2 className="line-clamp-3 text-[24px] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--foreground)]">
                      {course.title}
                    </h2>
                    <p className="text-sm leading-7 text-[var(--muted)]">
                      {course.description || "Описание курса пока не заполнено."}
                    </p>
                  </div>

                  {course.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-[#dce4ff] bg-[#f6f8ff] px-3 py-1.5 text-xs font-medium text-[var(--primary)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--muted)]">
                      У курса пока нет тегов. Их можно добавить в настройках карточки.
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                        <p className="text-sm font-medium text-[var(--foreground)]">Программа</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {course.moduleCount} модулей и {course.lessonCount} уроков внутри курса.
                      </p>
                    </div>

                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
                      <div className="flex items-center gap-2">
                        <WalletCards className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {payload.isAdminMode ? "Доступы" : "Автор"}
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {payload.isAdminMode
                          ? `Зачислений ${course.enrollmentCount}`
                          : course.authorLabel ?? "Автор пока не назначен"}
                      </p>
                    </div>
                  </div>

                  {payload.isAdminMode && course.authorLabel ? (
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--muted)]">
                      Автор:{" "}
                      <span className="font-medium text-[var(--foreground)]">
                        {course.authorLabel}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-auto flex flex-wrap gap-3">
                  <Button asChild size="sm">
                    <Link href={`/admin/courses/${course.id}/content`}>Открыть программу</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/courses/${course.id}`}>
                      {payload.isAuthorMode ? "Карточка курса" : "Настройки"}
                    </Link>
                  </Button>
                  {payload.isAdminMode ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/courses/${course.id}/access`}>Доступ и продажи</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
