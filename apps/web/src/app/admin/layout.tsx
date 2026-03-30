import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { USER_ROLES } from "@academy/shared";

import { LogoutButton } from "@/components/auth/logout-button";
import { AdminNav } from "@/components/admin/admin-nav";
import { AcademyMark } from "@/components/brand/academy-mark";
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
      {/* ─── Sticky top bar ─── */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="px-4 md:px-6">
          {/* Row 1: brand + action buttons */}
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--foreground)] text-white shadow-sm">
                <AcademyMark className="w-[18px]" title="Академия риэлторов" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)] leading-none">
                  Академия риэлторов
                </p>
                <p
                  className="mt-0.5 text-sm font-semibold text-[var(--foreground)] leading-tight truncate"
                  title={getWorkspaceDescription(viewer.effectiveRole, viewer.user.email)}
                >
                  {getWorkspaceTitle(viewer.effectiveRole)}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
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
                <Link href="/support">РџРѕРґРґРµСЂР¶РєР°</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>

          {/* Row 2: navigation tabs + role switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <AdminNav effectiveRole={viewer.effectiveRole} />
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
