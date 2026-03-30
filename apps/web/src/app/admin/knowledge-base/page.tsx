import { USER_ROLES } from "@academy/shared";

import { KnowledgeBasePageContent } from "@frontend/knowledge-base/components/knowledge-base-page-content";
import { getKnowledgeBasePayload } from "@shared/knowledge-base/content";

import {
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/workspace/workspace-primitives";
import { requireAdminViewer } from "@/lib/viewer";

type AdminKnowledgeBasePageProps = {
  searchParams?: Promise<{
    role?: string;
  }>;
};

export default async function AdminKnowledgeBasePage({
  searchParams,
}: AdminKnowledgeBasePageProps) {
  const viewer = await requireAdminViewer();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedRole = resolvedSearchParams.role;

  const audience =
    requestedRole === "student" && viewer.effectiveRole === USER_ROLES.ADMIN
      ? "student"
      : "teacher";

  const payload = getKnowledgeBasePayload(audience);
  const audienceLinks =
    viewer.effectiveRole === USER_ROLES.ADMIN
      ? [
          {
            href: "/admin/knowledge-base?role=teacher",
            label: "Режим преподавателя",
            active: audience === "teacher",
          },
          {
            href: "/admin/knowledge-base?role=student",
            label: "Режим студента",
            active: audience === "student",
          },
        ]
      : undefined;

  return (
    <div className="space-y-6">
      <WorkspacePageHeader
        eyebrow="База знаний"
        title="Инструкции и сценарии платформы"
        description="Здесь собраны пошаговые статьи по работе с курсами, уроками, оплатами, доступами, домашними заданиями и повседневным маршрутам студента и преподавателя."
      />

      <WorkspacePanel className="overflow-hidden p-0">
        <KnowledgeBasePageContent
          payload={payload}
          audienceLinks={audienceLinks}
        />
      </WorkspacePanel>
    </div>
  );
}
