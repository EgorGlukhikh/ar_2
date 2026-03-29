import Link from "next/link";
import {
  Clock3,
  Eye,
  MailCheck,
  MailWarning,
  PauseCircle,
  PlayCircle,
  Send,
} from "lucide-react";

import {
  EmailCampaignSegment,
  EmailCampaignStatus,
  EmailKind,
  EmailStatus,
  prisma,
} from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import {
  cancelEmailCampaignAction,
  createEmailCampaignAction,
  pauseEmailCampaignAction,
  processEmailQueueNow,
  requeueEmailMessageAction,
  sendTestEmailAction,
} from "@/features/email/actions";
import { getEmailSystemConfig } from "@/features/email/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
import {
  emailTemplateCatalog,
  emailTemplateCatalogMap,
  manualCampaignTemplates,
} from "@/lib/email/catalog";
import { requireRoleAccess } from "@/lib/admin";

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

const campaignStatusLabelMap: Record<EmailCampaignStatus, string> = {
  DRAFT: "Черновик",
  SCHEDULED: "Запланирована",
  ACTIVE: "Активна",
  PAUSED: "На паузе",
  COMPLETED: "Завершена",
  CANCELED: "Отменена",
};

const campaignStatusVariantMap: Record<
  EmailCampaignStatus,
  "default" | "neutral" | "success" | "warning"
> = {
  DRAFT: "neutral",
  SCHEDULED: "neutral",
  ACTIVE: "default",
  PAUSED: "warning",
  COMPLETED: "success",
  CANCELED: "warning",
};

const segmentLabelMap: Record<EmailCampaignSegment, string> = {
  ALL_OPTED_IN_STUDENTS: "Все студенты с согласием",
  STUDENTS_WITHOUT_PURCHASE: "Студенты без покупки",
  STUDENTS_WITH_PURCHASE: "Студенты с покупкой",
  STUDENTS_ENROLLED_IN_COURSE: "Студенты конкретного курса",
  INACTIVE_STUDENTS: "Неактивные студенты",
  ALL_OPTED_IN_EXPERTS: "Все эксперты с согласием",
};

const requeueableStatuses = [
  EmailStatus.FAILED,
  EmailStatus.BOUNCED,
  EmailStatus.COMPLAINED,
  EmailStatus.CANCELED,
] as const;

function formatDateTime(value?: Date | null) {
  if (!value) {
    return "—";
  }

  return dateTimeFormatter.format(value);
}

