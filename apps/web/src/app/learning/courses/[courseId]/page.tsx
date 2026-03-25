import {
  EnrollmentStatus,
  HomeworkSubmissionStatus,
  prisma,
} from "@academy/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardCheck, FileText, Link2, Paperclip, PlayCircle } from "lucide-react";

import { LessonEngagementTracker } from "@/components/learning/lesson-engagement-tracker";
import { LessonVideoPlayer } from "@/components/learning/lesson-video-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toggleLessonCompletion } from "@/features/learning/actions";
import { submitHomework } from "@/features/homework/actions";
import {
  resolveLessonBlocks,
  type LessonBlock,
  type PersistedLessonBlockRecord,
} from "@/lib/lesson-content";
import {
  enrollmentStatusLabelMap,
  enrollmentStatusVariantMap,
  homeworkSubmissionStatusLabelMap,
  homeworkSubmissionStatusVariantMap,
  lessonTypeLabelMap,
} from "@/lib/labels";
import { isElevatedUserRole } from "@/lib/user";
import { requireLearningViewer } from "@/lib/viewer";

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatBytes(sizeInBytes: number) {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} Б`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${Math.round(sizeInBytes / 1024)} КБ`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function getRenderableBlocks(lesson: {
  content: unknown;
  lessonBlocks?: {
    blockKey: string;
    type: "TEXT" | "VIDEO" | "FILE" | "HOMEWORK";
    position: number;
    title: string;
    body: string | null;
    url: string | null;
    note: string | null;
    submissionHint: string | null;
  }[];
  videoAsset: unknown;
  videoSourceType: unknown;
  videoUrl: unknown;
  videoPlaybackId: unknown;
}): LessonBlock[] {
  const extractedBlocks = resolveLessonBlocks({
    content: lesson.content,
    lessonBlocks: lesson.lessonBlocks,
  });

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

function getHomeworkGateReason(moduleTitle: string, lessonTitle: string) {
  return `Следующий модуль откроется после принятия домашней работы «${lessonTitle}» в модуле «${moduleTitle}».`;
}

function getHomeworkReviewLabel(status: string) {
  const labels: Record<string, string> = {
    submitted: "Отправлено",
    in_review: "На проверке",
    revision_requested: "На доработке",
    approved: "Принято",
  };

  return labels[status] ?? status;
}

type CourseLearningPageProps = {
  params: Promise<{
    courseId: string;
  }>;
  searchParams?: Promise<{
    lessonId?: string;
  }>;
};

type LessonBlockStoreRecord = PersistedLessonBlockRecord & {
  lessonId: string;
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
                homeworkAssignment: {
                  include: {
                    reviews: {
                      where: {
                        studentId: user.id,
                      },
                      include: {
                        reviewer: {
                          select: {
                            name: true,
                            email: true,
                          },
                        },
                      },
                      orderBy: {
                        createdAt: "desc",
                      },
                    },
                    submissions: {
                      where: {
                        studentId: user.id,
                      },
                      include: {
                        files: {
                          select: {
                            id: true,
                            filename: true,
                            sizeInBytes: true,
                            mimeType: true,
                          },
                        },
                      },
                      orderBy: {
                        updatedAt: "desc",
                      },
                      take: 1,
                    },
                  },
                },
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

  const lessonIds = course.modules.flatMap((moduleItem) =>
    moduleItem.lessons.map((lesson) => lesson.id),
  );
  const lessonBlockPrisma = prisma as typeof prisma & {
    lessonBlock: {
      findMany(args: unknown): Promise<LessonBlockStoreRecord[]>;
    };
  };
  const persistedLessonBlocks =
    lessonIds.length > 0
      ? await lessonBlockPrisma.lessonBlock.findMany({
          where: {
            lessonId: {
              in: lessonIds,
            },
          },
          orderBy: [{ lessonId: "asc" }, { position: "asc" }],
          select: {
            lessonId: true,
            blockKey: true,
            type: true,
            position: true,
            title: true,
            body: true,
            url: true,
            note: true,
            submissionHint: true,
          },
        })
      : [];
  const lessonBlocksByLessonId = new Map<string, (typeof persistedLessonBlocks)[number][]>();

  persistedLessonBlocks.forEach((block) => {
    const blocks = lessonBlocksByLessonId.get(block.lessonId) ?? [];
    blocks.push(block);
    lessonBlocksByLessonId.set(block.lessonId, blocks);
  });

  const courseStartDate = enrollment?.startedAt ?? enrollment?.createdAt ?? new Date();
  const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const moduleGateMap = new Map<
    string,
    {
      unlocked: boolean;
      blockedByHomeworkReason: string | null;
    }
  >();
  let previousModulesSatisfied = true;
  let previousHomeworkReason: string | null = null;

  for (const courseModule of course.modules) {
    moduleGateMap.set(courseModule.id, {
      unlocked: isElevated || previousModulesSatisfied,
      blockedByHomeworkReason: !isElevated && !previousModulesSatisfied ? previousHomeworkReason : null,
    });

    const blockingHomeworkLesson = courseModule.lessons.find((lesson) => {
      const assignment = lesson.homeworkAssignment;

      if (!assignment || !assignment.unlockNextModuleOnApproval) {
        return false;
      }

      const submission = assignment.submissions[0];

      if (!assignment.requiresCuratorReview) {
        return !submission;
      }

      return submission?.status !== HomeworkSubmissionStatus.APPROVED;
    });

    if (blockingHomeworkLesson) {
      previousModulesSatisfied = false;
      previousHomeworkReason = getHomeworkGateReason(
        courseModule.title,
        blockingHomeworkLesson.title,
      );
    }
  }

  const lessonEntries = course.modules.flatMap((courseModule) =>
    courseModule.lessons.map((lesson) => {
      const completed = lesson.progress.some((progress) => Boolean(progress.completedAt));
      const unlockAt =
        !isElevated && lesson.accessAfterDays !== null && lesson.accessAfterDays !== undefined
          ? addDays(courseStartDate, lesson.accessAfterDays)
          : null;
      const moduleGate = moduleGateMap.get(courseModule.id) ?? {
        unlocked: true,
        blockedByHomeworkReason: null,
      };
      const unlocked =
        moduleGate.unlocked && (isElevated || !unlockAt || unlockAt <= new Date());

      return {
        module: courseModule,
        lesson,
        completed,
        unlockAt,
        unlocked,
        blockedByHomeworkReason: moduleGate.blockedByHomeworkReason,
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
    ? getRenderableBlocks({
        ...selectedEntry.lesson,
        lessonBlocks: lessonBlocksByLessonId.get(selectedEntry.lesson.id),
      })
    : [];
  const selectedHomeworkAssignment = selectedEntry?.lesson.homeworkAssignment ?? null;
  const selectedHomeworkSubmission = selectedHomeworkAssignment?.submissions[0] ?? null;
  const selectedHomeworkReviews = selectedHomeworkAssignment?.reviews ?? [];
  const canSubmitHomework =
    !selectedHomeworkSubmission ||
    selectedHomeworkSubmission.status === HomeworkSubmissionStatus.REVISION_REQUESTED;

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

                  {selectedHomeworkAssignment ? (
                    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                            Сдача домашней работы
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                            Отправь решение на проверку
                          </h3>
                          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                            Следующий модуль откроется после принятия домашней работы, если автор
                            включил блокировку по проверке.
                          </p>
                        </div>

                        {selectedHomeworkSubmission ? (
                          <Badge
                            variant={
                              homeworkSubmissionStatusVariantMap[selectedHomeworkSubmission.status]
                            }
                          >
                            {homeworkSubmissionStatusLabelMap[selectedHomeworkSubmission.status]}
                          </Badge>
                        ) : (
                          <Badge variant="neutral">Пока не сдано</Badge>
                        )}
                      </div>

                        {selectedHomeworkSubmission ? (
                          <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-white p-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={
                                homeworkSubmissionStatusVariantMap[selectedHomeworkSubmission.status]
                              }
                            >
                              {homeworkSubmissionStatusLabelMap[selectedHomeworkSubmission.status]}
                            </Badge>
                            <span className="text-sm text-[var(--muted)]">
                              Обновлено {dateFormatter.format(selectedHomeworkSubmission.updatedAt)}
                            </span>
                          </div>

                          {selectedHomeworkSubmission.submissionText ? (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-[var(--foreground)]">
                                Текстовый ответ
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
                                {selectedHomeworkSubmission.submissionText}
                              </p>
                            </div>
                          ) : null}

                          {selectedHomeworkSubmission.submissionUrl ? (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-[var(--foreground)]">Ссылка</p>
                              <a
                                href={selectedHomeworkSubmission.submissionUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--primary)] underline-offset-4 hover:underline"
                              >
                                <Link2 className="h-4 w-4" />
                                {selectedHomeworkSubmission.submissionUrl}
                              </a>
                            </div>
                          ) : null}

                          {selectedHomeworkSubmission.files.length > 0 ? (
                            <div className="mt-4 space-y-2">
                              <p className="text-sm font-medium text-[var(--foreground)]">Файлы</p>
                              {selectedHomeworkSubmission.files.map((file) => (
                                <a
                                  key={file.id}
                                  href={`/api/homework/files/${file.id}`}
                                  className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm transition hover:border-[var(--primary)]"
                                >
                                  <span className="flex items-center gap-2 text-[var(--foreground)]">
                                    <Paperclip className="h-4 w-4 text-[var(--primary)]" />
                                    {file.filename}
                                  </span>
                                  <span className="text-[var(--muted)]">
                                    {formatBytes(file.sizeInBytes)}
                                  </span>
                                </a>
                              ))}
                            </div>
                          ) : null}

                          {selectedHomeworkSubmission.feedback ? (
                            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                              <p className="text-sm font-medium text-[var(--foreground)]">
                                Комментарий проверяющего
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
                                {selectedHomeworkSubmission.feedback}
                              </p>
                            </div>
                          ) : null}
                          </div>
                        ) : null}

                        {selectedHomeworkReviews.length > 0 ? (
                          <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-white p-5">
                            <p className="text-sm font-medium text-[var(--foreground)]">
                              История проверки
                            </p>
                            <div className="mt-3 space-y-3">
                              {selectedHomeworkReviews.slice(0, 6).map((review) => (
                                <div
                                  key={review.id}
                                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="neutral">
                                      {getHomeworkReviewLabel(review.status)}
                                    </Badge>
                                    <span className="text-sm text-[var(--muted)]">
                                      {dateFormatter.format(review.createdAt)}
                                    </span>
                                    <span className="text-sm text-[var(--muted)]">
                                      {review.reviewer?.name ||
                                        review.reviewer?.email ||
                                        "Системное действие"}
                                    </span>
                                  </div>
                                  {review.feedback ? (
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
                                      {review.feedback}
                                    </p>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {isElevated ? (
                        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                          В режиме просмотра форма сдачи не активируется. Для реальной проверки
                          сценария нужна студенческая учетная запись.
                        </div>
                      ) : canSubmitHomework ? (
                        <form action={submitHomework} className="mt-5 space-y-4">
                          <input
                            type="hidden"
                            name="assignmentId"
                            value={selectedHomeworkAssignment.id}
                          />
                          <input type="hidden" name="courseId" value={course.id} />
                          <input
                            type="hidden"
                            name="lessonId"
                            value={selectedEntry.lesson.id}
                          />

                          {selectedHomeworkAssignment.allowTextSubmission ? (
                            <div className="space-y-2">
                              <Label htmlFor="submission-text">Текстовый ответ</Label>
                              <Textarea
                                id="submission-text"
                                name="submissionText"
                                defaultValue={selectedHomeworkSubmission?.submissionText ?? ""}
                                className="min-h-[160px]"
                                placeholder="Опиши решение, шаги выполнения или комментарий к домашней работе."
                              />
                            </div>
                          ) : null}

                          {selectedHomeworkAssignment.allowLinkSubmission ? (
                            <div className="space-y-2">
                              <Label htmlFor="submission-url">Ссылка на выполненную работу</Label>
                              <Input
                                id="submission-url"
                                name="submissionUrl"
                                type="url"
                                defaultValue={selectedHomeworkSubmission?.submissionUrl ?? ""}
                                placeholder="https://disk.yandex.ru/... или https://docs.google.com/..."
                              />
                            </div>
                          ) : null}

                          {selectedHomeworkAssignment.allowFileUpload ? (
                            <div className="space-y-2">
                              <Label htmlFor="submission-file">Файл</Label>
                              <Input
                                id="submission-file"
                                name="submissionFile"
                                type="file"
                              />
                              <p className="text-sm leading-6 text-[var(--muted)]">
                                Для первого этапа ограничиваем размер файла 10 МБ.
                              </p>
                            </div>
                          ) : null}

                          <Button type="submit">
                            {selectedHomeworkSubmission?.status ===
                            HomeworkSubmissionStatus.REVISION_REQUESTED
                              ? "Отправить доработанную версию"
                              : "Сдать домашнюю работу"}
                          </Button>
                        </form>
                      ) : (
                        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                          Работа уже отправлена. Новая отправка откроется, если проверяющий вернет
                          ее на доработку.
                        </div>
                      )}
                    </section>
                  ) : null}

                  {!isElevated && !selectedHomeworkAssignment ? (
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
