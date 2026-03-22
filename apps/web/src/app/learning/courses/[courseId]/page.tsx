import { EnrollmentStatus, prisma } from "@academy/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardCheck, FileText, PlayCircle } from "lucide-react";

import { LessonEngagementTracker } from "@/components/learning/lesson-engagement-tracker";
import { LessonVideoPlayer } from "@/components/learning/lesson-video-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleLessonCompletion } from "@/features/learning/actions";
import { extractLessonBlocks, type LessonBlock } from "@/lib/lesson-content";
import {
  enrollmentStatusLabelMap,
  enrollmentStatusVariantMap,
  lessonTypeLabelMap,
} from "@/lib/labels";
import { isElevatedUserRole } from "@/lib/user";
import { requireLearningViewer } from "@/lib/viewer";

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getRenderableBlocks(lesson: {
  content: unknown;
  videoAsset: unknown;
  videoSourceType: unknown;
  videoUrl: unknown;
  videoPlaybackId: unknown;
}): LessonBlock[] {
  const extractedBlocks = extractLessonBlocks(lesson.content);

  if (extractedBlocks.length > 0) {
    return extractedBlocks;
  }

  if (lesson.videoAsset || lesson.videoSourceType || lesson.videoUrl || lesson.videoPlaybackId) {
    return [
      {
        id: "legacy-video",
        type: "VIDEO",
        title: "Видео",
        body: "",
      },
    ];
  }

  return [];
}

type CourseLearningPageProps = {
  params: Promise<{
    courseId: string;
  }>;
  searchParams?: Promise<{
    lessonId?: string;
  }>;
};

