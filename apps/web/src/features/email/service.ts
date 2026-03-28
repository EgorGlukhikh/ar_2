import { randomBytes } from "node:crypto";

import {
  EmailKind,
  EmailProviderType,
  EmailStatus,
  Prisma,
  prisma,
  type Course,
  type Order,
  type User,
} from "@academy/db";

import { getEmailProvider } from "@/lib/email/provider";
import {
  renderCourseAccessGrantedTemplate,
  renderMarketingSequenceTemplate,
  renderPaymentSuccessTemplate,
  renderStudentAccountCreatedTemplate,
} from "@/lib/email/templates";

const EMAIL_QUEUE_THROTTLE_MS = 45_000;

let lastQueueRunAt = 0;

function getAppBaseUrl() {
  return (
    process.env.APP_BASE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
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

function createTrackingToken() {
  return randomBytes(18).toString("hex");
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

function mapProviderNameToDb(name: "mock" | "resend") {
  return name === "resend" ? EmailProviderType.RESEND : EmailProviderType.MOCK;
}

function getConfiguredProviderName() {
  return (process.env.EMAIL_PROVIDER || "mock").toLowerCase() === "resend"
    ? "resend"
    : "mock";
}

type QueueEmailInput = {
  userId?: string;
  courseId?: string;
  orderId?: string;
  kind: EmailKind;
  templateKey: string;
  campaignKey?: string;
  sequenceStep?: number;
  dedupeKey?: string;
  trackingToken?: string;
  subject: string;
  toEmail: string;
  toName?: string | null;
  htmlBody: string;
  textBody?: string;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
};

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
      kind: input.kind,
      templateKey: input.templateKey,
      campaignKey: input.campaignKey,
      sequenceStep: input.sequenceStep,
      dedupeKey: input.dedupeKey,
      trackingToken,
      provider: mapProviderNameToDb(getConfiguredProviderName()),
      status: EmailStatus.QUEUED,
      subject: input.subject,
      fromEmail: sender.fromEmail,
      fromName: sender.fromName,
      toEmail: input.toEmail,
      toName: input.toName ?? undefined,
      htmlBody: appendTrackingPixel(input.htmlBody, trackingToken),
      textBody: input.textBody,
      scheduledAt: input.scheduledAt ?? new Date(),
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

function addDays(baseDate: Date, days: number) {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
}

function buildAbsolutePath(path: string) {
  return `${getAppBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function queueStudentAccountCreatedEmail(input: {
  user: Pick<User, "id" | "email" | "name">;
  password: string;
  isExistingAccount?: boolean;
}) {
  const signInUrl = buildAbsolutePath("/sign-in");
  const trackingToken = createTrackingToken();
  const template = renderStudentAccountCreatedTemplate({
    studentName: input.user.name || input.user.email,
    email: input.user.email,
    password: input.password,
    signInUrl: buildTrackedUrl(trackingToken, signInUrl),
    isExistingAccount: input.isExistingAccount,
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
    subject: input.isExistingAccount
      ? "Доступ к платформе обновлен"
      : "Ваша учетная запись в Академии риэлторов готова",
    trackingToken,
    toEmail: input.user.email,
    toName: input.user.name,
    htmlBody: template.html,
    textBody: template.text,
    metadata: {
      scenario: "student-account-created",
    },
  });
}

export async function queueCourseAccessGrantedEmail(input: {
  user: Pick<User, "id" | "email" | "name">;
  course: Pick<Course, "id" | "title">;
}) {
  const trackingToken = createTrackingToken();
  const template = renderCourseAccessGrantedTemplate({
    studentName: input.user.name || input.user.email,
    courseTitle: input.course.title,
    courseUrl: buildTrackedUrl(
      trackingToken,
      buildAbsolutePath(`/learning/courses/${input.course.id}`),
    ),
  });

  return queueEmailMessage({
    userId: input.user.id,
    courseId: input.course.id,
    kind: EmailKind.TRANSACTIONAL,
    templateKey: "course-access-granted",
    subject: `Открыт доступ к курсу «${input.course.title}»`,
    trackingToken,
    toEmail: input.user.email,
    toName: input.user.name,
    htmlBody: template.html,
    textBody: template.text,
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
  const template = renderPaymentSuccessTemplate({
    studentName: input.user.name || input.user.email,
    courseTitle: input.course.title,
    amountLabel: input.amountLabel,
    learningUrl: buildTrackedUrl(
      trackingToken,
      buildAbsolutePath(`/learning/courses/${input.course.id}`),
    ),
  });

  return queueEmailMessage({
    userId: input.user.id,
    courseId: input.course.id,
    orderId: input.order.id,
    kind: EmailKind.TRANSACTIONAL,
    templateKey: "payment-success",
    dedupeKey: `payment-success:${input.order.id}`,
    subject: `Оплата курса «${input.course.title}» подтверждена`,
    trackingToken,
    toEmail: input.user.email,
    toName: input.user.name,
    htmlBody: template.html,
    textBody: template.text,
    metadata: {
      scenario: "payment-success",
      amount: input.order.totalAmount,
      currency: input.order.currency,
    },
  });
}

export async function queueStudentMarketingSequence(input: {
  user: Pick<User, "id" | "email" | "name">;
}) {
  const now = new Date();

  const baseLinks = {
    catalogUrl: buildAbsolutePath("/catalog"),
    signInUrl: buildAbsolutePath("/sign-in"),
    learningUrl: buildAbsolutePath("/learning"),
  };

  const sequence = [
    { step: 1 as const, scheduledAt: addDays(now, 0) },
    { step: 2 as const, scheduledAt: addDays(now, 1) },
    { step: 3 as const, scheduledAt: addDays(now, 3) },
    { step: 4 as const, scheduledAt: addDays(now, 5) },
    { step: 5 as const, scheduledAt: addDays(now, 7) },
  ];

  for (const item of sequence) {
    const trackingToken = createTrackingToken();
    const template = renderMarketingSequenceTemplate(item.step, {
      studentName: input.user.name || input.user.email,
      catalogUrl: buildTrackedUrl(trackingToken, baseLinks.catalogUrl),
      signInUrl: buildTrackedUrl(trackingToken, baseLinks.signInUrl),
      learningUrl: buildTrackedUrl(trackingToken, baseLinks.learningUrl),
    });

    await queueEmailMessage({
      userId: input.user.id,
      kind: EmailKind.MARKETING,
      templateKey: `marketing-sequence-${item.step}`,
      campaignKey: "student-welcome-sequence",
      sequenceStep: item.step,
      dedupeKey: `marketing-sequence:${input.user.id}:${item.step}`,
      subject: [
        "Как устроена платформа и с чего начать",
        "Как студент проходит курс внутри платформы",
        "Почему курс должен выглядеть как продукт",
        "Как платформа работает для вебинаров и запусков",
        "Пора выбрать первый курс и войти в работу",
      ][item.step - 1],
      trackingToken,
      toEmail: input.user.email,
      toName: input.user.name,
      htmlBody: template.html,
      textBody: template.text,
      scheduledAt: item.scheduledAt,
      metadata: {
        scenario: "student-welcome-sequence",
        sequenceStep: item.step,
      },
    });
  }
}

type ProcessQueueOptions = {
  force?: boolean;
  limit?: number;
};

export async function processDueEmailQueue(options: ProcessQueueOptions = {}) {
  const force = options.force ?? false;
  const limit = options.limit ?? 10;
  const now = Date.now();

  if (!force && now - lastQueueRunAt < EMAIL_QUEUE_THROTTLE_MS) {
    return { processed: 0, skipped: true };
  }

  lastQueueRunAt = now;

  const queued = await prisma.emailMessage.findMany({
    where: {
      status: EmailStatus.QUEUED,
      scheduledAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
    take: limit,
  });

  let processed = 0;
  const provider = getEmailProvider();

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

      processed += 1;
    } catch (error) {
      await prisma.emailMessage.update({
        where: {
          id: message.id,
        },
        data: {
          status: EmailStatus.FAILED,
          failedAt: new Date(),
          lastError: error instanceof Error ? error.message : "Unexpected email error.",
          events: {
            create: {
              eventType: "email.failed",
              status: EmailStatus.FAILED,
              payload: {
                message: error instanceof Error ? error.message : "Unexpected email error.",
              } satisfies Prisma.JsonObject,
            },
          },
        },
      });
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
      status: true,
    },
  });

  if (!message) {
    return;
  }

  if (message.openedAt) {
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
}
