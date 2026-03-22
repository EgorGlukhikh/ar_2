import Link from "next/link";
import { ClipboardCheck, Eye, GraduationCap, MessageSquareQuote } from "lucide-react";

import { HomeworkSubmissionStatus, prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { reviewHomeworkSubmission } from "@/features/homework/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";
import { requireRoleAccess } from "@/lib/admin";
import {
  homeworkSubmissionStatusLabelMap,
  homeworkSubmissionStatusVariantMap,
} from "@/lib/labels";

type HomeworkFilter = "all" | "waiting" | "revision" | "approved";

type AdminHomeworkPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const homeworkReviewStatusLabelMap: Record<string, string> = {
  submitted: "Отправлено",
  in_review: "На проверке",
  revision_requested: "На доработке",
  approved: "Принято",
};

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value?: Date | null) {
  if (!value) {
    return "—";
  }

  return dateTimeFormatter.format(value);
}

function formatBytes(sizeInBytes: number) {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} Б`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${Math.round(sizeInBytes / 102.4) / 10} КБ`;
  }

  return `${Math.round(sizeInBytes / 1024 / 102.4) / 10} МБ`;
}

export default async function AdminHomeworkPage({
  searchParams,
}: AdminHomeworkPageProps) {
  await requireRoleAccess([USER_ROLES.ADMIN, USER_ROLES.CURATOR]);

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeFilter: HomeworkFilter =
    resolvedSearchParams.status === "waiting" ||
    resolvedSearchParams.status === "revision" ||
    resolvedSearchParams.status === "approved"
      ? resolvedSearchParams.status
      : "all";

  const submissionWhere =
    activeFilter === "waiting"
      ? {
          status: {
            in: [HomeworkSubmissionStatus.SUBMITTED, HomeworkSubmissionStatus.IN_REVIEW],
          },
        }
      : activeFilter === "revision"
        ? {
            status: HomeworkSubmissionStatus.REVISION_REQUESTED,
          }
        : activeFilter === "approved"
          ? {
              status: HomeworkSubmissionStatus.APPROVED,
            }
          : {};

  const [submissions, submittedCount, revisionCount, approvedCount] = await Promise.all([
    prisma.homeworkSubmission.findMany({
      where: submissionWhere,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
        assignment: {
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        files: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      take: 50,
    }),
    prisma.homeworkSubmission.count({
      where: {
        status: {
          in: [HomeworkSubmissionStatus.SUBMITTED, HomeworkSubmissionStatus.IN_REVIEW],
        },
      },
    }),
    prisma.homeworkSubmission.count({
      where: {
        status: HomeworkSubmissionStatus.REVISION_REQUESTED,
      },
    }),
    prisma.homeworkSubmission.count({
      where: {
        status: HomeworkSubmissionStatus.APPROVED,
      },
    }),
  ]);

  const assignmentIds = [...new Set(submissions.map((submission) => submission.assignmentId))];
  const studentIds = [...new Set(submissions.map((submission) => submission.studentId))];

  const reviews =
    assignmentIds.length > 0 && studentIds.length > 0
      ? await prisma.homeworkReview.findMany({
          where: {
            assignmentId: {
              in: assignmentIds,
            },
            studentId: {
              in: studentIds,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            reviewer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        })
      : [];

  const reviewHistoryMap = new Map<string, typeof reviews>();

  for (const review of reviews) {
    const key = `${review.assignmentId}:${review.studentId}`;
    const current = reviewHistoryMap.get(key) ?? [];
    current.push(review);
    reviewHistoryMap.set(key, current);
  }

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Проверка домашних заданий"
        title="Центр проверки работ студентов"
        description="Здесь команда видит все сданные домашние работы, забирает их в проверку, принимает или возвращает на доработку с комментариями."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/students">Открыть базу студентов</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <WorkspaceStatCard
          label="Ждут проверки"
          value={submittedCount}
          hint="Сюда попадают новые сдачи и работы, которые уже взяли в проверку."
          icon={ClipboardCheck}
        />
        <WorkspaceStatCard
          label="На доработке"
          value={revisionCount}
          hint="Студенты получили комментарии и должны прислать новую версию."
          icon={MessageSquareQuote}
        />
        <WorkspaceStatCard
          label="Принято"
          value={approvedCount}
          hint="Работы, которые уже одобрены и открыли следующий шаг обучения."
          icon={GraduationCap}
        />
      </div>

      <WorkspacePanel
        eyebrow="Последние сдачи"
        title="Очередь проверки"
        description="Каждая карточка показывает, что прислал студент, кто уже проверяет работу и что нужно сделать дальше."
        actions={
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Все" },
              { key: "waiting", label: "Ждут проверки" },
              { key: "revision", label: "На доработке" },
              { key: "approved", label: "Принято" },
            ].map((item) => (
              <Button
                key={item.key}
                asChild
                size="sm"
                variant={activeFilter === item.key ? "default" : "outline"}
              >
                <Link
                  href={
                    item.key === "all"
                      ? "/admin/homework"
                      : `/admin/homework?status=${item.key}`
                  }
                >
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        }
      >
        {submissions.length === 0 ? (
          <WorkspaceEmptyState
            title="Пока нет домашних работ"
            description="Как только студенты начнут сдавать задания, здесь появится общая очередь на проверку."
            className="border-[var(--border)] bg-[var(--surface)] shadow-none"
          />
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <article
                key={submission.id}
                className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                {(() => {
                  const history =
                    reviewHistoryMap.get(`${submission.assignmentId}:${submission.studentId}`) ?? [];

                  return (
                    <>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={homeworkSubmissionStatusVariantMap[submission.status]}
                      >
                        {homeworkSubmissionStatusLabelMap[submission.status]}
                      </Badge>
                      <Badge variant="neutral">
                        {submission.assignment.lesson.module.course.title}
                      </Badge>
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      {submission.assignment.lesson.title}
                    </h2>

                    <p className="text-sm text-[var(--muted)]">
                      {submission.student.name || submission.student.email} · модуль{" "}
                      {submission.assignment.lesson.module.title}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2 lg:min-w-[320px]">
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p>Сдано</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {formatDateTime(submission.submittedAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p>Проверяющий</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {submission.reviewer?.name ||
                          submission.reviewer?.email ||
                          "Пока не назначен"}
                      </p>
                    </div>
                  </div>
                </div>

                {submission.submissionText ? (
                  <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white px-4 py-4">
                    <p className="text-sm font-medium text-[var(--foreground)]">Текст студента</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
                      {submission.submissionText}
                    </p>
                  </div>
                ) : null}

                {submission.submissionUrl ? (
                  <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white px-4 py-4">
                    <p className="text-sm font-medium text-[var(--foreground)]">Ссылка</p>
                    <a
                      href={submission.submissionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--primary)] underline-offset-4 hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      {submission.submissionUrl}
                    </a>
                  </div>
                ) : null}

                {submission.files.length > 0 ? (
                  <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white px-4 py-4">
                    <p className="text-sm font-medium text-[var(--foreground)]">Файлы</p>
                    <div className="mt-3 space-y-2">
                      {submission.files.map((file) => (
                        <a
                          key={file.id}
                          href={`/api/homework/files/${file.id}`}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm transition hover:border-[var(--primary)]"
                        >
                          <span className="font-medium text-[var(--foreground)]">
                            {file.filename}
                          </span>
                          <span className="text-[var(--muted)]">
                            {formatBytes(file.sizeInBytes)}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                {submission.feedback ? (
                  <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white px-4 py-4">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Последний комментарий
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
                      {submission.feedback}
                    </p>
                  </div>
                ) : null}

                <form action={reviewHomeworkSubmission} className="mt-5 space-y-3">
                  <input type="hidden" name="submissionId" value={submission.id} />
                  <Textarea
                    name="feedback"
                    defaultValue={submission.feedback ?? ""}
                    className="min-h-[120px]"
                    placeholder="Комментарий студенту: что принято, что исправить, на что обратить внимание."
                  />

                  <div className="flex flex-wrap gap-3">
                    {submission.status !== HomeworkSubmissionStatus.IN_REVIEW ? (
                      <Button type="submit" name="actionType" value="in_review" variant="outline">
                        Взять в проверку
                      </Button>
                    ) : null}
                    <Button type="submit" name="actionType" value="approve">
                      Принять работу
                    </Button>
                    <Button
                      type="submit"
                      name="actionType"
                      value="revision"
                      variant="outline"
                    >
                      Вернуть на доработку
                    </Button>
                  </div>
                </form>
                {history.length > 0 ? (
                  <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white px-4 py-4">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      История проверки
                    </p>
                    <div className="mt-3 space-y-3">
                      {history.slice(0, 6).map((review) => (
                        <div
                          key={review.id}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="neutral">
                              {homeworkReviewStatusLabelMap[review.status] ?? review.status}
                            </Badge>
                            <span className="text-sm text-[var(--muted)]">
                              {formatDateTime(review.createdAt)}
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
                    </>
                  );
                })()}
              </article>
            ))}
          </div>
        )}
      </WorkspacePanel>
    </section>
  );
}
