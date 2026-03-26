import { auth } from "@academy/auth";

import { getPublicCatalogPayload } from "@backend/public-catalog/get-public-catalog-payload";
import { CatalogPageContent } from "@frontend/catalog/components/catalog-page-content";

import { PublicFooter } from "@/components/marketing/public-footer";
import {
  PublicButton,
} from "@/components/marketing/public-primitives";
import {
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";
import { formatPublicCopy } from "@/lib/public-copy";

export default async function CatalogPage() {
  const session = await auth();
  const payload = await getPublicCatalogPayload(session?.user?.id);

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
                      {formatPublicCopy("Каталог курсов")}
                    </p>
                    <p className="max-w-[560px] text-sm leading-6 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Выбирай программу под задачу сделки: старт в профессии, работа с продавцом, путь покупателя, переговоры, безопасность и документы.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <PublicButton href="/" tone="secondary">
                    {formatPublicCopy("На главную")}
                  </PublicButton>
                  {session?.user ? (
                    <PublicButton href="/after-sign-in">
                      {formatPublicCopy("В кабинет")}
                    </PublicButton>
                  ) : (
                    <PublicButton href="/sign-in">
                      {formatPublicCopy("Войти")}
                    </PublicButton>
                  )}
                </div>
              </div>
            </header>

            <CatalogPageContent
              payload={payload}
              isAuthenticated={Boolean(session?.user)}
            />
            <PublicFooter />
          </div>
        </section>
      </div>
    </main>
  );
}

