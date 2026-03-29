import { randomBytes } from "node:crypto";

import {
  EmailAudienceType,
  EmailCampaignSegment,
  EmailCampaignStatus,
  EmailKind,
  EmailProviderType,
  EmailStatus,
  EnrollmentStatus,
  OrderStatus,
  Prisma,
  prisma,
  type Course,
  type Order,
  type User,
} from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { emailTemplateCatalogMap, type EmailTemplateKey } from "@/lib/email/catalog";
import { getEmailProvider } from "@/lib/email/provider";
import {
  renderCourseAccessGrantedTemplate,
  renderPaymentSuccessTemplate,
  renderStudentAccountCreatedTemplate,
  renderTemplateByKey,
} from "@/lib/email/templates";

const EMAIL_QUEUE_THROTTLE_MS = 45_000;
const DEFAULT_MAX_ATTEMPTS = 3;
const queuedEmailStatuses = [EmailStatus.QUEUED, EmailStatus.SENDING] as const;

let lastQueueRunAt = 0;

type QueueEmailInput = {
  userId?: string;
  courseId?: string;
  orderId?: string;
  campaignId?: string;
  kind: EmailKind;
  templateKey: string;
  campaignKey?: string;
  recipientSegment?: EmailCampaignSegment;
  sequenceStep?: number;
  dedupeKey?: string;
  trackingToken?: string;
  subject: string;
  preheader?: string;
  toEmail: string;
  toName?: string | null;
  htmlBody: string;
  textBody?: string;
  scheduledAt?: Date;
  nextAttemptAt?: Date | null;
  replyToEmail?: string | null;
  replyToName?: string | null;
  maxAttempts?: number;
  metadata?: Record<string, unknown>;
};

type ProcessQueueOptions = {
  force?: boolean;
  limit?: number;
};

type RecipientSummary = {
  id: string;
  email: string;
  name: string | null;
};

function getAppBaseUrl() {
  return (
    process.env.APP_BASE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function buildAbsolutePath(path: string) {
  return `${getAppBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function createTrackingToken() {
  return randomBytes(18).toString("hex");
}

function createPreferenceToken() {
  return randomBytes(24).toString("hex");
}

function mapProviderNameToDb(name: "mock" | "resend") {
  return name === "resend" ? EmailProviderType.RESEND : EmailProviderType.MOCK;
}

function getConfiguredProviderName() {
  return (process.env.EMAIL_PROVIDER || "mock").toLowerCase() === "resend"
    ? "resend"
    : "mock";
}

function getEmailSender() {
  const fromEmail =
    process.env.EMAIL_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "academy@example.com";
  const fromName = process.env.EMAIL_FROM_NAME || "Академия риэлторов";

  return {
    fromEmail,
    fromName,
  };
}

function getEmailReplyTo() {
  const sender = getEmailSender();
  const replyToEmail =
    process.env.EMAIL_REPLY_TO_EMAIL?.trim() ||
    process.env.SUPPORT_EMAIL?.trim() ||
    sender.fromEmail;
  const replyToName =
    process.env.EMAIL_REPLY_TO_NAME?.trim() ||
    process.env.EMAIL_FROM_NAME?.trim() ||
    sender.fromName;

  return {
    replyToEmail,
    replyToName,
  };
}

function buildTrackedUrl(trackingToken: string, targetUrl: string) {
  return `${getAppBaseUrl()}/api/email/click/${trackingToken}?url=${encodeURIComponent(
    targetUrl,
  )}`;
}

function buildOpenPixel(trackingToken: string) {
  return `${getAppBaseUrl()}/api/email/open/${trackingToken}`;
}

function appendTrackingPixel(html: string, trackingToken: string) {
  return `${html}<img src="${buildOpenPixel(
    trackingToken,
  )}" alt="" width="1" height="1" style="display:block;width:1px;height:1px;border:0;opacity:0;" />`;
}

function addDays(baseDate: Date, days: number) {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
}

function addMinutes(baseDate: Date, minutes: number) {
  return new Date(baseDate.getTime() + minutes * 60_000);
}

function getRetryDelayMinutes(attempt: number) {
  return Math.min(60, Math.max(5, attempt * 10));
}

