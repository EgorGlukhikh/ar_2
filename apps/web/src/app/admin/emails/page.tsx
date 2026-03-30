import Link from "next/link";
import { Fragment } from "react";
import {
  Clock3,
  Eye,
  MailCheck,
  MailOpen,
  MailWarning,
  PauseCircle,
  PlayCircle,
  Send,
  Settings2,
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
  STUDENTS_ENROLLED_IN_COURSE: "Студенты выбранного курса",
  INACTIVE_STUDENTS: "Неактивные студенты",
  ALL_OPTED_IN_EXPERTS: "Все эксперты с согласием",
};

const requeueableStatuses = [
  EmailStatus.FAILED,
  EmailStatus.BOUNCED,
  EmailStatus.COMPLAINED,
  EmailStatus.CANCELED,
] as const;

const workspaceEmailModes = [
  {
    id: "email-test-section",
    eyebrow: "Режим 1",
    title: "Тест себе",
    description:
      "Проверка шаблона, темы, вёрстки и ссылок перед реальной отправкой.",
    metricLabel: "шаблонов",
    icon: MailOpen,
  },
  {
    id: "email-campaigns-section",
    eyebrow: "Режим 2",
    title: "Ручные рассылки",
    description:
      "Запуск кампаний по шаблону, курсу и сегменту без ручной вёрстки.",
    metricLabel: "кампаний",
    icon: Send,
  },
  {
    id: "email-log-section",
    eyebrow: "Режим 3",
    title: "Последние письма",
    description: "Журнал статусов, ошибок, попыток и повторной отправки.",
    metricLabel: "писем",
    icon: Eye,
  },
  {
    id: "email-settings-section",
    eyebrow: "Режим 4",
    title: "Настройки",
    description: "Проверка боевых параметров, reply-to и канала отправки.",
    metricLabel: "параметров",
    icon: Settings2,
  },
] as const;

function formatDateTime(value?: Date | null) {
  if (!value) {
    return "—";
  }

  return dateTimeFormatter.format(value);
}

function getAudienceLabel(audience: "student" | "expert" | "mixed") {
  switch (audience) {
    case "student":
      return "Студенты";
    case "expert":
      return "Эксперты";
    default:
      return "Смешанная аудитория";
  }
}

function getRecipientCategoryLabel(email: {
  kind: EmailKind;
  recipientSegment: EmailCampaignSegment | null;
  templateKey: string;
}) {
  if (email.kind === EmailKind.TRANSACTIONAL) {
    return "Сервисные";
  }

  if (email.recipientSegment) {
    return segmentLabelMap[email.recipientSegment];
  }

  const template =
    emailTemplateCatalogMap[email.templateKey as keyof typeof emailTemplateCatalogMap];

  if (!template) {
    return "Маркетинг";
  }

  return getAudienceLabel(template.audience);
}

type AdminEmailsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    kind?: string;
  }>;
};

