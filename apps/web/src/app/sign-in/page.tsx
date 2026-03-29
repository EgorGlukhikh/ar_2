import { auth } from "@academy/auth";
import { redirect } from "next/navigation";

import { getPublicAuthScreenPayload } from "@backend/public-auth/get-public-auth-screen-payload";
import { SignInPageContent } from "@frontend/auth/components/sign-in-page-content";

import { marketingBody, marketingDisplay } from "@/lib/marketing-theme";

type SignInPageProps = {
  searchParams?: Promise<{
    email?: string;
    invited?: string;
    error?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const payload = getPublicAuthScreenPayload(resolvedSearchParams);

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} min-h-screen bg-[var(--background)] overflow-hidden font-[family:var(--font-landing-body)] text-[var(--foreground)]`}
    >
      <SignInPageContent payload={payload} />
    </main>
  );
}
