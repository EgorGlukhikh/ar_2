"use server";

import { USER_ROLES, type UserRole } from "@academy/shared";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin";
import { ROLE_PREVIEW_COOKIE } from "@/lib/viewer";

const allowedPreviewRoles: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR,
  USER_ROLES.STUDENT,
];

function getRedirectTarget(formData: FormData) {
  const target = String(formData.get("returnTo") ?? "").trim();
  return target || "/admin";
}

export async function updateRolePreview(formData: FormData) {
  await requireAdminUser();

  const role = String(formData.get("role") ?? "").trim().toUpperCase();
  const cookieStore = await cookies();

  if (!role || role === USER_ROLES.ADMIN || role === "OFF") {
    cookieStore.delete(ROLE_PREVIEW_COOKIE);
    redirect(getRedirectTarget(formData));
  }

  if (!allowedPreviewRoles.includes(role as UserRole)) {
    throw new Error("Недопустимый режим предпросмотра.");
  }

  cookieStore.set(ROLE_PREVIEW_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect(getRedirectTarget(formData));
}

