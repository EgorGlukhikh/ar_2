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

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 md:px-6 md:py-6">
      <SystemContainer className="space-y-6 px-0">
        <header className={`${systemHeaderCardClassName} p-4 md:p-5`}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex flex-col gap-4 xl:min-w-0 xl:flex-1">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[var(--foreground)] text-sm font-semibold text-white shadow-[var(--shadow-md)]">
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

                <AdminNav effectiveRole={viewer.effectiveRole} />
              </div>

              <RolePreviewSwitcher
                actualRole={viewer.actualRole}
                effectiveRole={viewer.effectiveRole}
                previewRole={viewer.previewRole}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              {canCreateCourse ? (
                <Button asChild>
                  <Link href="/admin/courses/new">Новый курс</Link>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href="/">Открыть портал</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/learning">Учебный кабинет</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>
        </header>

        <section className="min-w-0">{children}</section>
      </SystemContainer>
    </main>
  );
}
