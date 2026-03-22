"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin";
import { processDueEmailQueue } from "@/features/email/service";

export async function processEmailQueueNow() {
  await requireAdminUser();
  await processDueEmailQueue({ force: true, limit: 25 });

  revalidatePath("/admin/emails");
  revalidatePath("/admin");
}
