import nodemailer from "nodemailer";
import { Resend } from "resend";

export type EmailSendPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type EmailSendResult = {
  providerMessageId: string;
  status: "sent" | "delivered";
  payload?: Record<string, unknown>;
};

export interface EmailProvider {
  name: "mock" | "resend" | "smtp";
  send(payload: EmailSendPayload): Promise<EmailSendResult>;
  verifyWebhook?(
    payload: string,
    headers: {
      id: string | null;
      timestamp: string | null;
      signature: string | null;
    },
  ): Promise<unknown>;
}

class MockEmailProvider implements EmailProvider {
  name = "mock" as const;

  async send(payload: EmailSendPayload): Promise<EmailSendResult> {
    return {
      providerMessageId: `mock_${crypto.randomUUID()}`,
      status: "delivered",
      payload: {
        mode: "mock",
        to: payload.to,
        subject: payload.subject,
        replyTo: payload.replyTo ?? null,
      },
    };
  }
}

class ResendEmailProvider implements EmailProvider {
  name = "resend" as const;
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(payload: EmailSendPayload): Promise<EmailSendResult> {
    const { data, error } = await this.client.emails.send({
      from: payload.from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
    });

    if (error || !data?.id) {
      throw new Error(error?.message || "Не удалось отправить письмо через Resend.");
    }

    return {
      providerMessageId: data.id,
      status: "sent",
    };
  }

  async verifyWebhook(
    payload: string,
    headers: {
      id: string | null;
      timestamp: string | null;
      signature: string | null;
    },
  ) {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("RESEND_WEBHOOK_SECRET is not configured.");
    }

    if (!headers.id || !headers.timestamp || !headers.signature) {
      throw new Error("Missing Resend webhook signature headers.");
    }

    return this.client.webhooks.verify({
      payload,
      headers: {
        id: headers.id,
        timestamp: headers.timestamp,
        signature: headers.signature,
      },
      webhookSecret,
    });
  }
}

class SmtpEmailProvider implements EmailProvider {
  name = "smtp" as const;
  private transporter: nodemailer.Transporter;

  constructor(config: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  }) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  async send(payload: EmailSendPayload): Promise<EmailSendResult> {
    const info = await this.transporter.sendMail({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
    });

    if (!info.messageId) {
      throw new Error("SMTP не вернул message id после отправки письма.");
    }

    return {
      providerMessageId: info.messageId,
      status: "sent",
      payload: {
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      },
    };
  }
}

function getSmtpConfig() {
  const configuredProvider = (process.env.EMAIL_PROVIDER || "mock").toLowerCase();
  const isYandexSmtp = configuredProvider === "yandex-smtp";
  const host = process.env.SMTP_HOST?.trim() || (isYandexSmtp ? "smtp.yandex.ru" : "");
  const port = Number(process.env.SMTP_PORT?.trim() || (isYandexSmtp ? "465" : "587"));
  const secureRaw = process.env.SMTP_SECURE?.trim()?.toLowerCase();
  const secure =
    secureRaw === undefined
      ? isYandexSmtp || port === 465
      : secureRaw === "true" || secureRaw === "1" || secureRaw === "yes";
  const user = process.env.SMTP_USER?.trim() || "";
  const password = process.env.SMTP_PASSWORD?.trim() || "";

  if (!host || !user || !password || !Number.isFinite(port)) {
    throw new Error(
      "EMAIL_PROVIDER=smtp/yandex-smtp, но SMTP_HOST/SMTP_USER/SMTP_PASSWORD заданы не полностью.",
    );
  }

  return {
    host,
    port,
    secure,
    user,
    password,
  };
}

let cachedProvider: EmailProvider | null = null;

export function getEmailProvider() {
  if (cachedProvider) {
    return cachedProvider;
  }

  const configuredProvider = (process.env.EMAIL_PROVIDER || "mock").toLowerCase();

  if (configuredProvider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("EMAIL_PROVIDER=resend, но RESEND_API_KEY не задан.");
    }

    cachedProvider = new ResendEmailProvider(apiKey);
    return cachedProvider;
  }

  if (configuredProvider === "smtp" || configuredProvider === "yandex-smtp") {
    cachedProvider = new SmtpEmailProvider(getSmtpConfig());
    return cachedProvider;
  }

  cachedProvider = new MockEmailProvider();
  return cachedProvider;
}
