import { auth } from "@academy/auth";
import { redirect } from "next/navigation";

import { getPublicAuthScreenPayload } from "@backend/public-auth/get-public-auth-screen-payload";
import { SignInPageContent } from "@frontend/auth/components/sign-in-page-content";

import { PublicFooter } from "@/components/marketing/public-footer";
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
            <header className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[rgba(255,255,255,0.9)] px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur md:px-6">
              <div className="flex min-h-20 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--foreground)] text-sm font-semibold text-white">
                    AR
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatPublicCopy("Авторизация и регистрация")}
                    </p>
                    <p className="max-w-[560px] text-sm leading-6 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Отдельный экран входа для учеников и авторов: почта, пароль и быстрый вход через Яндекс.",
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

            <SignInPageContent payload={payload} />
            <PublicFooter />
          </div>
        </section>
      </div>
    </main>
  );
}

