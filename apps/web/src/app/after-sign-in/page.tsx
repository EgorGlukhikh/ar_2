import { auth } from "@academy/auth";
import { USER_ROLES } from "@academy/shared";
import { redirect } from "next/navigation";

import { getWorkspaceHomePath } from "@/lib/admin";

export default async function AfterSignInPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const role = session.user.role;

  if (!role) {
    redirect("/");
  }

  if (role === USER_ROLES.STUDENT) {
    redirect("/learning");
  }

  if (
    role === USER_ROLES.ADMIN ||
    role === USER_ROLES.AUTHOR ||
    role === USER_ROLES.CURATOR ||
    role === USER_ROLES.SALES_MANAGER
  ) {
    redirect(getWorkspaceHomePath(role));
  }

  redirect("/");
}
