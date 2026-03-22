import { EnrollmentStatus, MediaSourceType, Prisma, prisma } from "@academy/db";
import { USER_ROLES, type UserRole } from "@academy/shared";

import type { ViewerContext } from "@/lib/viewer";

type LessonTelemetryInput = {
  clientSessionId: string;
  courseId: string;
  lessonId: string;
  eventType: string;
  entryPath?: string;
  hadVideo?: boolean;
  sourceType?: MediaSourceType | null;
  playerState?: string | null;
  visibilityState?: string | null;
  positionSeconds?: number | null;
  durationSeconds?: number | null;
  exitReason?: string | null;
  payload?: Record<string, unknown> | null;
};

function normalizeNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function isSessionTerminal(eventType: string, exitReason?: string | null) {
  return (
    eventType === "session_closed" ||
    eventType === "player_complete" ||
    exitReason === "pagehide" ||
    exitReason === "beforeunload"
  );
}

export async function recordLessonTelemetry(
  viewer: ViewerContext,
  input: LessonTelemetryInput,
) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: input.lessonId,
      module: {
        courseId: input.courseId,
      },
    },
    select: {
      id: true,
      module: {
        select: {
          courseId: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found.");
  }

  if (viewer.actualRole === USER_ROLES.STUDENT) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: viewer.user.id,
          courseId: input.courseId,
        },
      },
      select: {
        status: true,
      },
    });

    if (!enrollment || enrollment.status === EnrollmentStatus.CANCELED) {
      throw new Error("Enrollment not found.");
    }
  }

  const now = new Date();
  const positionSeconds = normalizeNumber(input.positionSeconds);
  const durationSeconds = normalizeNumber(input.durationSeconds);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.lessonSession.findUnique({
      where: {
        clientSessionId: input.clientSessionId,
      },
      select: {
        id: true,
        maxPositionSeconds: true,
      },
    });

    const maxPositionSeconds = Math.max(
      existing?.maxPositionSeconds ?? 0,
      positionSeconds ?? 0,
    );

    const session = existing
      ? await tx.lessonSession.update({
          where: {
            clientSessionId: input.clientSessionId,
          },
          data: {
            entryPath: input.entryPath ?? undefined,
            hadVideo: input.hadVideo ?? undefined,
            sourceType: input.sourceType ?? undefined,
            lastPlayerState: input.playerState ?? undefined,
            exitReason: input.exitReason ?? undefined,
            durationSeconds: durationSeconds ?? undefined,
            lastPositionSeconds: positionSeconds ?? undefined,
            maxPositionSeconds,
            lastSeenAt: now,
            endedAt: isSessionTerminal(input.eventType, input.exitReason) ? now : undefined,
          },
          select: {
            id: true,
          },
        })
      : await tx.lessonSession.create({
          data: {
            clientSessionId: input.clientSessionId,
            userId: viewer.user.id,
            courseId: input.courseId,
            lessonId: input.lessonId,
            actualRole: viewer.actualRole,
            previewRole: viewer.previewRole ?? undefined,
            isPreview: viewer.isPreview,
            sourceType: input.sourceType ?? undefined,
            hadVideo: input.hadVideo ?? false,
            entryPath: input.entryPath,
            lastPlayerState: input.playerState ?? undefined,
            exitReason: input.exitReason ?? undefined,
            durationSeconds: durationSeconds ?? undefined,
            lastPositionSeconds: positionSeconds ?? 0,
            maxPositionSeconds,
            startedAt: now,
            lastSeenAt: now,
            endedAt: isSessionTerminal(input.eventType, input.exitReason) ? now : undefined,
          },
          select: {
            id: true,
          },
        });

    await tx.lessonSessionEvent.create({
      data: {
        lessonSessionId: session.id,
        eventType: input.eventType,
        playerState: input.playerState ?? undefined,
        visibilityState: input.visibilityState ?? undefined,
        positionSeconds: positionSeconds ?? undefined,
        durationSeconds: durationSeconds ?? undefined,
        payload: (input.payload as Prisma.JsonObject | undefined) ?? undefined,
      },
    });
  });
}

export async function getStudentAnalyticsSummary() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalSessions, activeStudents, stalledSessions, latestSessions] =
    await Promise.all([
      prisma.lessonSession.count({
        where: {
          actualRole: USER_ROLES.STUDENT,
          isPreview: false,
        },
      }),
      prisma.lessonSession.groupBy({
        by: ["userId"],
        where: {
          actualRole: USER_ROLES.STUDENT,
          isPreview: false,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      prisma.lessonSession.count({
        where: {
          actualRole: USER_ROLES.STUDENT,
          isPreview: false,
          maxPositionSeconds: {
            gt: 0,
          },
          endedAt: {
            not: null,
          },
          events: {
            none: {
              eventType: "player_complete",
            },
          },
        },
      }),
      prisma.lessonSession.findMany({
        where: {
          actualRole: USER_ROLES.STUDENT,
          isPreview: false,
        },
        orderBy: {
          lastSeenAt: "desc",
        },
        take: 12,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ]);

  return {
    totalSessions,
    activeStudents: activeStudents.length,
    stalledSessions,
    latestSessions,
  };
}

export function getViewerRoleLabel(role: UserRole | null | undefined) {
  const labels: Record<UserRole, string> = {
    ADMIN: "Админ",
    AUTHOR: "Автор",
    CURATOR: "Куратор",
    SALES_MANAGER: "Продажи",
    STUDENT: "Студент",
  };

  if (!role) {
    return "Без роли";
  }

  return labels[role];
}
