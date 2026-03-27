"use server";

import { prisma } from "@academy/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStudentOrElevatedUser } from "@/lib/user";

const profileSchema = z.object({
  name: z.string().trim().max(120),
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
    name: get(formData, "name"),
    phone: get(formData, "phone"),
    telegram: get(formData, "telegram"),
    city: get(formData, "city"),
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.name || null,
      phone: parsed.phone || null,
      telegram: parsed.telegram || null,
      city: parsed.city || null,
    },
  });

  revalidatePath("/learning/profile");
}
