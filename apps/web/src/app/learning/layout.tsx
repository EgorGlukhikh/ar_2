import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { LearningNav } from "@/components/learning/learning-nav";
import { Button } from "@/components/ui/button";
import { RolePreviewSwitcher } from "@/components/workspace/role-preview-switcher";
import { isElevatedUserRole } from "@/lib/user";
import { requireLearningViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export default async function LearningLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await requireLearningViewer();
  const hasTeamAccess = isElevatedUserRole(viewer.actualRole);
  const knowledgeBaseHref = hasTeamAccess
    ? "/knowledge-base?role=teacher"
    : "/knowledge-base?role=student";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f9ff_0%,_#f1f5ff_100%)]">
      {/* ─── Sticky top bar ─── */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="px-4 md:px-6">
          {/* Row 1: brand + actions */}
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1c2442] text-[11px] font-bold text-white shadow-sm">
                AR
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)] leading-none">
                  Академия риэлторов
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--foreground)] leading-tight">
                  {viewer.effectiveRole === "STUDENT"
                    ? "Учебный кабинет"
                    : "Учебный просмотр"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {hasTeamAccess ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin">Рабочий кабинет</Link>
                </Button>
              ) : null}
              <Button asChild size="sm" variant="outline">
                <Link href={knowledgeBaseHref}>База знаний</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>

          {/* Row 2: nav + role switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <LearningNav />
            <RolePreviewSwitcher
              actualRole={viewer.actualRole}
              effectiveRole={viewer.effectiveRole}
              previewRole={viewer.previewRole}
            />
          </div>
        </div>
      </header>

      {/* ─── Full-width content ─── */}
      <section className="min-w-0 px-4 py-5 md:px-6 md:py-6">
        {children}
      </section>
    </main>
  );
}