export default async function CourseLearningPage({
  params,
  searchParams,
}: CourseLearningPageProps) {
  const viewer = await requireLearningViewer();
  const user = viewer.user;
  const isElevated = isElevatedUserRole(viewer.effectiveRole);
  const { courseId } = await params;
  const resolvedSearchParams = (searchParams ? await searchParams : {}) as {
    lessonId?: string;
  };

  const [course, enrollment] = await Promise.all([
    prisma.course.findFirst({
      where: {
        id: courseId,
        ...(isElevated
          ? {}
          : {
              enrollments: {
                some: {
                  userId: user.id,
                  status: {
                    not: EnrollmentStatus.CANCELED,
                  },
                },
              },
            }),
      },
      include: {
        modules: {
          orderBy: {
            position: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                position: "asc",
              },
              include: {
                progress: {
                  where: {
                    userId: user.id,
                  },
                  select: {
                    completedAt: true,
                  },
                },
                videoAsset: true,
              },
            },
          },
        },
      },
    }),
    isElevated
      ? Promise.resolve(null)
      : prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId,
            },
          },
          select: {
            startedAt: true,
            createdAt: true,
            status: true,
          },
        }),
  ]);

  if (!course) {
    notFound();
  }

  if (!isElevated && (!enrollment || enrollment.status === EnrollmentStatus.CANCELED)) {
    notFound();
  }

  const courseStartDate = enrollment?.startedAt ?? enrollment?.createdAt ?? new Date();
  const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const lessonEntries = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => {
      const completed = lesson.progress.some((progress) => Boolean(progress.completedAt));
      const unlockAt =
        !isElevated && lesson.accessAfterDays !== null && lesson.accessAfterDays !== undefined
          ? addDays(courseStartDate, lesson.accessAfterDays)
          : null;
      const unlocked = isElevated || !unlockAt || unlockAt <= new Date();

      return {
        module,
        lesson,
        completed,
        unlockAt,
        unlocked,
      };
    }),
  );

  const selectedEntry =
    lessonEntries.find(
      (entry) =>
        entry.lesson.id === resolvedSearchParams.lessonId &&
        (entry.unlocked || isElevated),
    ) ??
    lessonEntries.find((entry) => entry.unlocked) ??
    lessonEntries[0];

  const completedLessons = lessonEntries.filter((entry) => entry.completed).length;
  const progressPercent =
    lessonEntries.length === 0
      ? 0
      : Math.round((completedLessons / lessonEntries.length) * 100);
  const selectedLessonBlocks = selectedEntry
    ? getRenderableBlocks(selectedEntry.lesson)
    : [];

  return (
    <section className="space-y-6">
      <header className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Прохождение курса
              </p>
              {isElevated ? (
                <Badge variant="warning">Режим просмотра</Badge>
              ) : enrollment ? (
                <Badge variant={enrollmentStatusVariantMap[enrollment.status]}>
                  {enrollmentStatusLabelMap[enrollment.status]}
                </Badge>
              ) : null}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              {course.title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
              {course.description || "Описание курса пока не заполнено."}
            </p>
          </div>

          <div className="min-w-[220px] space-y-3 rounded-[24px] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between text-sm text-[var(--muted)]">
              <span>Прогресс</span>
              <span>
                {completedLessons} / {lessonEntries.length}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--primary-soft)]">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="space-y-4">
            {course.modules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--muted)]">
                В курсе пока нет модулей и уроков.
              </div>
            ) : (
              course.modules.map((module) => (
                <div key={module.id} className="space-y-3">
                  <div className="border-b border-[var(--border)] pb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                      Модуль {module.position}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                      {module.title}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {module.lessons.map((lesson) => {
                      const entry = lessonEntries.find(
                        (lessonEntry) => lessonEntry.lesson.id === lesson.id,
                      );

                      if (!entry) {
                        return null;
                      }

                      const isActive = selectedEntry?.lesson.id === lesson.id;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/learning/courses/${course.id}?lessonId=${lesson.id}`}
                          className={`block rounded-2xl border px-4 py-3 transition ${
                            isActive
                              ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                              : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[var(--foreground)]">
                                {lesson.title}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                                {lessonTypeLabelMap[lesson.type]}
                              </p>
                            </div>

                            {entry.completed ? (
                              <Badge variant="success">Готово</Badge>
                            ) : entry.unlocked ? (
                              <Badge variant="neutral">Открыт</Badge>
                            ) : (
                              <Badge variant="warning">Закрыт</Badge>
                            )}
                          </div>

                          {!entry.unlocked && entry.unlockAt ? (
                            <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
                              Откроется {dateFormatter.format(entry.unlockAt)}
                            </p>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          {!selectedEntry ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-sm leading-7 text-[var(--muted)]">
              В этом курсе пока нет уроков.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{lessonTypeLabelMap[selectedEntry.lesson.type]}</Badge>
                  {selectedEntry.lesson.isPreview ? (
                    <Badge variant="success">Открытый урок</Badge>
                  ) : null}
                  {selectedEntry.completed ? (
                    <Badge variant="success">Выполнено</Badge>
                  ) : null}
                  {!selectedEntry.unlocked ? (
                    <Badge variant="warning">Пока закрыт</Badge>
                  ) : null}
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
                    {selectedEntry.module.title}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                    {selectedEntry.lesson.title}
                  </h2>
                </div>

                {selectedEntry.lesson.excerpt ? (
                  <p className="text-base leading-8 text-[var(--muted)]">
                    {selectedEntry.lesson.excerpt}
                  </p>
                ) : null}
              </div>

              {!selectedEntry.unlocked ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900">
                  Урок еще не открыт. Следующая дата доступа:{" "}
                  {selectedEntry.unlockAt
                    ? dateFormatter.format(selectedEntry.unlockAt)
                    : "будет определена позже"}
                  .
                </div>
              ) : (
                <>
                  <LessonEngagementTracker
                    courseId={course.id}
                    lessonId={selectedEntry.lesson.id}
                    entryPath={`/learning/courses/${course.id}?lessonId=${selectedEntry.lesson.id}`}
                    hasVideo={Boolean(
                      selectedLessonBlocks.some((block) => block.type === "VIDEO") ||
                        selectedEntry.lesson.videoAsset ||
                        selectedEntry.lesson.videoSourceType ||
                        selectedEntry.lesson.videoUrl ||
                        selectedEntry.lesson.videoPlaybackId,
                    )}
                    sourceType={
                      selectedEntry.lesson.videoAsset?.sourceType ??
                      selectedEntry.lesson.videoSourceType ??
                      null
                    }
                  />

                  {selectedLessonBlocks.length > 0 ? (
                    <div className="space-y-4">
                      {selectedLessonBlocks.map((block, index) => {
                        if (block.type === "TEXT") {
                          return (
                            <section
                              key={block.id}
                              className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6"
                            >
                              <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-white p-3 text-[var(--primary)] shadow-sm">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                                    Блок {index + 1}
                                  </p>
                                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                                    {block.title}
                                  </h3>
                                </div>
                              </div>

                              <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-[var(--foreground)]">
                                {block.body || "В этом блоке пока нет текста."}
                              </p>
                            </section>
                          );
                        }

                        if (block.type === "VIDEO") {
                          return (
                            <section
                              key={block.id}
                              className="space-y-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6"
                            >
                              <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-white p-3 text-[var(--primary)] shadow-sm">
                                  <PlayCircle className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                                    Видео
                                  </p>
                                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                                    {block.title}
                                  </h3>
                                  {block.body ? (
                                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                                      {block.body}
                                    </p>
                                  ) : null}
                                </div>
                              </div>

                              <LessonVideoPlayer
                                title={block.title || selectedEntry.lesson.title}
                                videoSourceType={selectedEntry.lesson.videoSourceType}
                                videoUrl={selectedEntry.lesson.videoUrl}
                                videoPlaybackId={selectedEntry.lesson.videoPlaybackId}
                                videoAsset={
                                  selectedEntry.lesson.videoAsset
                                    ? {
                                        provider: selectedEntry.lesson.videoAsset.provider,
                                        sourceType: selectedEntry.lesson.videoAsset.sourceType,
                                        status: selectedEntry.lesson.videoAsset.status,
                                        playerUrl: selectedEntry.lesson.videoAsset.playerUrl,
                                        sourceUrl: selectedEntry.lesson.videoAsset.sourceUrl,
                                        playbackId: selectedEntry.lesson.videoAsset.playbackId,
                                        errorMessage: selectedEntry.lesson.videoAsset.errorMessage,
                                      }
                                    : null
                                }
                              />
                            </section>
                          );
                        }

                        if (block.type === "FILE") {
                          return (
                            <section
                              key={block.id}
                              className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                                    Материал
                                  </p>
                                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                                    {block.title}
                                  </h3>
                                  {block.note ? (
                                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                                      {block.note}
                                    </p>
                                  ) : null}
                                </div>

                                <Badge variant="neutral">Файл</Badge>
                              </div>

                              <a
                                href={block.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-4 transition hover:border-[var(--primary)]"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium text-[var(--foreground)]">
                                    Открыть материал
                                  </p>
                                  <p className="mt-1 break-all text-sm text-[var(--muted)]">
                                    {block.url}
                                  </p>
                                </div>
                                <Badge variant="default">Открыть</Badge>
                              </a>
                            </section>
                          );
                        }

                        return (
                          <section
                            key={block.id}
                            className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6"
                          >
                            <div className="flex items-start gap-3">
                              <div className="rounded-2xl bg-white p-3 text-[var(--primary)] shadow-sm">
                                <ClipboardCheck className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                                  Задание
                                </p>
                                <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                                  {block.title}
                                </h3>
                              </div>
                            </div>

                            <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-[var(--foreground)]">
                              {block.body || "Инструкция к заданию пока не заполнена."}
                            </p>

                            {block.submissionHint ? (
                              <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                                <p className="font-medium text-[var(--foreground)]">
                                  Как сдавать работу
                                </p>
                                <p className="mt-2 whitespace-pre-wrap">{block.submissionHint}</p>
                              </div>
                            ) : null}
                          </section>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-sm leading-7 text-[var(--muted)]">
                      Для этого урока пока не добавлены блоки контента.
                    </div>
                  )}

                  {!isElevated ? (
                    <form action={toggleLessonCompletion}>
                      <input
                        type="hidden"
                        name="lessonId"
                        value={selectedEntry.lesson.id}
                      />
                      <input type="hidden" name="courseId" value={course.id} />
                      <input
                        type="hidden"
                        name="completed"
                        value={selectedEntry.completed ? "false" : "true"}
                      />
                      <Button type="submit">
                        {selectedEntry.completed
                          ? "Снять отметку о прохождении"
                          : "Отметить урок как пройденный"}
                      </Button>
                    </form>
                  ) : (
                    <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--muted)]">
                      В режиме просмотра прогресс не записывается. Для проверки реального
                      прохождения используй студенческую учетную запись.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
