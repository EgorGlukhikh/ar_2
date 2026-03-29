"use server";

import {
  EmailCampaignSegment,
  type EmailAudienceType,
} from "@academy/db";
import { USER_ROLES } from "@academy/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type EmailTemplateKey, emailTemplateKeys } from "@/lib/email/catalog";
import { requireAuthenticatedUser } from "@/lib/user";
import { requireRoleAccess } from "@/lib/admin";
import {
  cancelEmailCampaign,
  createEmailCampaign,
  pauseEmailCampaign,
  processDueEmailQueue,
  requeueEmailMessage,
  sendTestEmailTemplate,
  updateEmailPreferenceByToken,
  updateEmailPreferenceForUser,
} from "@/features/email/service";

const managerRoles = [USER_ROLES.ADMIN, USER_ROLES.SALES_MANAGER] as const;

const campaignSchema = z.object({
  name: z.string().trim().min(3).max(140),
  templateKey: z.enum(emailTemplateKeys),
  segment: z.nativeEnum(EmailCampaignSegment),
  courseId: z.string().trim().optional(),
  scheduledAt: z.string().trim().optional(),
});

const testSendSchema = z.object({
  templateKey: z.enum(emailTemplateKeys),
  courseId: z.string().trim().optional(),
});

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseOptionalDateTimeLocal(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Некорректная дата отложенной отправки.");
  }

  return parsed;
}

function refreshEmailRoutes() {
  revalidatePath("/admin");
  revalidatePath("/admin/emails");
  revalidatePath("/learning/profile");
}

export async function processEmailQueueNow() {
  await requireRoleAccess([...managerRoles]);
  await processDueEmailQueue({ force: true, limit: 25 });
  refreshEmailRoutes();
}

export async function createEmailCampaignAction(formData: FormData) {
  const user = await requireRoleAccess([...managerRoles]);

  const parsed = campaignSchema.parse({
    name: getValue(formData, "name"),
    templateKey: getValue(formData, "templateKey"),
    segment: getValue(formData, "segment"),
    courseId: getValue(formData, "courseId") || undefined,
    scheduledAt: getValue(formData, "scheduledAt") || undefined,
  });

  await createEmailCampaign({
    name: parsed.name,
    templateKey: parsed.templateKey as EmailTemplateKey,
    segment: parsed.segment,
    courseId: parsed.courseId,
    createdById: user.id,
    scheduledAt: parseOptionalDateTimeLocal(parsed.scheduledAt),
  });

  refreshEmailRoutes();
}

export async function sendTestEmailAction(formData: FormData) {
  const user = await requireRoleAccess([...managerRoles]);

  if (!user.email) {
    throw new Error("У вашего аккаунта нет email для тестовой отправки.");
  }

  const parsed = testSendSchema.parse({
    templateKey: getValue(formData, "templateKey"),
    courseId: getValue(formData, "courseId") || undefined,
  });

  await sendTestEmailTemplate({
    templateKey: parsed.templateKey as EmailTemplateKey,
    courseId: parsed.courseId,
    senderUserId: user.id,
    recipientEmail: user.email,
    recipientName: user.name ?? "Команда платформы",
  });

  await processDueEmailQueue({ force: true, limit: 10 });
  refreshEmailRoutes();
}

export async function pauseEmailCampaignAction(formData: FormData) {
  await requireRoleAccess([...managerRoles]);
  await pauseEmailCampaign(getValue(formData, "campaignId"));
  refreshEmailRoutes();
}

export async function cancelEmailCampaignAction(formData: FormData) {
  await requireRoleAccess([...managerRoles]);
  await cancelEmailCampaign(getValue(formData, "campaignId"));
  refreshEmailRoutes();
}

export async function requeueEmailMessageAction(formData: FormData) {
  await requireRoleAccess([...managerRoles]);
  await requeueEmailMessage(getValue(formData, "messageId"));
  refreshEmailRoutes();
}

export async function updateMyMarketingPreferenceAction(input: {
  enabled: boolean;
  audienceType?: EmailAudienceType;
  consentText?: string;
}) {
  const user = await requireAuthenticatedUser();

  await updateEmailPreferenceForUser({
    userId: user.id,
    enabled: input.enabled,
    audienceType: input.audienceType,
    source: "profile-settings",
    consentText: input.consentText,
  });

  refreshEmailRoutes();
}

export async function updateEmailPreferenceByTokenAction(formData: FormData) {
  const enabled = formData.get("marketingEnabled") === "on";
  const preferenceToken = getValue(formData, "preferenceToken");

  await updateEmailPreferenceByToken({
    preferenceToken,
    enabled,
    source: "email-preferences-page",
    consentText:
      "Пользователь самостоятельно изменил согласие на информационные и рекламные рассылки на странице управления подпиской.",
  });

  refreshEmailRoutes();
}
