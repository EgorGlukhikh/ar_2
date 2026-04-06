import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { AcademyMark } from "@/components/brand/academy-mark";
import { LearningNav } from "@/components/learning/learning-nav";
import {
  systemBrandMarkShellClassName,
  systemTopbarActionsClassName,
  systemTopbarClassName,
  systemTopbarInnerClassName,
  systemTopbarPrimaryRowClassName,
  systemTopbarSecondaryRowClassName,
} from "@/components/system/system-ui";
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
      <header className={systemTopbarClassName}>
        <div className={systemTopbarInnerClassName}>
          <div className={systemTopbarPrimaryRowClassName}>
            <div className="flex items-center gap-3">
              <div className={systemBrandMarkShellClassName}>
                <AcademyMark className="w-[18px]" title="Академия риэлторов" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] leading-none font-semibold tracking-[0.22em] text-[var(--muted)] uppercase">
                  Академия риэлторов
                </p>
                <p className="mt-0.5 text-sm leading-tight font-semibold text-[var(--foreground)]">
                  {viewer.effectiveRole === "STUDENT"
                    ? "Учебный кабинет"
                    : "Учебный просмотр"}
                </p>
              </div>
            </div>

            <div className={systemTopbarActionsClassName}>
              {hasTeamAccess ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin">Рабочий кабинет</Link>
                </Button>
              ) : null}
              <Button asChild size="sm" variant="outline">
                <Link href={knowledgeBaseHref}>База знаний</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/support">Поддержка</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>

          <div className={systemTopbarSecondaryRowClassName}>
            <LearningNav />
            <RolePreviewSwitcher
              actualRole={viewer.actualRole}
              effectiveRole={viewer.effectiveRole}
              previewRole={viewer.previewRole}
            />
          </div>
        </div>
      </header>

      <section className="min-w-0 px-4 py-5 md:px-6 md:py-6">{children}</section>
    </main>
  );
}
