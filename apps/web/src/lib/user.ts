import { auth } from "@academy/auth";
import { ELEVATED_ROLES, USER_ROLES, type UserRole } from "@academy/shared";
import { redirect } from "next/navigation";

export async function requireAuthenticatedUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session.user;
}

export function isElevatedUserRole(role?: string): role is UserRole {
  return Boolean(role && ELEVATED_ROLES.includes(role as UserRole));
}

export async function requireStudentOrElevatedUser() {
  const user = await requireAuthenticatedUser();

  if (user.role !== USER_ROLES.STUDENT && !isElevatedUserRole(user.role)) {
    redirect("/");
  }

  return user;
}
