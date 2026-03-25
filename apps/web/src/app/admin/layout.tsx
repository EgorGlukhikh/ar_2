import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { AdminNav } from "@/components/admin/admin-nav";
import { RolePreviewSwitcher } from "@/components/workspace/role-preview-switcher";
import { Button } from "@/components/ui/button";
import { requireAdminViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";

function getWorkspaceTitle(effectiveRole: string) {
  if (effectiveRole === "AUTHOR") {
    return "Кабинет автора";
  }

  return "Рабочий контур команды";
}

function getWorkspaceDescription(effectiveRole: string, email: string | null | undefined) {
  if (effectiveRole === "AUTHOR") {
    return `Режим автора для проверки каталога, структуры программ и контента. ${email ?? ""}`.trim();
  }

  return email ?? "";
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await requireAdminViewer();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f9ff_0%,_#f1f5ff_100%)] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header className="rounded-[28px] border border-[var(--border)] bg-white/90 p-4 shadow-[0_24px_70px_rgba(58,73,142,0.08)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex flex-col gap-4 xl:min-w-0 xl:flex-1">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c2442] text-sm font-semibold text-white">
                    AR
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
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

            <div className="flex flex-wrap gap-3 xl:justify-end">
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
