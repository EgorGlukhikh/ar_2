import Link from "next/link";
import { ClipboardCheck, Eye, GraduationCap, MessageSquareQuote } from "lucide-react";

import { HomeworkSubmissionStatus, prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { reviewHomeworkSubmission } from "@/features/homework/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspaceActionRow,
  WorkspaceEmptyState,
  WorkspaceInfoItem,
  WorkspaceNotice,
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
  submitted: "РћС‚РїСЂР°РІР»РµРЅРѕ",
  in_review: "РќР° РїСЂРѕРІРµСЂРєРµ",
  revision_requested: "РќР° РґРѕСЂР°Р±РѕС‚РєРµ",
  approved: "РџСЂРёРЅСЏС‚Рѕ",
};

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value?: Date | null) {
  if (!value) {
    return "вЂ”";
  }

  return dateTimeFormatter.format(value);
}

function formatBytes(sizeInBytes: number) {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} Р‘`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${Math.round(sizeInBytes / 102.4) / 10} РљР‘`;
  }

  return `${Math.round(sizeInBytes / 1024 / 102.4) / 10} РњР‘`;
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
        eyebrow="РџСЂРѕРІРµСЂРєР° РґРѕРјР°С€РЅРёС… Р·Р°РґР°РЅРёР№"
        title="Р¦РµРЅС‚СЂ РїСЂРѕРІРµСЂРєРё СЂР°Р±РѕС‚ СЃС‚СѓРґРµРЅС‚РѕРІ"
        description="Р—РґРµСЃСЊ РєРѕРјР°РЅРґР° РІРёРґРёС‚ РІСЃРµ СЃРґР°РЅРЅС‹Рµ РґРѕРјР°С€РЅРёРµ СЂР°Р±РѕС‚С‹, Р·Р°Р±РёСЂР°РµС‚ РёС… РІ РїСЂРѕРІРµСЂРєСѓ, РїСЂРёРЅРёРјР°РµС‚ РёР»Рё РІРѕР·РІСЂР°С‰Р°РµС‚ РЅР° РґРѕСЂР°Р±РѕС‚РєСѓ СЃ РєРѕРјРјРµРЅС‚Р°СЂРёСЏРјРё."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/students">РћС‚РєСЂС‹С‚СЊ Р±Р°Р·Сѓ СЃС‚СѓРґРµРЅС‚РѕРІ</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <WorkspaceStatCard
          label="Р–РґСѓС‚ РїСЂРѕРІРµСЂРєРё"
          value={submittedCount}
          hint="РЎСЋРґР° РїРѕРїР°РґР°СЋС‚ РЅРѕРІС‹Рµ СЃРґР°С‡Рё Рё СЂР°Р±РѕС‚С‹, РєРѕС‚РѕСЂС‹Рµ СѓР¶Рµ РІР·СЏР»Рё РІ РїСЂРѕРІРµСЂРєСѓ."
          icon={ClipboardCheck}
        />
        <WorkspaceStatCard
          label="РќР° РґРѕСЂР°Р±РѕС‚РєРµ"
          value={revisionCount}
          hint="РЎС‚СѓРґРµРЅС‚С‹ РїРѕР»СѓС‡РёР»Рё РєРѕРјРјРµРЅС‚Р°СЂРёРё Рё РґРѕР»Р¶РЅС‹ РїСЂРёСЃР»Р°С‚СЊ РЅРѕРІСѓСЋ РІРµСЂСЃРёСЋ."
          icon={MessageSquareQuote}
        />
        <WorkspaceStatCard
          label="РџСЂРёРЅСЏС‚Рѕ"
          value={approvedCount}
          hint="Р Р°Р±РѕС‚С‹, РєРѕС‚РѕСЂС‹Рµ СѓР¶Рµ РѕРґРѕР±СЂРµРЅС‹ Рё РѕС‚РєСЂС‹Р»Рё СЃР»РµРґСѓСЋС‰РёР№ С€Р°Рі РѕР±СѓС‡РµРЅРёСЏ."
          icon={GraduationCap}
        />
      </div>

      <WorkspacePanel
        eyebrow="РџРѕСЃР»РµРґРЅРёРµ СЃРґР°С‡Рё"
        title="РћС‡РµСЂРµРґСЊ РїСЂРѕРІРµСЂРєРё"
        description="РљР°Р¶РґР°СЏ РєР°СЂС‚РѕС‡РєР° РїРѕРєР°Р·С‹РІР°РµС‚, С‡С‚Рѕ РїСЂРёСЃР»Р°Р» СЃС‚СѓРґРµРЅС‚, РєС‚Рѕ СѓР¶Рµ РїСЂРѕРІРµСЂСЏРµС‚ СЂР°Р±РѕС‚Сѓ Рё С‡С‚Рѕ РЅСѓР¶РЅРѕ СЃРґРµР»Р°С‚СЊ РґР°Р»СЊС€Рµ."
        actions={
          <WorkspaceActionRow dense>
            {[
              { key: "all", label: "Р’СЃРµ" },
              { key: "waiting", label: "Р–РґСѓС‚ РїСЂРѕРІРµСЂРєРё" },
              { key: "revision", label: "РќР° РґРѕСЂР°Р±РѕС‚РєРµ" },
              { key: "approved", label: "РџСЂРёРЅСЏС‚Рѕ" },
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
          </WorkspaceActionRow>
        }
      >
        {submissions.length === 0 ? (
          <WorkspaceEmptyState
            title="РџРѕРєР° РЅРµС‚ РґРѕРјР°С€РЅРёС… СЂР°Р±РѕС‚"
            description="РљР°Рє С‚РѕР»СЊРєРѕ СЃС‚СѓРґРµРЅС‚С‹ РЅР°С‡РЅСѓС‚ СЃРґР°РІР°С‚СЊ Р·Р°РґР°РЅРёСЏ, Р·РґРµСЃСЊ РїРѕСЏРІРёС‚СЃСЏ РѕР±С‰Р°СЏ РѕС‡РµСЂРµРґСЊ РЅР° РїСЂРѕРІРµСЂРєСѓ."
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
                            {submission.student.name || submission.student.email} В· РјРѕРґСѓР»СЊ{" "}
                            {submission.assignment.lesson.module.title}
                          </p>
                        </div>

                        <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2 lg:min-w-[320px]">
                          <WorkspaceInfoItem
                            label="РЎРґР°РЅРѕ"
                            value={formatDateTime(submission.submittedAt)}
                          />
                          <WorkspaceInfoItem
                            label="РџСЂРѕРІРµСЂСЏСЋС‰РёР№"
                            value={
                              submission.reviewer?.name ||
                              submission.reviewer?.email ||
                              "РџРѕРєР° РЅРµ РЅР°Р·РЅР°С‡РµРЅ"
                            }
                          />
                        </div>
                      </div>

                      {submission.submissionText ? (
                        <WorkspaceNotice
                          className="mt-5"
                          title="РўРµРєСЃС‚ СЃС‚СѓРґРµРЅС‚Р°"
                          description={
                            <span className="whitespace-pre-wrap">{submission.submissionText}</span>
                          }
                        />
                      ) : null}

                      {submission.submissionUrl ? (
                        <WorkspaceNotice className="mt-4" title="РЎСЃС‹Р»РєР°">
                          <a
                            href={submission.submissionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-[var(--primary)] underline-offset-4 hover:underline"
                          >
                            <Eye className="h-4 w-4" />
                            {submission.submissionUrl}
                          </a>
                        </WorkspaceNotice>
                      ) : null}

                      {submission.files.length > 0 ? (
                        <WorkspaceNotice className="mt-4" title="Р¤Р°Р№Р»С‹">
                          <div className="space-y-2">
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
                        </WorkspaceNotice>
                      ) : null}

                      {submission.feedback ? (
                        <WorkspaceNotice
                          className="mt-4"
                          title="РџРѕСЃР»РµРґРЅРёР№ РєРѕРјРјРµРЅС‚Р°СЂРёР№"
                          description={
                            <span className="whitespace-pre-wrap">{submission.feedback}</span>
                          }
                        />
                      ) : null}

                      <form action={reviewHomeworkSubmission} className="mt-5 space-y-3">
                        <input type="hidden" name="submissionId" value={submission.id} />
                        <Textarea
                          name="feedback"
                          defaultValue={submission.feedback ?? ""}
                          className="min-h-[120px]"
                          placeholder="РљРѕРјРјРµРЅС‚Р°СЂРёР№ СЃС‚СѓРґРµРЅС‚Сѓ: С‡С‚Рѕ РїСЂРёРЅСЏС‚Рѕ, С‡С‚Рѕ РёСЃРїСЂР°РІРёС‚СЊ, РЅР° С‡С‚Рѕ РѕР±СЂР°С‚РёС‚СЊ РІРЅРёРјР°РЅРёРµ."
                        />

                        <WorkspaceActionRow>
                          {submission.status !== HomeworkSubmissionStatus.IN_REVIEW ? (
                            <Button
                              type="submit"
                              name="actionType"
                              value="in_review"
                              variant="outline"
                            >
                              Р’Р·СЏС‚СЊ РІ РїСЂРѕРІРµСЂРєСѓ
                            </Button>
                          ) : null}
                          <Button type="submit" name="actionType" value="approve">
                            РџСЂРёРЅСЏС‚СЊ СЂР°Р±РѕС‚Сѓ
                          </Button>
                          <Button
                            type="submit"
                            name="actionType"
                            value="revision"
                            variant="outline"
                          >
                            Р’РµСЂРЅСѓС‚СЊ РЅР° РґРѕСЂР°Р±РѕС‚РєСѓ
                          </Button>
                        </WorkspaceActionRow>
                      </form>

                      {history.length > 0 ? (
                        <WorkspaceNotice className="mt-5" title="РСЃС‚РѕСЂРёСЏ РїСЂРѕРІРµСЂРєРё">
                          <div className="space-y-3">
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
                                      "РЎРёСЃС‚РµРјРЅРѕРµ РґРµР№СЃС‚РІРёРµ"}
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
                        </WorkspaceNotice>
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
