import { auth } from "@academy/auth";
import { redirect } from "next/navigation";

import { SignInPageContent } from "@frontend/auth/components/sign-in-page-content";

import { PublicButton } from "@/components/marketing/public-primitives";
import {
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";
import { formatPublicCopy } from "@/lib/public-copy";

type SignInPageProps = {
  searchParams?: Promise<{
    email?: string;
    invited?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const defaultEmail = resolvedSearchParams.email ?? "";
  const showInviteSuccess = resolvedSearchParams.invited === "1";

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <header className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.9)] px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur md:px-6">
              <div className="flex min-h-20 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[var(--foreground)] text-sm font-semibold text-white">
                    AR
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatPublicCopy("Вход в академию")}
                    </p>
                    <p className="max-w-[560px] text-sm leading-6 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Войди, чтобы продолжить обучение, открыть кабинет автора или вернуться к своим программам.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <PublicButton href="/" tone="secondary">
                    {formatPublicCopy("На главную")}
                  </PublicButton>
                  <PublicButton href="/catalog">
                    {formatPublicCopy("Открыть каталог")}
                  </PublicButton>
                </div>
              </div>
            </header>

            <SignInPageContent
              defaultEmail={defaultEmail}
              showInviteSuccess={showInviteSuccess}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
