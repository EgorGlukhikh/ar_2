import { auth } from "@academy/auth";
import { USER_ROLES } from "@academy/shared";
import { redirect } from "next/navigation";

export async function requireAdminUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== USER_ROLES.ADMIN) {
    redirect("/");
  }

  return session.user;
}
