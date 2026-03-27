import Link from "next/link";

import { auth } from "@academy/auth";

import { getPublicCatalogPayload } from "@backend/public-catalog/get-public-catalog-payload";
import { CatalogPageContent } from "@frontend/catalog/components/catalog-page-content";

import { PageContainer } from "@/components/layout/page-grid";
import { PublicFooter } from "@/components/marketing/public-footer";
import { PublicButton } from "@/components/marketing/public-primitives";
import { marketingBody, marketingDisplay } from "@/lib/marketing-theme";
import { formatPublicCopy } from "@/lib/public-copy";

export default async function CatalogPage() {
  const session = await auth();
  const payload = await getPublicCatalogPayload(session?.user?.id);

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} min-h-screen bg-[var(--surface-strong)] font-[family:var(--font-landing-body)] text-[var(--foreground)]`}
    >
      {/* ─── STICKY HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/96 backdrop-blur-sm">
        <PageContainer className="flex h-16 items-center justify-between gap-4 py-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--foreground)] text-xs font-bold text-white">
              AR
            </div>
            <span className="hidden text-sm font-semibold text-[var(--foreground)] sm:block">
              Академия риэлторов
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              На главную
            </Link>
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
        </PageContainer>
      </header>

      {/* ─── HERO ──────────────────────────────────────────────────── */}
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

      {/* ─── COURSE GRID ───────────────────────────────────────────── */}
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
