import { auth } from "@academy/auth";
import { redirect } from "next/navigation";

export default async function AuthorRedirectPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  redirect("/sign-in?role=author");
}
