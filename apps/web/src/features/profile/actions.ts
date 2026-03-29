"use server";

import { EmailAudienceType, prisma, type Prisma } from "@academy/db";
import { USER_ROLES, composeFullName } from "@academy/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateEmailPreferenceForUser } from "@/features/email/service";
import { requireStudentOrElevatedUser } from "@/lib/user";

const profileSchema = z.object({
  firstName: z.string().trim().max(60),
  lastName: z.string().trim().max(120),
  phone: z.string().trim().max(30),
  telegram: z.string().trim().max(64),
  city: z.string().trim().max(100),
});

function get(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateUserProfile(formData: FormData) {
  const user = await requireStudentOrElevatedUser();

  const parsed = profileSchema.parse({
    firstName: get(formData, "firstName"),
    lastName: get(formData, "lastName"),
    phone: get(formData, "phone"),
    telegram: get(formData, "telegram"),
    city: get(formData, "city"),
  });

  const marketingEnabled = formData.get("marketingEnabled") === "on";

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: composeFullName(parsed.firstName, parsed.lastName),
      firstName: parsed.firstName || null,
      lastName: parsed.lastName || null,
      phone: parsed.phone || null,
      telegram: parsed.telegram || null,
      city: parsed.city || null,
    } as Prisma.UserUpdateInput,
  });

  await updateEmailPreferenceForUser({
    userId: user.id,
    enabled: marketingEnabled,
    audienceType:
      user.role === USER_ROLES.AUTHOR ? EmailAudienceType.EXPERT : EmailAudienceType.STUDENT,
    source: "profile-settings",
    consentText:
      "Пользователь включил маркетинговые письма в настройках своего профиля.",
  });

  revalidatePath("/learning/profile");
  revalidatePath("/");
}
