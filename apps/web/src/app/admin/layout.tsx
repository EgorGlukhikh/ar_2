import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { USER_ROLES } from "@academy/shared";

import { LogoutButton } from "@/components/auth/logout-button";
import { AdminNav } from "@/components/admin/admin-nav";
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,196,147,0.12),_transparent_20%),linear-gradient(180deg,_#f3efe8_0%,_#edf2f8_54%,_#eaf0f7_100%)] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header className="rounded-[32px] border border-white/85 bg-[linear-gradient(180deg,_rgba(255,252,247,0.96)_0%,_rgba(255,255,255,0.9)_100%)] p-4 shadow-[0_26px_80px_rgba(24,32,54,0.08)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex flex-col gap-4 xl:min-w-0 xl:flex-1">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,_#182036_0%,_#2c4279_100%)] text-sm font-semibold text-white shadow-[0_16px_34px_rgba(24,32,54,0.2)]">
                    AR
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a6548]">
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
      </div>
    </main>
  );
}