function extractEventTimestamp(payload: Record<string, unknown>) {
  const raw =
    (payload.created_at as string | undefined) ||
    ((payload.data as Record<string, unknown> | undefined)?.created_at as string | undefined);

  if (!raw) {
    return new Date();
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function queueEmailMessage(input: QueueEmailInput) {
  if (input.dedupeKey) {
    const existing = await prisma.emailMessage.findUnique({
      where: {
        dedupeKey: input.dedupeKey,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return existing;
    }
  }

  const trackingToken = input.trackingToken ?? createTrackingToken();
  const sender = getEmailSender();

  return prisma.emailMessage.create({
    data: {
      userId: input.userId,
      courseId: input.courseId,
      orderId: input.orderId,
      campaignId: input.campaignId,
      kind: input.kind,
      templateKey: input.templateKey,
      campaignKey: input.campaignKey,
      recipientSegment: input.recipientSegment,
      sequenceStep: input.sequenceStep,
      dedupeKey: input.dedupeKey,
      trackingToken,
      provider: mapProviderNameToDb(getConfiguredProviderName()),
      status: EmailStatus.QUEUED,
      subject: input.subject,
      preheader: input.preheader,
      fromEmail: sender.fromEmail,
      fromName: sender.fromName,
      replyToEmail: input.replyToEmail ?? undefined,
      replyToName: input.replyToName ?? undefined,
      toEmail: input.toEmail,
      toName: input.toName ?? undefined,
      htmlBody: appendTrackingPixel(input.htmlBody, trackingToken),
      textBody: input.textBody,
      scheduledAt: input.scheduledAt ?? new Date(),
      nextAttemptAt: input.nextAttemptAt ?? null,
      maxAttempts: input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      metadata: (input.metadata as Prisma.JsonObject | undefined) ?? undefined,
      events: {
        create: {
          eventType: "queued",
          status: EmailStatus.QUEUED,
          payload: {
            templateKey: input.templateKey,
            campaignKey: input.campaignKey ?? null,
          } satisfies Prisma.JsonObject,
        },
      },
    },
    select: {
      id: true,
    },
  });
}

export async function ensureEmailPreference(input: {
  userId: string;
  audienceType: EmailAudienceType;
  enableMarketing?: boolean;
  source?: string;
  consentText?: string;
}) {
  const existing = await prisma.emailPreference.findUnique({
    where: {
      userId: input.userId,
    },
  });

  const now = new Date();

  if (!existing) {
    return prisma.emailPreference.create({
      data: {
        userId: input.userId,
        audienceType: input.audienceType,
        isMarketingEnabled: input.enableMarketing ?? false,
        marketingSource: input.source,
        consentText: input.consentText,
        subscribedAt: input.enableMarketing ? now : null,
        unsubscribedAt: input.enableMarketing ? null : now,
        preferenceToken: createPreferenceToken(),
      },
    });
  }

  const nextEnable =
    input.enableMarketing === undefined ? existing.isMarketingEnabled : input.enableMarketing;

  return prisma.emailPreference.update({
    where: {
      id: existing.id,
    },
    data: {
      audienceType: input.audienceType,
      isMarketingEnabled: nextEnable,
      marketingSource: input.source ?? existing.marketingSource,
      consentText: input.consentText ?? existing.consentText,
      subscribedAt: nextEnable
        ? existing.subscribedAt ?? now
        : existing.subscribedAt,
      unsubscribedAt: nextEnable ? null : now,
    },
  });
}

export async function getEmailPreferenceByToken(preferenceToken: string) {
  return prisma.emailPreference.findUnique({
    where: {
      preferenceToken,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });
}

export async function updateEmailPreferenceForUser(input: {
  userId: string;
  enabled: boolean;
  audienceType?: EmailAudienceType;
  source: string;
  consentText?: string;
}) {
  const existing = await prisma.user.findUniqueOrThrow({
    where: {
      id: input.userId,
    },
    select: {
      role: true,
      emailPreference: true,
    },
  });

  const audienceType =
    input.audienceType ??
    existing.emailPreference?.audienceType ??
    (existing.role === USER_ROLES.AUTHOR ? EmailAudienceType.EXPERT : EmailAudienceType.STUDENT);

  return ensureEmailPreference({
    userId: input.userId,
    audienceType,
    enableMarketing: input.enabled,
    source: input.source,
    consentText: input.consentText,
  });
}

export async function updateEmailPreferenceByToken(input: {
  preferenceToken: string;
  enabled: boolean;
  source: string;
  consentText?: string;
}) {
  const preference = await prisma.emailPreference.findUniqueOrThrow({
    where: {
      preferenceToken: input.preferenceToken,
    },
  });

  const now = new Date();

  return prisma.emailPreference.update({
    where: {
      id: preference.id,
    },
    data: {
      isMarketingEnabled: input.enabled,
      marketingSource: input.source,
      consentText: input.consentText ?? preference.consentText,
      subscribedAt: input.enabled ? preference.subscribedAt ?? now : preference.subscribedAt,
      unsubscribedAt: input.enabled ? null : now,
    },
  });
}

async function getMarketingPreferenceForUser(userId: string) {
  return prisma.emailPreference.findUnique({
    where: {
      userId,
    },
  });
}

function getAudienceTypeForRole(role?: string | null) {
  return role === USER_ROLES.AUTHOR ? EmailAudienceType.EXPERT : EmailAudienceType.STUDENT;
}

function resolveRecipientName(name?: string | null, email?: string | null) {
  const trimmedName = name?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const emailLocalPart = email?.split("@")[0]?.trim();
  if (emailLocalPart) {
    return emailLocalPart
      .replace(/[._-]+/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return "Коллега";
}

async function buildRuntimeTemplateContext(args: {
  trackingToken: string;
  userId?: string;
  templateKey: EmailTemplateKey;
  recipientName: string;
  courseId?: string;
  courseSlug?: string | null;
  courseTitle?: string;
  amountLabel?: string;
}) {
  let preferencesUrl: string | undefined;
  if (args.userId) {
    const preference = await getMarketingPreferenceForUser(args.userId);
    if (preference) {
      preferencesUrl = buildAbsolutePath(
        `/email/preferences?token=${preference.preferenceToken}`,
      );
    }
  }

  const courseCatalogUrl =
    args.courseSlug && args.templateKey.startsWith("campaign-")
      ? buildAbsolutePath(`/catalog#${args.courseSlug}`)
      : args.courseId
        ? buildAbsolutePath(`/learning/courses/${args.courseId}`)
        : buildAbsolutePath("/catalog");

  const replyTo = getEmailReplyTo();

  return {
    recipientName: args.recipientName,
    courseTitle: args.courseTitle,
    amountLabel: args.amountLabel,
    replyEmail: replyTo.replyToEmail,
    links: {
      catalogUrl: buildTrackedUrl(args.trackingToken, buildAbsolutePath("/catalog")),
      signInUrl: buildTrackedUrl(args.trackingToken, buildAbsolutePath("/sign-in")),
      learningUrl: buildTrackedUrl(args.trackingToken, buildAbsolutePath("/learning")),
      courseUrl: buildTrackedUrl(args.trackingToken, courseCatalogUrl),
      expertUrl: buildTrackedUrl(args.trackingToken, buildAbsolutePath("/admin/courses")),
      preferencesUrl,
    },
  };
}

async function queueRenderedTemplateEmail(args: {
  userId?: string;
  courseId?: string;
  courseSlug?: string | null;
  courseTitle?: string;
  orderId?: string;
  campaignId?: string;
  kind: EmailKind;
  templateKey: EmailTemplateKey;
  campaignKey?: string;
  recipientSegment?: EmailCampaignSegment;
  sequenceStep?: number;
  dedupeKey?: string;
  toEmail: string;
  toName?: string | null;
  amountLabel?: string;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}) {
  const trackingToken = createTrackingToken();
  const replyTo = getEmailReplyTo();
  const rendered = renderTemplateByKey(
    args.templateKey,
    await buildRuntimeTemplateContext({
      trackingToken,
      userId: args.userId,
      templateKey: args.templateKey,
      recipientName: resolveRecipientName(args.toName, args.toEmail),
      courseId: args.courseId,
      courseSlug: args.courseSlug,
      courseTitle: args.courseTitle,
      amountLabel: args.amountLabel,
    }),
  );

  return queueEmailMessage({
    userId: args.userId,
    courseId: args.courseId,
    orderId: args.orderId,
    campaignId: args.campaignId,
    kind: args.kind,
    templateKey: args.templateKey,
    campaignKey: args.campaignKey,
    recipientSegment: args.recipientSegment,
    sequenceStep: args.sequenceStep,
    dedupeKey: args.dedupeKey,
    trackingToken,
    subject: rendered.subject,
    preheader: rendered.preheader,
    toEmail: args.toEmail,
    toName: args.toName,
    htmlBody: rendered.html,
    textBody: rendered.text,
    scheduledAt: args.scheduledAt,
    replyToEmail: replyTo.replyToEmail,
    replyToName: replyTo.replyToName,
    metadata: args.metadata,
  });
}

async function shouldSendMarketingToUser(userId: string) {
  const preference = await getMarketingPreferenceForUser(userId);
  return Boolean(preference?.isMarketingEnabled);
}

async function syncCampaignStatus(campaignId: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: {
      id: campaignId,
    },
    select: {
      id: true,
      status: true,
      messages: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!campaign || campaign.status === EmailCampaignStatus.CANCELED) {
    return;
  }

  const queuedLike = campaign.messages.filter((message) =>
    queuedEmailStatuses.includes(message.status as (typeof queuedEmailStatuses)[number]),
  ).length;

  if (queuedLike > 0) {
    if (campaign.status === EmailCampaignStatus.PAUSED) {
      return;
    }

    await prisma.emailCampaign.update({
      where: {
        id: campaign.id,
      },
      data: {
        status: EmailCampaignStatus.ACTIVE,
      },
    });
    return;
  }

  await prisma.emailCampaign.update({
    where: {
      id: campaign.id,
    },
    data: {
      status: EmailCampaignStatus.COMPLETED,
      completedAt: new Date(),
    },
  });
}

export async function queueStudentAccountCreatedEmail(input: {
  user: Pick<User, "id" | "email" | "name" | "role">;
  password: string;
  isExistingAccount?: boolean;
}) {
  await ensureEmailPreference({
    userId: input.user.id,
    audienceType: getAudienceTypeForRole(input.user.role),
    enableMarketing: undefined,
    source: "system-account-init",
  });

  const signInUrl = buildAbsolutePath("/sign-in");
  const trackingToken = createTrackingToken();
  const replyTo = getEmailReplyTo();
  const template = renderStudentAccountCreatedTemplate({
    studentName: resolveRecipientName(input.user.name, input.user.email),
    email: input.user.email,
    password: input.password,
    signInUrl: buildTrackedUrl(trackingToken, signInUrl),
    isExistingAccount: input.isExistingAccount,
    replyEmail: replyTo.replyToEmail,
  });

  return queueEmailMessage({
    userId: input.user.id,
    kind: EmailKind.TRANSACTIONAL,
    templateKey: input.isExistingAccount
      ? "student-account-updated"
      : "student-account-created",
    dedupeKey: input.isExistingAccount
      ? undefined
      : `student-account-created:${input.user.id}`,
    subject: template.subject,
    preheader: template.preheader,
    trackingToken,
    toEmail: input.user.email,
    toName: input.user.name,
    htmlBody: template.html,
    textBody: template.text,
    replyToEmail: replyTo.replyToEmail,
    replyToName: replyTo.replyToName,
    metadata: {
      scenario: input.isExistingAccount
        ? "student-account-updated"
        : "student-account-created",
    },
  });
}

export async function queueCourseAccessGrantedEmail(input: {
  user: Pick<User, "id" | "email" | "name">;
  course: Pick<Course, "id" | "title">;
}) {
  const trackingToken = createTrackingToken();
  const replyTo = getEmailReplyTo();
  const template = renderCourseAccessGrantedTemplate({
    studentName: resolveRecipientName(input.user.name, input.user.email),
    courseTitle: input.course.title,
    courseUrl: buildTrackedUrl(
      trackingToken,
      buildAbsolutePath(`/learning/courses/${input.course.id}`),
    ),
    replyEmail: replyTo.replyToEmail,
  });

  return queueEmailMessage({
    userId: input.user.id,
    courseId: input.course.id,
    kind: EmailKind.TRANSACTIONAL,
    templateKey: "course-access-granted",
    subject: template.subject,
    preheader: template.preheader,
    trackingToken,
    toEmail: input.user.email,
    toName: input.user.name,
    htmlBody: template.html,
    textBody: template.text,
    replyToEmail: replyTo.replyToEmail,
    replyToName: replyTo.replyToName,
    metadata: {
      scenario: "course-access-granted",
      courseTitle: input.course.title,
    },
  });
}

export async function queuePaymentSuccessEmail(input: {
  user: Pick<User, "id" | "email" | "name">;
  course: Pick<Course, "id" | "title">;
  order: Pick<Order, "id" | "totalAmount" | "currency">;
  amountLabel: string;
}) {
  const trackingToken = createTrackingToken();
  const replyTo = getEmailReplyTo();
  const template = renderPaymentSuccessTemplate({
    studentName: resolveRecipientName(input.user.name, input.user.email),
    courseTitle: input.course.title,
    amountLabel: input.amountLabel,
    learningUrl: buildTrackedUrl(
      trackingToken,
      buildAbsolutePath(`/learning/courses/${input.course.id}`),
    ),
    replyEmail: replyTo.replyToEmail,
  });

  return queueEmailMessage({
    userId: input.user.id,
    courseId: input.course.id,
    orderId: input.order.id,
    kind: EmailKind.TRANSACTIONAL,
    templateKey: "payment-success",
    dedupeKey: `payment-success:${input.order.id}`,
    subject: template.subject,
    preheader: template.preheader,
    trackingToken,
    toEmail: input.user.email,
    toName: input.user.name,
    htmlBody: template.html,
    textBody: template.text,
    replyToEmail: replyTo.replyToEmail,
    replyToName: replyTo.replyToName,
    metadata: {
      scenario: "payment-success",
      amount: input.order.totalAmount,
      currency: input.order.currency,
    },
  });
}

export async function queueStudentMarketingSequence(input: {
  user: Pick<User, "id" | "email" | "name" | "role">;
}) {
  await ensureEmailPreference({
    userId: input.user.id,
    audienceType: EmailAudienceType.STUDENT,
    enableMarketing: undefined,
    source: "student-created",
  });

  if (!(await shouldSendMarketingToUser(input.user.id))) {
    return { queued: 0, skipped: true };
  }

  const now = new Date();
  const sequence: Array<{ step: 1 | 2 | 3 | 4 | 5; scheduledAt: Date }> = [
    { step: 1, scheduledAt: addDays(now, 0) },
    { step: 2, scheduledAt: addDays(now, 1) },
    { step: 3, scheduledAt: addDays(now, 3) },
    { step: 4, scheduledAt: addDays(now, 5) },
    { step: 5, scheduledAt: addDays(now, 7) },
  ];

  for (const item of sequence) {
    await queueRenderedTemplateEmail({
      userId: input.user.id,
      kind: EmailKind.MARKETING,
      templateKey: `student-welcome-${item.step}` as EmailTemplateKey,
      campaignKey: "student-welcome-sequence",
      sequenceStep: item.step,
      dedupeKey: `marketing-sequence:${input.user.id}:${item.step}`,
      toEmail: input.user.email,
      toName: input.user.name,
      scheduledAt: item.scheduledAt,
      metadata: {
        scenario: "student-welcome-sequence",
        sequenceStep: item.step,
      },
    });
  }

  return { queued: sequence.length, skipped: false };
}

export async function queueExpertMarketingSequence(input: {
  user: Pick<User, "id" | "email" | "name" | "role">;
}) {
  await ensureEmailPreference({
    userId: input.user.id,
    audienceType: EmailAudienceType.EXPERT,
    enableMarketing: true,
    source: "admin-author-onboarding",
    consentText:
      "Маркетинговые и продуктовые письма для автора были включены при создании авторского доступа.",
  });

  const now = new Date();
  const sequence: Array<{ key: EmailTemplateKey; scheduledAt: Date }> = [
    { key: "expert-welcome-1", scheduledAt: addDays(now, 0) },
    { key: "expert-welcome-2", scheduledAt: addDays(now, 2) },
    { key: "expert-welcome-3", scheduledAt: addDays(now, 5) },
  ];

  for (const item of sequence) {
    await queueRenderedTemplateEmail({
      userId: input.user.id,
      kind: EmailKind.MARKETING,
      templateKey: item.key,
      campaignKey: "expert-welcome-sequence",
      dedupeKey: `expert-sequence:${input.user.id}:${item.key}`,
      toEmail: input.user.email,
      toName: input.user.name,
      scheduledAt: item.scheduledAt,
      metadata: {
        scenario: "expert-welcome-sequence",
        templateKey: item.key,
      },
    });
  }

  return { queued: sequence.length, skipped: false };
}

async function queueTriggeredAutomations() {
  const threeDaysAgo = addDays(new Date(), -3);
  const sevenDaysAgo = addDays(new Date(), -7);
  const inactiveCutoff = addDays(new Date(), -7);

  const notStartedEnrollments = await prisma.enrollment.findMany({
    where: {
      status: EnrollmentStatus.ACTIVE,
      startedAt: {
        lte: threeDaysAgo,
      },
      user: {
        emailPreference: {
          is: {
            isMarketingEnabled: true,
            audienceType: EmailAudienceType.STUDENT,
          },
        },
      },
    },
    select: {
      userId: true,
      courseId: true,
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
          slug: true,
        },
      },
    },
  });

  for (const enrollment of notStartedEnrollments) {
    const hasProgress = await prisma.lessonProgress.findFirst({
      where: {
        userId: enrollment.userId,
        lesson: {
          module: {
            courseId: enrollment.courseId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (hasProgress) {
      continue;
    }

    await queueRenderedTemplateEmail({
      userId: enrollment.user.id,
      courseId: enrollment.course.id,
      courseSlug: enrollment.course.slug,
      courseTitle: enrollment.course.title,
      kind: EmailKind.MARKETING,
      templateKey: "student-reengage-no-start",
      dedupeKey: `student-reengage-no-start:${enrollment.user.id}:${enrollment.course.id}`,
      toEmail: enrollment.user.email,
      toName: enrollment.user.name,
      metadata: {
        scenario: "student-reengage-no-start",
      },
    });
  }

  const activeEnrollments = await prisma.enrollment.findMany({
    where: {
      status: EnrollmentStatus.ACTIVE,
      startedAt: {
        lte: sevenDaysAgo,
      },
      user: {
        emailPreference: {
          is: {
            isMarketingEnabled: true,
            audienceType: EmailAudienceType.STUDENT,
          },
        },
      },
    },
    select: {
      userId: true,
      courseId: true,
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
          slug: true,
        },
      },
    },
  });

  for (const enrollment of activeEnrollments) {
    const latestProgress = await prisma.lessonProgress.findFirst({
      where: {
        userId: enrollment.userId,
        lesson: {
          module: {
            courseId: enrollment.courseId,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        updatedAt: true,
      },
    });

    if (!latestProgress || latestProgress.updatedAt > inactiveCutoff) {
      continue;
    }

    await queueRenderedTemplateEmail({
      userId: enrollment.user.id,
      courseId: enrollment.course.id,
      courseSlug: enrollment.course.slug,
      courseTitle: enrollment.course.title,
      kind: EmailKind.MARKETING,
      templateKey: "student-reengage-stalled",
      dedupeKey: `student-reengage-stalled:${enrollment.user.id}:${enrollment.course.id}`,
      toEmail: enrollment.user.email,
      toName: enrollment.user.name,
      metadata: {
        scenario: "student-reengage-stalled",
      },
    });
  }
}

export async function processDueEmailQueue(options: ProcessQueueOptions = {}) {
  const force = options.force ?? false;
  const limit = options.limit ?? 10;
  const now = Date.now();

  if (!force && now - lastQueueRunAt < EMAIL_QUEUE_THROTTLE_MS) {
    return { processed: 0, skipped: true };
  }

  lastQueueRunAt = now;
  await queueTriggeredAutomations();

  const provider = getEmailProvider();
  const currentTime = new Date();
  const queued = await prisma.emailMessage.findMany({
    where: {
      status: EmailStatus.QUEUED,
      AND: [
        {
          scheduledAt: {
            lte: currentTime,
          },
        },
        {
          OR: [
            {
              nextAttemptAt: null,
            },
            {
              nextAttemptAt: {
                lte: currentTime,
              },
            },
          ],
        },
        {
          OR: [
            {
              campaignId: null,
            },
            {
              campaign: {
                status: {
                  in: [EmailCampaignStatus.SCHEDULED, EmailCampaignStatus.ACTIVE],
                },
              },
            },
          ],
        },
      ],
    },
    orderBy: {
      scheduledAt: "asc",
    },
    take: limit,
  });

  let processed = 0;

  for (const message of queued) {
    const claim = await prisma.emailMessage.updateMany({
      where: {
        id: message.id,
        status: EmailStatus.QUEUED,
      },
      data: {
        status: EmailStatus.SENDING,
      },
    });

    if (claim.count === 0) {
      continue;
    }

    try {
      const result = await provider.send({
        from: message.fromName
          ? `${message.fromName} <${message.fromEmail}>`
          : message.fromEmail,
        to: message.toEmail,
        subject: message.subject,
        html: message.htmlBody,
        text: message.textBody ?? undefined,
        replyTo: message.replyToEmail
          ? message.replyToName
            ? `${message.replyToName} <${message.replyToEmail}>`
            : message.replyToEmail
          : undefined,
      });

      const sentAt = new Date();
      const deliveredAt = result.status === "delivered" ? sentAt : null;
      const nextStatus =
        result.status === "delivered" ? EmailStatus.DELIVERED : EmailStatus.SENT;

      await prisma.emailMessage.update({
        where: {
          id: message.id,
        },
        data: {
          provider: mapProviderNameToDb(provider.name),
          providerMessageId: result.providerMessageId,
          status: nextStatus,
          sentAt,
          deliveredAt,
          lastError: null,
          nextAttemptAt: null,
          attemptCount: {
            increment: 1,
          },
          events: {
            create: {
              eventType: result.status === "delivered" ? "email.delivered" : "email.sent",
              status: nextStatus,
              providerId: result.providerMessageId,
              payload: (result.payload as Prisma.JsonObject | undefined) ?? undefined,
            },
          },
        },
      });

      if (message.campaignId) {
        await syncCampaignStatus(message.campaignId);
      }

      processed += 1;
    } catch (error) {
      const nextAttemptCount = message.attemptCount + 1;
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected email provider error.";

      if (nextAttemptCount < message.maxAttempts) {
        const retryAt = addMinutes(new Date(), getRetryDelayMinutes(nextAttemptCount));

        await prisma.emailMessage.update({
          where: {
            id: message.id,
          },
          data: {
            status: EmailStatus.QUEUED,
            attemptCount: nextAttemptCount,
            nextAttemptAt: retryAt,
            lastError: errorMessage,
            events: {
              create: {
                eventType: "email.retry-scheduled",
                status: EmailStatus.QUEUED,
                payload: {
                  message: errorMessage,
                  retryAt: retryAt.toISOString(),
                  attemptCount: nextAttemptCount,
                } satisfies Prisma.JsonObject,
              },
            },
          },
        });
      } else {
        await prisma.emailMessage.update({
          where: {
            id: message.id,
          },
          data: {
            status: EmailStatus.FAILED,
            failedAt: new Date(),
            attemptCount: nextAttemptCount,
            lastError: errorMessage,
            nextAttemptAt: null,
            events: {
              create: {
                eventType: "email.failed",
                status: EmailStatus.FAILED,
                payload: {
                  message: errorMessage,
                  attemptCount: nextAttemptCount,
                } satisfies Prisma.JsonObject,
              },
            },
          },
        });
      }

      if (message.campaignId) {
        await syncCampaignStatus(message.campaignId);
      }
    }
  }

  return { processed, skipped: false };
}

export async function recordEmailOpen(trackingToken: string) {
  const message = await prisma.emailMessage.findUnique({
    where: {
      trackingToken,
    },
    select: {
      id: true,
      openedAt: true,
      deliveredAt: true,
      campaignId: true,
    },
  });

  if (!message || message.openedAt) {
    return;
  }

  const now = new Date();

  await prisma.emailMessage.update({
    where: {
      id: message.id,
    },
    data: {
      status: EmailStatus.OPENED,
      deliveredAt: message.deliveredAt ?? now,
      openedAt: now,
      events: {
        create: {
          eventType: "tracking.opened",
          status: EmailStatus.OPENED,
        },
      },
    },
  });

  if (message.campaignId) {
    await syncCampaignStatus(message.campaignId);
  }
}

export async function recordEmailClick(trackingToken: string, url: string) {
  const message = await prisma.emailMessage.findUnique({
    where: {
      trackingToken,
    },
    select: {
      id: true,
      deliveredAt: true,
      openedAt: true,
      campaignId: true,
    },
  });

  if (!message) {
    return;
  }

  const now = new Date();

  await prisma.emailMessage.update({
    where: {
      id: message.id,
    },
    data: {
      status: EmailStatus.CLICKED,
      deliveredAt: message.deliveredAt ?? now,
      openedAt: message.openedAt ?? now,
      clickedAt: now,
      clicks: {
        create: {
          url,
        },
      },
      events: {
        create: {
          eventType: "tracking.clicked",
          status: EmailStatus.CLICKED,
          payload: {
            url,
          } satisfies Prisma.JsonObject,
        },
      },
    },
  });

  if (message.campaignId) {
    await syncCampaignStatus(message.campaignId);
  }
}

export async function handleResendWebhookEvent(event: {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}) {
  const emailId = event.data?.email_id;

  if (!emailId) {
    return;
  }

  const message = await prisma.emailMessage.findFirst({
    where: {
      providerMessageId: emailId,
    },
    select: {
      id: true,
      deliveredAt: true,
      openedAt: true,
      campaignId: true,
    },
  });

  if (!message) {
    return;
  }

  const timestamp = extractEventTimestamp(event as Record<string, unknown>);
  const payload = event as Record<string, unknown>;

  const data: {
    status?: EmailStatus;
    sentAt?: Date;
    deliveredAt?: Date;
    openedAt?: Date;
    clickedAt?: Date;
    failedAt?: Date;
    lastError?: string | null;
  } = {};

  switch (event.type) {
    case "email.sent":
      data.status = EmailStatus.SENT;
      data.sentAt = timestamp;
      break;
    case "email.delivered":
      data.status = EmailStatus.DELIVERED;
      data.deliveredAt = timestamp;
      break;
    case "email.opened":
      data.status = EmailStatus.OPENED;
      data.deliveredAt = message.deliveredAt ?? timestamp;
      data.openedAt = timestamp;
      break;
    case "email.clicked":
      data.status = EmailStatus.CLICKED;
      data.deliveredAt = message.deliveredAt ?? timestamp;
      data.openedAt = message.openedAt ?? timestamp;
      data.clickedAt = timestamp;
      break;
    case "email.bounced":
      data.status = EmailStatus.BOUNCED;
      data.failedAt = timestamp;
      data.lastError = "Письмо вернулось с ошибкой доставки.";
      break;
    case "email.complained":
      data.status = EmailStatus.COMPLAINED;
      data.failedAt = timestamp;
      data.lastError = "Получатель пожаловался на письмо.";
      break;
    case "email.failed":
    case "email.suppressed":
      data.status = EmailStatus.FAILED;
      data.failedAt = timestamp;
      data.lastError = "Провайдер не смог доставить письмо.";
      break;
    default:
      break;
  }

  await prisma.emailMessage.update({
    where: {
      id: message.id,
    },
    data: {
      ...data,
      events: {
        create: {
          eventType: event.type,
          status: data.status,
          providerId: emailId,
          payload: payload as Prisma.JsonObject,
        },
      },
    },
  });

  if (message.campaignId) {
    await syncCampaignStatus(message.campaignId);
  }
}

async function selectRecipientsForSegment(
  segment: EmailCampaignSegment,
  courseId?: string,
): Promise<RecipientSummary[]> {
  const studentFilter = {
    role: USER_ROLES.STUDENT,
    emailPreference: {
      is: {
        isMarketingEnabled: true,
        audienceType: EmailAudienceType.STUDENT,
      },
    },
  } as const;

  switch (segment) {
    case EmailCampaignSegment.ALL_OPTED_IN_STUDENTS:
      return prisma.user.findMany({
        where: studentFilter,
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    case EmailCampaignSegment.STUDENTS_WITHOUT_PURCHASE:
      return prisma.user.findMany({
        where: {
          ...studentFilter,
          orders: {
            none: {
              status: OrderStatus.PAID,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    case EmailCampaignSegment.STUDENTS_WITH_PURCHASE:
      return prisma.user.findMany({
        where: {
          ...studentFilter,
          orders: {
            some: {
              status: OrderStatus.PAID,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    case EmailCampaignSegment.STUDENTS_ENROLLED_IN_COURSE:
      if (!courseId) {
        throw new Error("Для этого сегмента нужно выбрать курс.");
      }

      return prisma.user.findMany({
        where: {
          ...studentFilter,
          enrollments: {
            some: {
              courseId,
              status: EnrollmentStatus.ACTIVE,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    case EmailCampaignSegment.INACTIVE_STUDENTS: {
      const inactivityCutoff = addDays(new Date(), -30);
      return prisma.user.findMany({
        where: {
          ...studentFilter,
          OR: [
            {
              progress: {
                none: {},
              },
            },
            {
              progress: {
                none: {
                  updatedAt: {
                    gte: inactivityCutoff,
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    }
    case EmailCampaignSegment.ALL_OPTED_IN_EXPERTS:
      return prisma.user.findMany({
        where: {
          role: USER_ROLES.AUTHOR,
          emailPreference: {
            is: {
              isMarketingEnabled: true,
              audienceType: EmailAudienceType.EXPERT,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
  }
}

export async function createEmailCampaign(input: {
  name: string;
  templateKey: EmailTemplateKey;
  segment: EmailCampaignSegment;
  courseId?: string;
  createdById: string;
  scheduledAt?: Date | null;
}) {
  const template = emailTemplateCatalogMap[input.templateKey];
  if (template.requiresCourse && !input.courseId) {
    throw new Error("Для выбранного шаблона нужно выбрать курс.");
  }

  const course = input.courseId
    ? await prisma.course.findUnique({
        where: {
          id: input.courseId,
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
      })
    : null;

  const recipients = await selectRecipientsForSegment(input.segment, input.courseId);

  if (recipients.length === 0) {
    throw new Error("Для выбранного сегмента пока нет получателей.");
  }

  const runtimePreview = renderTemplateByKey(input.templateKey, {
    recipientName: "Получатель",
    courseTitle: course?.title,
    links: {
      catalogUrl: buildAbsolutePath("/catalog"),
      signInUrl: buildAbsolutePath("/sign-in"),
      learningUrl: buildAbsolutePath("/learning"),
      courseUrl: course?.slug
        ? buildAbsolutePath(`/catalog#${course.slug}`)
        : buildAbsolutePath("/catalog"),
      expertUrl: buildAbsolutePath("/admin/courses"),
    },
    replyEmail: getEmailReplyTo().replyToEmail,
  });

  const scheduledAt = input.scheduledAt ?? new Date();
  const campaign = await prisma.emailCampaign.create({
    data: {
      name: input.name,
      templateKey: input.templateKey,
      segment: input.segment,
      status:
        scheduledAt > new Date()
          ? EmailCampaignStatus.SCHEDULED
          : EmailCampaignStatus.ACTIVE,
      createdById: input.createdById,
      courseId: course?.id,
      scheduledAt,
      launchedAt: scheduledAt > new Date() ? null : new Date(),
      subjectSnapshot: runtimePreview.subject,
      preheaderSnapshot: runtimePreview.preheader,
      recipientCount: recipients.length,
    },
    select: {
      id: true,
      name: true,
      templateKey: true,
    },
  });

  for (const recipient of recipients) {
    await queueRenderedTemplateEmail({
      userId: recipient.id,
      courseId: course?.id,
      courseSlug: course?.slug,
      courseTitle: course?.title,
      campaignId: campaign.id,
      kind: EmailKind.MARKETING,
      templateKey: input.templateKey,
      campaignKey: campaign.id,
      recipientSegment: input.segment,
      dedupeKey: `campaign:${campaign.id}:${recipient.id}`,
      toEmail: recipient.email,
      toName: recipient.name,
      scheduledAt,
      metadata: {
        scenario: "manual-campaign",
        campaignId: campaign.id,
      },
    });
  }

  return campaign;
}

export async function sendTestEmailTemplate(input: {
  templateKey: EmailTemplateKey;
  courseId?: string;
  senderUserId: string;
  recipientEmail: string;
  recipientName?: string | null;
}) {
  const template = emailTemplateCatalogMap[input.templateKey];
  if (template.requiresCourse && !input.courseId) {
    throw new Error("Для выбранного шаблона нужно выбрать курс.");
  }

  const course = input.courseId
    ? await prisma.course.findUnique({
        where: {
          id: input.courseId,
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
      })
    : null;

  return queueRenderedTemplateEmail({
    userId: input.senderUserId,
    courseId: course?.id,
    courseSlug: course?.slug,
    courseTitle: course?.title,
    kind: EmailKind.MARKETING,
    templateKey: input.templateKey,
    toEmail: input.recipientEmail,
    toName: input.recipientName ?? "Тестовый получатель",
    metadata: {
      scenario: "test-send",
      templateKey: input.templateKey,
      initiatedBy: input.senderUserId,
    },
  });
}

export async function pauseEmailCampaign(campaignId: string) {
  await prisma.emailCampaign.update({
    where: {
      id: campaignId,
    },
    data: {
      status: EmailCampaignStatus.PAUSED,
      pausedAt: new Date(),
    },
  });
}

export async function cancelEmailCampaign(campaignId: string) {
  const now = new Date();

  await prisma.$transaction([
    prisma.emailCampaign.update({
      where: {
        id: campaignId,
      },
      data: {
        status: EmailCampaignStatus.CANCELED,
        canceledAt: now,
      },
    }),
    prisma.emailMessage.updateMany({
      where: {
        campaignId,
        status: EmailStatus.QUEUED,
      },
      data: {
        status: EmailStatus.CANCELED,
        canceledAt: now,
        nextAttemptAt: null,
      },
    }),
  ]);
}

export async function requeueEmailMessage(messageId: string) {
  const message = await prisma.emailMessage.findUniqueOrThrow({
    where: {
      id: messageId,
    },
    select: {
      id: true,
      campaignId: true,
    },
  });

  await prisma.emailMessage.update({
    where: {
      id: message.id,
    },
    data: {
      status: EmailStatus.QUEUED,
      scheduledAt: new Date(),
      nextAttemptAt: null,
      attemptCount: 0,
      failedAt: null,
      canceledAt: null,
      lastError: null,
      events: {
        create: {
          eventType: "email.requeued",
          status: EmailStatus.QUEUED,
        },
      },
    },
  });

  if (message.campaignId) {
    await prisma.emailCampaign.update({
      where: {
        id: message.campaignId,
      },
      data: {
        status: EmailCampaignStatus.ACTIVE,
        pausedAt: null,
        canceledAt: null,
      },
    });
  }
}

export function getEmailSystemConfig() {
  const sender = getEmailSender();
  const replyTo = getEmailReplyTo();

  return {
    provider: getConfiguredProviderName(),
    sender,
    replyTo,
    appBaseUrl: getAppBaseUrl(),
    hasResendApiKey: Boolean(process.env.RESEND_API_KEY),
    hasResendFromEmail: Boolean(process.env.RESEND_FROM_EMAIL),
    hasResendWebhookSecret: Boolean(process.env.RESEND_WEBHOOK_SECRET),
    hasCronSecret: Boolean(process.env.CRON_SECRET),
  };
}
