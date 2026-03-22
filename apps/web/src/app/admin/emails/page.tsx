import Link from "next/link";
import { Clock3, Eye, MailWarning, Send } from "lucide-react";

import { EmailKind, EmailStatus, prisma } from "@academy/db";

import { processEmailQueueNow } from "@/features/email/actions";
import { processDueEmailQueue } from "@/features/email/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";
import {
  emailProviderLabelMap,
  emailStatusLabelMap,
  emailStatusVariantMap,
} from "@/lib/labels";

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

export default async function AdminEmailsPage() {
  await processDueEmailQueue();

  const [emailStats, emails] = await Promise.all([
    prisma.emailMessage.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
    prisma.emailMessage.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ]);

  const statsMap = new Map(
    emailStats.map((item) => [item.status, item._count._all]),
  );

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Почтовый центр"
        title="Уведомления и маркетинговые письма"
        description="Здесь видно, какие письма уже ушли студентам, что стоит в очереди, что было доставлено и какие письма уже открывали."
        actions={
          <>
            <form action={processEmailQueueNow}>
              <Button type="submit">Обработать очередь сейчас</Button>
            </form>
            <Button asChild variant="outline">
              <Link href="/catalog">Проверить витрину</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          label="В очереди"
          value={statsMap.get(EmailStatus.QUEUED) ?? 0}
          hint="Письма, которые уже созданы и ждут своей отправки."
          icon={Clock3}
        />
        <WorkspaceStatCard
          label="Отправлено"
          value={
            (statsMap.get(EmailStatus.SENT) ?? 0) +
            (statsMap.get(EmailStatus.DELIVERED) ?? 0)
          }
          hint="Письма, которые уже ушли в провайдер или были доставлены."
          icon={Send}
        />
        <WorkspaceStatCard
          label="Открыто"
          value={
            (statsMap.get(EmailStatus.OPENED) ?? 0) +
            (statsMap.get(EmailStatus.CLICKED) ?? 0)
          }
          hint="Письма, у которых зафиксировано открытие или клик."
          icon={Eye}
        />
        <WorkspaceStatCard
          label="Ошибки"
          value={
            (statsMap.get(EmailStatus.FAILED) ?? 0) +
            (statsMap.get(EmailStatus.BOUNCED) ?? 0) +
            (statsMap.get(EmailStatus.COMPLAINED) ?? 0)
          }
          hint="Письма, которые не дошли или вызвали негативный статус."
          icon={MailWarning}
        />
      </div>

      <WorkspacePanel
        eyebrow="История отправок"
        title="Последние письма"
        description="В этом списке видны и служебные уведомления студенту, и письма из 5-шаговой маркетинговой цепочки."
      >
        {emails.length === 0 ? (
          <WorkspaceEmptyState
            title="Пока нет писем"
            description="После создания студентов, выдачи доступа или оплаты курсов здесь начнет собираться полная история писем."
            className="border-[var(--border)] bg-[var(--surface)] shadow-none"
          />
        ) : (
          <div className="space-y-4">
            {emails.map((email) => (
              <article
                key={email.id}
                className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={emailStatusVariantMap[email.status]}>
                        {emailStatusLabelMap[email.status]}
                      </Badge>
                      <Badge variant="neutral">
                        {email.kind === EmailKind.MARKETING
                          ? "Маркетинг"
                          : "Уведомление"}
                      </Badge>
                      <Badge variant="neutral">
                        {emailProviderLabelMap[email.provider]}
                      </Badge>
                    </div>

                    <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                      {email.subject}
                    </h2>
                    <p className="text-sm text-[var(--muted)]">
                      Кому: {email.toName ? `${email.toName} · ` : ""}
                      {email.toEmail}
                    </p>
                    <p className="text-sm leading-7 text-[var(--muted)]">
                      Шаблон: {email.templateKey}
                      {email.sequenceStep ? ` · шаг ${email.sequenceStep}` : ""}
                      {email.course ? ` · курс «${email.course.title}»` : ""}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2 lg:min-w-[320px]">
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p>Создано</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {formatDateTime(email.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p>Запланировано</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {formatDateTime(email.scheduledAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p>Доставлено</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {formatDateTime(email.deliveredAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p>Открыто</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {formatDateTime(email.openedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {email.lastError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                    {email.lastError}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </WorkspacePanel>

      <WorkspacePanel
        eyebrow="Что уже собрано"
        title="Почтовый слой платформы"
        description="Сейчас система уже умеет слать служебные письма студенту и отдельную маркетинговую цепочку из 5 сообщений."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {[
            "Создание учетной записи студента с данными для входа.",
            "Уведомление об открытии доступа к курсу.",
            "Письмо после успешной оплаты и автоматической выдачи доступа.",
            "Маркетинговая цепочка из 5 писем с задержками по дням.",
            "Статусы очереди, отправки, доставленности и открытий.",
            "Готовый маршрут для webhook от Resend и собственная фиксация открытий и переходов.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-7 text-[var(--muted)]"
            >
              {item}
            </div>
          ))}
        </div>
      </WorkspacePanel>
    </section>
  );
}