export default async function AdminEmailsPage() {
  const user = await requireRoleAccess([USER_ROLES.ADMIN, USER_ROLES.SALES_MANAGER]);

  const [emailStats, emails, campaigns, courses, preferenceStats] = await Promise.all([
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
      take: 30,
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
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    }),
    prisma.emailCampaign.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.course.findMany({
      orderBy: {
        title: "asc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    }),
    prisma.emailPreference.groupBy({
      by: ["audienceType", "isMarketingEnabled"],
      _count: {
        _all: true,
      },
    }),
  ]);

  const statsMap = new Map(emailStats.map((item) => [item.status, item._count._all]));
  const preferenceMap = new Map(
    preferenceStats.map((item) => [
      `${item.audienceType}:${item.isMarketingEnabled}`,
      item._count._all,
    ]),
  );

  const config = getEmailSystemConfig();

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Почтовый центр"
        title="Сервисные письма и кампании платформы"
        description="Здесь собраны здоровье отправки, шаблоны, ручные кампании, тестовые письма и журнал событий. Сервисные письма и маркетинговые рассылки живут в одном контуре, но управляются отдельно."
        actions={
          <>
            <form action={processEmailQueueNow} className="contents">
              <Button type="submit">Обработать очередь сейчас</Button>
            </form>
            <Button asChild variant="outline">
              <Link href="/admin/emails/preview">Открыть preview</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          label="В очереди"
          value={statsMap.get(EmailStatus.QUEUED) ?? 0}
          hint="Письма и кампании, которые уже созданы и ждут отправки."
          icon={Clock3}
        />
        <WorkspaceStatCard
          label="Доставлено"
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
          hint="Открытия и клики по письмам, включая маркетинговые кампании."
          icon={Eye}
        />
        <WorkspaceStatCard
          label="Ошибки"
          value={
            (statsMap.get(EmailStatus.FAILED) ?? 0) +
            (statsMap.get(EmailStatus.BOUNCED) ?? 0) +
            (statsMap.get(EmailStatus.COMPLAINED) ?? 0)
          }
          hint="Финальные ошибки доставки, возвраты и жалобы."
          icon={MailWarning}
        />
      </div>

      <WorkspacePanel
        eyebrow="Dashboard"
        title="Здоровье контура"
        description="Сводка по подпискам, конфигурации отправки и боевым точкам контура."
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Студенты с согласием
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              {preferenceMap.get("STUDENT:true") ?? 0}
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Эксперты с согласием
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              {preferenceMap.get("EXPERT:true") ?? 0}
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Провайдер
            </p>
            <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
              {config.provider === "resend" ? "Resend" : "Mock"}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{config.sender.fromEmail}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Reply-to
            </p>
            <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
              {config.replyTo.replyToEmail}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{config.replyTo.replyToName}</p>
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        eyebrow="Шаблоны"
        title="Тестовая отправка и preview"
        description={`Тестовые письма отправляются на ${user.email ?? "email текущего пользователя"}. Шаблоны фиксированные, безопасные и привязаны к стилю платформы.`}
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <form action={sendTestEmailAction} className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Отправить тест себе</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Быстрая проверка HTML, темы и ссылок перед запуском кампании.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-template">Шаблон письма</Label>
              <Select id="test-template" name="templateKey" defaultValue="campaign-course-launch">
                {emailTemplateCatalog.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-course">Курс для подстановки</Label>
              <Select id="test-course" name="courseId" defaultValue="">
                <option value="">Без курса</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </Select>
            </div>

            <Button type="submit" className="w-full justify-center">
              Отправить тестовое письмо
            </Button>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            {emailTemplateCatalog.map((template) => (
              <article
                key={template.key}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">{template.category}</Badge>
                  <Badge variant="neutral">{template.audience}</Badge>
                  {template.requiresCourse ? <Badge variant="warning">Нужен курс</Badge> : null}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                  {template.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {template.description}
                </p>
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/emails/preview?template=${template.key}`}>Preview</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        eyebrow="Кампании"
        title="Ручные рассылки по шаблону, курсу и сегменту"
        description="Для v1 кампании создаются безопасно: шаблон, курс, сегмент и время отправки. Свободного редактора пока нет — это снижает риск ошибок в верстке и логике."
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <form action={createEmailCampaignAction} className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Название кампании</Label>
              <Input
                id="campaign-name"
                name="name"
                placeholder="Например: Анонс нового курса по сделкам"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-template">Шаблон</Label>
              <Select id="campaign-template" name="templateKey" defaultValue={manualCampaignTemplates[0]?.key}>
                {manualCampaignTemplates.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-course">Курс</Label>
              <Select id="campaign-course" name="courseId" defaultValue="">
                <option value="">Не подставлять курс</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-segment">Сегмент</Label>
              <Select
                id="campaign-segment"
                name="segment"
                defaultValue={EmailCampaignSegment.ALL_OPTED_IN_STUDENTS}
              >
                {Object.entries(segmentLabelMap).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-scheduled-at">Отложить отправку</Label>
              <Input id="campaign-scheduled-at" name="scheduledAt" type="datetime-local" />
            </div>

            <Button type="submit" className="w-full justify-center">
              Создать кампанию
            </Button>
          </form>

          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <WorkspaceEmptyState
                title="Кампаний пока нет"
                description="Создайте первую ручную кампанию, чтобы протестировать сегменты, шаблоны и планирование отправки."
                className="border-[var(--border)] bg-[var(--surface)] shadow-none"
              />
            ) : (
              campaigns.map((campaign) => (
                <article
                  key={campaign.id}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={campaignStatusVariantMap[campaign.status]}>
                          {campaignStatusLabelMap[campaign.status]}
                        </Badge>
                        <Badge variant="neutral">
                          {segmentLabelMap[campaign.segment]}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {campaign.name}
                      </h3>
                      <p className="text-sm leading-6 text-[var(--muted)]">
                        Шаблон: {emailTemplateCatalogMap[campaign.templateKey as keyof typeof emailTemplateCatalogMap]?.label ?? campaign.templateKey}
                        {campaign.course ? ` · курс «${campaign.course.title}»` : ""}
                      </p>
                      <p className="text-sm leading-6 text-[var(--muted)]">
                        Получателей: {campaign.recipientCount} · Создал: {campaign.createdBy.name || campaign.createdBy.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {campaign.status === EmailCampaignStatus.ACTIVE ||
                      campaign.status === EmailCampaignStatus.SCHEDULED ? (
                        <form action={pauseEmailCampaignAction}>
                          <input type="hidden" name="campaignId" value={campaign.id} />
                          <Button type="submit" variant="outline" size="sm">
                            <PauseCircle className="mr-2 h-4 w-4" />
                            Пауза
                          </Button>
                        </form>
                      ) : null}
                      {campaign.status === EmailCampaignStatus.PAUSED ? (
                        <form action={createEmailCampaignAction}>
                          <input type="hidden" name="name" value={campaign.name} />
                          <input type="hidden" name="templateKey" value={campaign.templateKey} />
                          <input type="hidden" name="segment" value={campaign.segment} />
                          <input type="hidden" name="courseId" value={campaign.courseId ?? ""} />
                          <input type="hidden" name="scheduledAt" value="" />
                          <Button type="submit" size="sm">
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Дублировать и запустить
                          </Button>
                        </form>
                      ) : null}
                      {campaign.status !== EmailCampaignStatus.CANCELED &&
                      campaign.status !== EmailCampaignStatus.COMPLETED ? (
                        <form action={cancelEmailCampaignAction}>
                          <input type="hidden" name="campaignId" value={campaign.id} />
                          <Button type="submit" variant="outline" size="sm">
                            Отменить
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p className="text-sm text-[var(--muted)]">Создана</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {formatDateTime(campaign.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p className="text-sm text-[var(--muted)]">Запланирована</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {formatDateTime(campaign.scheduledAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <p className="text-sm text-[var(--muted)]">Завершена</p>
                      <p className="mt-1 font-medium text-[var(--foreground)]">
                        {formatDateTime(campaign.completedAt)}
                      </p>
                    </div>
                  </div>

                  {campaign.lastError ? (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                      {campaign.lastError}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        eyebrow="Журнал"
        title="Последние письма"
        description="Здесь видны и транзакционные письма, и рассылки из кампаний, и автоматические цепочки."
      >
        {emails.length === 0 ? (
          <WorkspaceEmptyState
            title="Пока нет писем"
            description="После первых тестовых отправок, кампаний и сервисных событий здесь начнет собираться полная история сообщений."
            className="border-[var(--border)] bg-[var(--surface)] shadow-none"
          />
        ) : (
          <div className="space-y-4">
            {emails.map((email) => {
              const canRequeue = requeueableStatuses.includes(
                email.status as (typeof requeueableStatuses)[number],
              );

              return (
                <article
                  key={email.id}
                  className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={emailStatusVariantMap[email.status]}>
                          {emailStatusLabelMap[email.status]}
                        </Badge>
                        <Badge variant="neutral">
                          {email.kind === EmailKind.MARKETING ? "Маркетинг" : "Уведомление"}
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
                        {email.campaign ? ` · кампания «${email.campaign.name}»` : ""}
                      </p>
                    </div>

                    <div className="space-y-3 lg:min-w-[320px]">
                      <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                          <p>Создано</p>
                          <p className="mt-1 font-medium text-[var(--foreground)]">
                            {formatDateTime(email.createdAt)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                          <p>Отправка</p>
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
                          <p>Попытки</p>
                          <p className="mt-1 font-medium text-[var(--foreground)]">
                            {email.attemptCount}/{email.maxAttempts}
                          </p>
                        </div>
                      </div>

                      {canRequeue ? (
                        <form action={requeueEmailMessageAction}>
                          <input type="hidden" name="messageId" value={email.id} />
                          <Button type="submit" variant="outline" size="sm">
                            <MailCheck className="mr-2 h-4 w-4" />
                            Поставить в очередь снова
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>

                  {email.lastError ? (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                      {email.lastError}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </WorkspacePanel>

      <WorkspacePanel
        eyebrow="Настройки"
        title="Боевые параметры контура"
        description="То, что должно быть настроено на Railway и в домене отправки, чтобы сервис работал как production email-слой."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            {
              label: "EMAIL_PROVIDER",
              value: config.provider,
              ok: config.provider === "resend",
            },
            {
              label: "RESEND_API_KEY",
              value: config.hasResendApiKey ? "подключен" : "не задан",
              ok: config.hasResendApiKey,
            },
            {
              label: "RESEND_FROM_EMAIL",
              value: config.hasResendFromEmail ? "подключен" : "не задан",
              ok: config.hasResendFromEmail,
            },
            {
              label: "RESEND_WEBHOOK_SECRET",
              value: config.hasResendWebhookSecret ? "подключен" : "не задан",
              ok: config.hasResendWebhookSecret,
            },
            {
              label: "CRON_SECRET",
              value: config.hasCronSecret ? "подключен" : "не задан",
              ok: config.hasCronSecret,
            },
            {
              label: "APP_BASE_URL",
              value: config.appBaseUrl,
              ok: true,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {item.label}
                </p>
                <Badge variant={item.ok ? "success" : "warning"}>
                  {item.ok ? "ok" : "нужно"}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">{item.value}</p>
            </div>
          ))}
        </div>
      </WorkspacePanel>
    </section>
  );
}
