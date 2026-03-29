import { auth } from "@academy/auth";
import { redirect } from "next/navigation";

import { getPublicAuthScreenPayload } from "@backend/public-auth/get-public-auth-screen-payload";
import { SignInPageContent } from "@frontend/auth/components/sign-in-page-content";

import { PublicFooter } from "@/components/marketing/public-footer";
import {
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";

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
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <SignInPageContent payload={payload} />
            <PublicFooter />
          </div>
        </section>
      </div>
    </main>
  );
}
