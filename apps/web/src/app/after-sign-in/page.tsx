import { auth } from "@academy/auth";
import { USER_ROLES } from "@academy/shared";
import { redirect } from "next/navigation";

export default async function AfterSignInPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role === USER_ROLES.STUDENT) {
    redirect("/learning");
  }

  redirect("/admin");
}
