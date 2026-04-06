import Link from "next/link";

import { auth } from "@academy/auth";

import { getPublicCatalogPayload } from "@backend/public-catalog/get-public-catalog-payload";
import { CatalogPageContent } from "@frontend/catalog/components/catalog-page-content";

import { AcademyMark } from "@/components/brand/academy-mark";
import { PageContainer } from "@/components/layout/page-grid";
import { PublicFooter } from "@/components/marketing/public-footer";
import { Button } from "@/components/ui/button";
import { marketingBody, marketingDisplay } from "@/lib/marketing-theme";
import { formatPublicCopy } from "@/lib/public-copy";

export default async function CatalogPage() {
  const session = await auth();
  const payload = await getPublicCatalogPayload(session?.user?.id);

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} min-h-screen bg-[var(--surface-strong)] font-[family:var(--font-landing-body)] text-[var(--foreground)]`}
    >
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/96 backdrop-blur-sm">
        <PageContainer className="flex h-16 items-center justify-between gap-4 py-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--foreground)] text-white">
              <AcademyMark className="w-5" title="Академия риэлторов" />
            </div>
            <span className="hidden text-sm font-semibold text-[var(--foreground)] sm:block">
              Академия риэлторов
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/">
              На главную
              </Link>
            </Button>
            {session?.user ? (
              <Button asChild size="sm">
                <Link href="/after-sign-in">
                {formatPublicCopy("В кабинет")}
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/sign-in">
                {formatPublicCopy("Войти")}
                </Link>
              </Button>
            )}
          </div>
        </PageContainer>
      </header>

      <section className="bg-[var(--foreground)] py-14">
        <PageContainer>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
            Каталог курсов
          </p>
          <h1 className="mt-4 max-w-[22ch] text-[clamp(1.8rem,3.5vw,2.8rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
            {formatPublicCopy("Выбирай программу под задачу сделки")}
          </h1>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-7 text-white/64">
            {formatPublicCopy(
              "Старт в профессии, работа с продавцом, путь покупателя, переговоры, безопасность и документы.",
            )}
          </p>
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer>
          <CatalogPageContent
            payload={payload}
            isAuthenticated={Boolean(session?.user)}
          />
        </PageContainer>
      </section>

      <PublicFooter />
    </main>
  );
}
