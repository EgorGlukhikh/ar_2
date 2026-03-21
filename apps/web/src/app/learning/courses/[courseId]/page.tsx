import { EnrollmentStatus, prisma } from "@academy/db";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonVideoPlayer } from "@/components/learning/lesson-video-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleLessonCompletion } from "@/features/learning/actions";
import {
  extractLessonAttachments,
  extractLessonBody,
} from "@/lib/lesson-content";
import {
  enrollmentStatusLabelMap,
  enrollmentStatusVariantMap,
  lessonTypeLabelMap,
} from "@/lib/labels";
import { isElevatedUserRole, requireStudentOrElevatedUser } from "@/lib/user";

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
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
  const user = await requireStudentOrElevatedUser();
  const isElevated = isElevatedUserRole(user.role);
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
                  <LessonVideoPlayer
                    title={selectedEntry.lesson.title}
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

                  {extractLessonBody(selectedEntry.lesson.content) ? (
                    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6">
                      <p className="whitespace-pre-wrap text-base leading-8 text-[var(--foreground)]">
                        {extractLessonBody(selectedEntry.lesson.content)}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-sm leading-7 text-[var(--muted)]">
                      Для этого урока пока не добавлен текстовый материал.
                    </div>
                  )}

                  {extractLessonAttachments(selectedEntry.lesson.content).length > 0 ? (
                    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                        Материалы урока
                      </p>
                      <div className="mt-4 space-y-3">
                        {extractLessonAttachments(selectedEntry.lesson.content).map(
                          (attachment) => (
                            <a
                              key={`${attachment.title}-${attachment.url}`}
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-4 transition hover:border-[var(--primary)]"
                            >
                              <div>
                                <p className="font-medium text-[var(--foreground)]">
                                  {attachment.title}
                                </p>
                                <p className="mt-1 break-all text-sm text-[var(--muted)]">
                                  {attachment.url}
                                </p>
                              </div>
                              <Badge variant="neutral">Открыть</Badge>
                            </a>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}

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
                      В режиме просмотра прогресс не записывается. Для проверки
                      реального прохождения используй студенческую учетную запись.
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
