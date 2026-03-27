import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { USER_ROLES } from "@academy/shared";

import { LogoutButton } from "@/components/auth/logout-button";
import { AdminNav } from "@/components/admin/admin-nav";
import { SystemContainer, systemHeaderCardClassName } from "@/components/system/system-ui";
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

  const knowledgeBaseHref =
    viewer.effectiveRole === USER_ROLES.ADMIN
      ? null
      : viewer.effectiveRole === USER_ROLES.AUTHOR || viewer.effectiveRole === USER_ROLES.CURATOR
        ? "/knowledge-base?role=teacher"
        : "/knowledge-base?role=student";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 md:px-6 md:py-6">
      <SystemContainer className="space-y-6 px-0">
        <header className={`${systemHeaderCardClassName} p-4 md:p-5`}>
          {/* Ряд 1: бренд + кнопки действий */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--foreground)] text-sm font-semibold text-white shadow-[var(--shadow-md)]">
                AR
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Академия риэлторов
                </p>
                <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  {getWorkspaceTitle(viewer.effectiveRole)}
                </h1>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  {getWorkspaceDescription(viewer.effectiveRole, viewer.user.email)}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {canCreateCourse ? (
                <Button asChild>
                  <Link href="/admin/courses/new">Новый курс</Link>
                </Button>
              ) : null}
              {knowledgeBaseHref ? (
                <Button asChild variant="outline">
                  <Link href={knowledgeBaseHref}>База знаний</Link>
                </Button>
              ) : null}
              {viewer.effectiveRole !== USER_ROLES.ADMIN ? (
                <Button asChild variant="outline">
                  <Link href="/learning">Учебный кабинет</Link>
                </Button>
              ) : null}
              <LogoutButton />
            </div>
          </div>

          {/* Ряд 2: навигация + переключатель ролей */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <AdminNav effectiveRole={viewer.effectiveRole} />
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
