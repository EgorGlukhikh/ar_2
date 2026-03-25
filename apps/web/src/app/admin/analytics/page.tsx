import Link from "next/link";
import { Activity, ChartColumnIncreasing, CirclePause, GraduationCap } from "lucide-react";

import { USER_ROLES, type UserRole } from "@academy/shared";
import { prisma } from "@academy/db";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";
import { getStudentAnalyticsSummary, getViewerRoleLabel } from "@/features/analytics/service";
import { requireAdminUser } from "@/lib/admin";

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

function formatSeconds(value?: number | null) {
  if (!value || value <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getStateLabel(state?: string | null) {
  if (!state) {
    return "Без сигнала";
  }

  const labels: Record<string, string> = {
    playing: "Идет просмотр",
    paused: "На паузе",
    stopped: "Остановлено",
    completed: "Просмотрено до конца",
  };

  return labels[state] ?? state;
}

export default async function AdminAnalyticsPage() {
  await requireAdminUser();

  const [summary, playStateEvents, completionEvents] = await Promise.all([
    getStudentAnalyticsSummary(),
    prisma.lessonSessionEvent.count({
      where: {
        eventType: "player_state",
        lessonSession: {
          actualRole: USER_ROLES.STUDENT,
          isPreview: false,
        },
      },
    }),
    prisma.lessonSessionEvent.count({
      where: {
        eventType: "player_complete",
        lessonSession: {
          actualRole: USER_ROLES.STUDENT,
          isPreview: false,
        },
      },
    }),
  ]);

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Поведенческая аналитика"
        title="Как студенты реально проходят уроки"
        description="Здесь видно, кто открыл урок, где остановился, были ли паузы, закрытие страницы и как часто студенты доходят до конца. Сессии команды в режиме просмотра из этой статистики исключены."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/students">Открыть студентов</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          label="Сессии уроков"
          value={summary.totalSessions}
          hint="Все реальные открытия уроков студентами без режимов просмотра команды."
          icon={Activity}
        />
        <WorkspaceStatCard
          label="Активные студенты"
          value={summary.activeStudents}
          hint="Уникальные студенты, которые заходили в уроки за последние 7 дней."
          icon={GraduationCap}
        />
        <WorkspaceStatCard
          label="Паузы и выходы"
          value={summary.stalledSessions}
          hint="Сессии, где студент не дошел до конца и завершил просмотр раньше."
          icon={CirclePause}
        />
        <WorkspaceStatCard
          label="Дошли до конца"
          value={completionEvents}
          hint={`Зафиксированные завершения видео. Событий смены состояния: ${playStateEvents}.`}
          icon={ChartColumnIncreasing}
        />
      </div>

      <WorkspacePanel
        eyebrow="Последние сигналы"
        title="Свежая лента прохождения"
        description="Эта таблица показывает последних студентов, их курс, урок и точку, на которой оборвался или закончился просмотр."
      >
        {summary.latestSessions.length === 0 ? (
          <WorkspaceEmptyState
            title="Пока нет реальных сессий"
            description="После первых просмотров уроков студентами здесь появится аналитическая лента."
            className="border-[var(--border)] bg-[var(--surface)] shadow-none"
          />
        ) : (
          <div className="space-y-4">
            {summary.latestSessions.map((session) => (
              <article
                key={session.id}
                className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={session.endedAt ? "warning" : "success"}>
                        {session.endedAt ? "Сессия завершена" : "Идет просмотр"}
                      </Badge>
                      <Badge variant="neutral">
                        {getViewerRoleLabel(session.actualRole as UserRole)}
                      </Badge>
                      {session.sourceType ? (
                        <Badge variant="neutral">{session.sourceType}</Badge>
                      ) : null}
                    </div>

                    <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                      {session.lesson.title}
                    </h2>

                    <p className="text-sm text-[var(--muted)]">
                      {session.user.name || session.user.email} · {session.course.title}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2 lg:min-w-[360px]">
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p>Последняя точка</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {formatSeconds(session.lastPositionSeconds)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p>Максимум просмотра</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {formatSeconds(session.maxPositionSeconds)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p>Состояние</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {getStateLabel(session.lastPlayerState)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p>Последняя активность</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {formatDateTime(session.lastSeenAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {session.exitReason ? (
                    <Badge variant="warning">Выход: {session.exitReason}</Badge>
                  ) : null}
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/learning/courses/${session.course.id}?lessonId=${session.lesson.id}`}>
                      Открыть урок
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </WorkspacePanel>
    </section>
  );
}
