import { auth } from "@academy/auth";
import { USER_ROLES } from "@academy/shared";
import { redirect } from "next/navigation";

import { KnowledgeBasePageContent } from "@frontend/knowledge-base/components/knowledge-base-page-content";
import { getKnowledgeBasePayload } from "@shared/knowledge-base/content";

type KnowledgeBasePageProps = {
  searchParams?: Promise<{
    role?: string;
  }>;
};

export default async function KnowledgeBasePage({
  searchParams,
}: KnowledgeBasePageProps) {
  const session = await auth();

  if (!session?.user?.role) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedRole = resolvedSearchParams.role;

  const audience =
    requestedRole === "teacher" && session.user.role === USER_ROLES.ADMIN
      ? "teacher"
      : requestedRole === "student" && session.user.role === USER_ROLES.ADMIN
        ? "student"
        : session.user.role === USER_ROLES.STUDENT
          ? "student"
          : "teacher";

  const payload = getKnowledgeBasePayload(audience);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-[1200px]">
        <KnowledgeBasePageContent payload={payload} />
      </div>
    </main>
  );
}
