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

      <WorkspacePanel
        eyebrow="Наполнение"
        title="Как сейчас добавляются статьи"
        description="База знаний уже собрана как продуктовая структура, но полноценного редактора статей в интерфейсе пока нет."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-5 text-sm leading-7 text-[var(--foreground)]">
            <p>
              Сейчас материалы живут в структурированном контент-модуле и поэтому
              хорошо контролируются по ролям и порядку показа.
            </p>
            <p className="mt-3 text-[var(--muted)]">
              Следующий логичный шаг — вынести базу знаний в отдельную сущность и
              дать тебе интерфейс для создания своих разделов и статей прямо из
              админки, без правки кода.
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Следующий шаг
            </p>
            <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
              Редактор базы знаний
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Разделы, статьи, аудитория, порядок и публикация через интерфейс.
            </p>
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel className="overflow-hidden p-0">
        <KnowledgeBasePageContent
          payload={payload}
          audienceLinks={audienceLinks}
        />
      </WorkspacePanel>
    </div>
  );
}