export default async function AdminEmailsPage({
  searchParams,
}: AdminEmailsPageProps) {
  const user = await requireRoleAccess([USER_ROLES.ADMIN, USER_ROLES.SALES_MANAGER]);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const logQuery = resolvedSearchParams?.q?.trim() ?? "";
  const statusFilter = resolvedSearchParams?.status?.trim() ?? "all";
  const kindFilter = resolvedSearchParams?.kind?.trim() ?? "all";

  const [emailStats, emails, campaigns, courses, preferenceStats] = await Promise.all([
    prisma.emailMessage.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.emailMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        user: { select: { id: true, email: true, name: true } },
        course: { select: { id: true, title: true } },
        campaign: { select: { id: true, name: true, status: true } },
      },
    }),
    prisma.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        course: { select: { id: true, title: true } },
        createdBy: { select: { name: true, email: true } },
      },
    }),
    prisma.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, slug: true },
    }),
    prisma.emailPreference.groupBy({
      by: ["audienceType", "isMarketingEnabled"],
      _count: { _all: true },
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
  const filteredEmails = emails.filter((email) => {
    const matchesQuery =
      !logQuery ||
      [
        email.subject,
        email.toName,
        email.toEmail,
        email.templateKey,
        email.course?.title,
        email.campaign?.name,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(logQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || email.status === statusFilter;
    const matchesKind =
      kindFilter === "all" ||
      (kindFilter === "marketing" && email.kind === EmailKind.MARKETING) ||
      (kindFilter === "transactional" && email.kind === EmailKind.TRANSACTIONAL);

    return matchesQuery && matchesStatus && matchesKind;
  });
  const queuedCount = statsMap.get(EmailStatus.QUEUED) ?? 0;
  const sentCount =
    (statsMap.get(EmailStatus.SENT) ?? 0) + (statsMap.get(EmailStatus.DELIVERED) ?? 0);
  const openedCount =
    (statsMap.get(EmailStatus.OPENED) ?? 0) + (statsMap.get(EmailStatus.CLICKED) ?? 0);
  const failedCount =
    (statsMap.get(EmailStatus.FAILED) ?? 0) +
    (statsMap.get(EmailStatus.BOUNCED) ?? 0) +
    (statsMap.get(EmailStatus.COMPLAINED) ?? 0);

  const modeMetrics = {
    "email-test-section": emailTemplateCatalog.length,
    "email-campaigns-section": campaigns.length,
    "email-log-section": filteredEmails.length,
    "email-settings-section": 9,
  } as const;

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Почтовый центр"
        title="Сервисные письма и кампании платформы"
        description="Экран разделён на понятные рабочие зоны: отдельно тест себе, отдельно ручные рассылки, отдельно журнал последних писем и настройки контура."
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

      <div className="grid gap-4 xl:grid-cols-4">
        {workspaceEmailModes.map((mode) => {
          const Icon = mode.icon;

          return (
            <a
              key={mode.id}
              href={`#${mode.id}`}
              className="group rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-5 py-5 shadow-[var(--shadow-sm)] transition hover:-translate-y-[1px] hover:border-[var(--primary)] hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                    {mode.eyebrow}
                  </p>
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                    {mode.title}
                  </h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] transition group-hover:scale-[1.03]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{mode.description}</p>
              <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">
                {modeMetrics[mode.id]} {mode.metricLabel}
              </p>
            </a>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          label="В очереди"
          value={queuedCount}
          hint="Письма и кампании, которые уже созданы и ждут отправки."
          icon={Clock3}
        />
        <WorkspaceStatCard
          label="Отправлено"
          value={sentCount}
          hint="Письма, которые уже ушли в провайдер или были доставлены."
          icon={Send}
        />
        <WorkspaceStatCard
          label="Открыто"
          value={openedCount}
          hint="Открытия и клики по письмам, включая маркетинговые кампании."
          icon={Eye}
        />
        <WorkspaceStatCard
          label="Ошибки"
          value={failedCount}
          hint="Финальные ошибки доставки, возвраты и жалобы."
          icon={MailWarning}
        />
      </div>

      <WorkspacePanel
        eyebrow="Dashboard"
        title="Здоровье контура"
        description="Короткая сводка по подпискам, провайдеру отправки и базовым параметрам контура."
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
              {config.provider === "resend"
                ? "Resend"
                : config.provider === "smtp"
                  ? "SMTP"
                  : "Mock"}
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

      <div id="email-test-section" className="scroll-mt-24">
        <WorkspacePanel
          eyebrow="Шаблоны"
          title="1. Тест себе и preview"
          description={`Здесь ты просто проверяешь письмо на свою почту ${user.email ?? "текущего пользователя"}: как выглядит тема, HTML, ссылки и общий тон. Это отдельный режим тестирования, без запуска реальной кампании.`}
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
            <form
              action={sendTestEmailAction}
              className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Отправить тест себе
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Быстрая проверка HTML, темы и ссылок перед запуском кампании.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-template">Шаблон письма</Label>
                <Select
                  id="test-template"
                  name="templateKey"
                  defaultValue="campaign-course-launch"
                >
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
                    {template.requiresCourse ? (
                      <Badge variant="warning">Нужен курс</Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                    {template.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {template.description}
                  </p>
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/emails/preview?template=${template.key}`}>
                        Preview
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </WorkspacePanel>
      </div>

      <div id="email-campaigns-section" className="scroll-mt-24">
        <WorkspacePanel
          eyebrow="Кампании"
          title="2. Ручные рассылки"
          description="Здесь запускаются именно кампании: берём шаблон, выбираем курс, сегмент и время. Это отдельная операционная зона для маркетинговых рассылок."
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <form
              action={createEmailCampaignAction}
              className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Название кампании</Label>
                <Input
                  id="campaign-name"
                  name="name"
                  placeholder="Например: анонс нового курса по сделкам"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-template">Шаблон</Label>
                <Select
                  id="campaign-template"
                  name="templateKey"
                  defaultValue={manualCampaignTemplates[0]?.key}
                >
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
                  description="Создай первую ручную кампанию, чтобы протестировать сегменты, шаблоны и планирование отправки."
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
                          Шаблон:{" "}
                          {emailTemplateCatalogMap[
                            campaign.templateKey as keyof typeof emailTemplateCatalogMap
                          ]?.label ?? campaign.templateKey}
                          {campaign.course ? ` · курс «${campaign.course.title}»` : ""}
                        </p>
                        <p className="text-sm leading-6 text-[var(--muted)]">
                          Получателей: {campaign.recipientCount} · Создал:{" "}
                          {campaign.createdBy.name || campaign.createdBy.email}
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
                            <input
                              type="hidden"
                              name="templateKey"
                              value={campaign.templateKey}
                            />
                            <input type="hidden" name="segment" value={campaign.segment} />
                            <input
                              type="hidden"
                              name="courseId"
                              value={campaign.courseId ?? ""}
                            />
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
      </div>

      <div id="email-log-section" className="scroll-mt-24">
        <WorkspacePanel
          eyebrow="Журнал"
          title="3. Последние письма"
          description="Здесь видны сервисные письма, тестовые отправки, кампании, ошибки и история повторной отправки."
        >
          <div className="mb-5 flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 lg:flex-row lg:items-end lg:justify-between">
            <form action="/admin/emails" className="grid flex-1 gap-3 md:grid-cols-3">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="email-log-query">Поиск по теме, получателю или курсу</Label>
                <Input
                  id="email-log-query"
                  name="q"
                  defaultValue={logQuery}
                  placeholder="Например, Егор, welcome, курс или оплата"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-log-status">Статус</Label>
                <Select id="email-log-status" name="status" defaultValue={statusFilter}>
                  <option value="all">Все статусы</option>
                  {Object.entries(emailStatusLabelMap).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-log-kind">Тип письма</Label>
                <Select id="email-log-kind" name="kind" defaultValue={kindFilter}>
                  <option value="all">Все типы</option>
                  <option value="transactional">Сервисные</option>
                  <option value="marketing">Маркетинговые</option>
                </Select>
              </div>
              <div className="flex flex-wrap gap-3 md:col-span-3">
                <Button type="submit">Применить фильтры</Button>
                <Button asChild variant="outline">
                  <Link href="/admin/emails#email-log-section">Сбросить</Link>
                </Button>
              </div>
            </form>

            <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
              <p>Показано записей</p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                {filteredEmails.length}
              </p>
            </div>
          </div>

          {filteredEmails.length === 0 ? (
            <WorkspaceEmptyState
              title="Ничего не найдено"
              description="Попробуйте изменить поиск или снять часть фильтров. История писем остаётся в журнале, даже если текущая выборка пустая."
              className="border-[var(--border)] bg-[var(--surface)] shadow-none"
            />
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]">
              <div className="overflow-x-auto">
                <table className="min-w-[1080px] w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-strong)] text-left">
                      <th className="sticky top-0 z-10 bg-[var(--surface-strong)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        Дата и время
                      </th>
                      <th className="sticky top-0 z-10 bg-[var(--surface-strong)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        Тема
                      </th>
                      <th className="sticky top-0 z-10 bg-[var(--surface-strong)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        Получатель
                      </th>
                      <th className="sticky top-0 z-10 bg-[var(--surface-strong)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        Категория
                      </th>
                      <th className="sticky top-0 z-10 bg-[var(--surface-strong)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        Статус
                      </th>
                      <th className="sticky top-0 z-10 bg-[var(--surface-strong)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        Канал
                      </th>
                      <th className="sticky top-0 z-10 bg-[var(--surface-strong)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        Попытки
                      </th>
                      <th className="sticky top-0 z-10 bg-[var(--surface-strong)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        Действие
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmails.map((email) => {
                      const canRequeue = requeueableStatuses.includes(
                        email.status as (typeof requeueableStatuses)[number],
                      );
                      const template =
                        emailTemplateCatalogMap[
                          email.templateKey as keyof typeof emailTemplateCatalogMap
                        ];

                      return (
                        <Fragment key={email.id}>
                          <tr
                            className="border-b border-[var(--border)] align-top last:border-b-0"
                          >
                            <td className="px-4 py-4 text-sm text-[var(--foreground)]">
                              <div className="min-w-[180px]">
                                <p className="font-medium">{formatDateTime(email.createdAt)}</p>
                                <p className="mt-1 text-xs text-[var(--muted)]">
                                  Отправка: {formatDateTime(email.scheduledAt)}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="min-w-[300px] max-w-[420px] space-y-2">
                                <p className="font-semibold leading-6 text-[var(--foreground)]">
                                  {email.subject}
                                </p>
                                <p className="text-xs leading-5 text-[var(--muted)]">
                                  {template?.label ?? email.templateKey}
                                  {email.sequenceStep ? ` · шаг ${email.sequenceStep}` : ""}
                                  {email.course ? ` · курс «${email.course.title}»` : ""}
                                  {email.campaign ? ` · кампания «${email.campaign.name}»` : ""}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="min-w-[220px] space-y-1">
                                <p className="font-medium text-[var(--foreground)]">
                                  {email.toName || "Без имени"}
                                </p>
                                <p className="text-xs text-[var(--muted)]">{email.toEmail}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="min-w-[220px] space-y-2">
                                <Badge variant="neutral">
                                  {getRecipientCategoryLabel(email)}
                                </Badge>
                                {email.kind === EmailKind.MARKETING ? (
                                  <p className="text-xs text-[var(--muted)]">
                                    {template?.category === "campaign"
                                      ? "Ручная рассылка"
                                      : "Автоматическая цепочка"}
                                  </p>
                                ) : (
                                  <p className="text-xs text-[var(--muted)]">
                                    Сервисное письмо платформы
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="min-w-[150px] space-y-2">
                                <Badge variant={emailStatusVariantMap[email.status]}>
                                  {emailStatusLabelMap[email.status]}
                                </Badge>
                                <p className="text-xs text-[var(--muted)]">
                                  Доставлено: {formatDateTime(email.deliveredAt)}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="min-w-[110px] space-y-2">
                                <Badge variant="neutral">
                                  {emailProviderLabelMap[email.provider]}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-[var(--foreground)]">
                              <div className="min-w-[90px]">
                                {email.attemptCount}/{email.maxAttempts}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="min-w-[190px]">
                                {canRequeue ? (
                                  <form action={requeueEmailMessageAction}>
                                    <input type="hidden" name="messageId" value={email.id} />
                                    <Button type="submit" variant="outline" size="sm">
                                      <MailCheck className="mr-2 h-4 w-4" />
                                      Повторить
                                    </Button>
                                  </form>
                                ) : (
                                  <span className="text-xs text-[var(--muted)]">
                                    Повтор не нужен
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                          {email.lastError ? (
                            <tr className="border-b border-[var(--border)] last:border-b-0">
                              <td colSpan={8} className="px-4 pb-4">
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                                  {email.lastError}
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </WorkspacePanel>
      </div>

      <div id="email-settings-section" className="scroll-mt-24">
        <WorkspacePanel
          eyebrow="Настройки"
          title="4. Боевые параметры контура"
          description="То, что должно быть настроено на Railway и в канале отправки, чтобы сервис работал как production email-слой."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              {
                label: "EMAIL_PROVIDER",
                value: config.provider,
                ok: config.provider === "resend" || config.provider === "smtp",
              },
              {
                label: "RESEND_API_KEY",
                value:
                  config.provider === "resend"
                    ? config.hasResendApiKey
                      ? "подключен"
                      : "не задан"
                    : "не нужен для текущего провайдера",
                ok: config.provider === "resend" ? config.hasResendApiKey : true,
              },
              {
                label: "RESEND_FROM_EMAIL",
                value:
                  config.provider === "resend"
                    ? config.hasResendFromEmail
                      ? "подключен"
                      : "не задан"
                    : "не нужен для текущего провайдера",
                ok: config.provider === "resend" ? config.hasResendFromEmail : true,
              },
              {
                label: "RESEND_WEBHOOK_SECRET",
                value:
                  config.provider === "resend"
                    ? config.hasResendWebhookSecret
                      ? "подключен"
                      : "не задан"
                    : "не нужен для текущего провайдера",
                ok: config.provider === "resend" ? config.hasResendWebhookSecret : true,
              },
              {
                label: "SMTP_HOST",
                value:
                  config.provider === "smtp"
                    ? config.hasSmtpHost
                      ? "подключен"
                      : "не задан"
                    : "не нужен для текущего провайдера",
                ok: config.provider === "smtp" ? config.hasSmtpHost : true,
              },
              {
                label: "SMTP_USER",
                value:
                  config.provider === "smtp"
                    ? config.hasSmtpUser
                      ? "подключен"
                      : "не задан"
                    : "не нужен для текущего провайдера",
                ok: config.provider === "smtp" ? config.hasSmtpUser : true,
              },
              {
                label: "SMTP_PASSWORD",
                value:
                  config.provider === "smtp"
                    ? config.hasSmtpPassword
                      ? "подключен"
                      : "не задан"
                    : "не нужен для текущего провайдера",
                ok: config.provider === "smtp" ? config.hasSmtpPassword : true,
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
                <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </section>
  );
}
