import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { SystemContainer, systemHeaderCardClassName } from "@/components/system/system-ui";
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
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f9ff_0%,_#f1f5ff_100%)] px-4 py-5 md:px-6 md:py-6">
      <SystemContainer className="space-y-6 px-0">
        <header className={`${systemHeaderCardClassName} p-4 md:p-5`}>
          {/* Ряд 1: бренд + кнопки действий */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[#1c2442] text-sm font-semibold text-white">
                AR
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Академия риэлторов
                </p>
                <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  {viewer.effectiveRole === "STUDENT"
                    ? "Учебный кабинет"
                    : "Учебный просмотр"}
                </h1>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  {viewer.user.email}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {hasTeamAccess ? (
                <Button asChild variant="outline">
                  <Link href="/admin">Рабочий кабинет</Link>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href={knowledgeBaseHref}>База знаний</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>

          {/* Ряд 2: навигация + переключатель ролей */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <LearningNav />
            <RolePreviewSwitcher
              actualRole={viewer.actualRole}
              effectiveRole={viewer.effectiveRole}
              previewRole={viewer.previewRole}
            />
          </div>
        </header>

        <section className="min-w-0">{children}</section>
      </SystemContainer>
    </main>
  );
}
