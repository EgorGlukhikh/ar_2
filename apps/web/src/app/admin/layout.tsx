import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { USER_ROLES } from "@academy/shared";

import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { AcademyMark } from "@/components/brand/academy-mark";
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
import { canCreateCourses } from "@/lib/admin";
import { requireAdminViewer } from "@/lib/viewer";
import { getWorkspaceDescription, getWorkspaceTitle } from "@/lib/workspace-role";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await requireAdminViewer();

  if (viewer.effectiveRole === USER_ROLES.STUDENT) {
    redirect("/learning");
  }

  const canCreateCourse = canCreateCourses({
    ...viewer.user,
    role: viewer.effectiveRole,
  });

  const knowledgeBaseHref = "/admin/knowledge-base";

  return (
    <main className="min-h-screen bg-[var(--background)]">
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
                <p
                  className="mt-0.5 truncate text-sm leading-tight font-semibold text-[var(--foreground)]"
                  title={getWorkspaceDescription(viewer.effectiveRole, viewer.user.email)}
                >
                  {getWorkspaceTitle(viewer.effectiveRole)}
                </p>
              </div>
            </div>

            <div className={systemTopbarActionsClassName}>
              {canCreateCourse ? (
                <Button asChild size="sm">
                  <Link href="/admin/courses/new">+ Новый курс</Link>
                </Button>
              ) : null}
              {knowledgeBaseHref ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={knowledgeBaseHref}>База знаний</Link>
                </Button>
              ) : null}
              {viewer.effectiveRole !== USER_ROLES.ADMIN ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/learning">Учебный кабинет</Link>
                </Button>
              ) : null}
              <Button asChild size="sm" variant="outline">
                <Link href="/support">Поддержка</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>

          <div className={systemTopbarSecondaryRowClassName}>
            <AdminNav effectiveRole={viewer.effectiveRole} />
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
