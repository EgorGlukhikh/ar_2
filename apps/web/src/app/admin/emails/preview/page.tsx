import Link from "next/link";

import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { Button } from "@/components/ui/button";
import {
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/workspace/workspace-primitives";
import { requireRoleAccess } from "@/lib/admin";
import {
  emailTemplateCatalogMap,
  emailTemplateKeys,
  type EmailTemplateKey,
} from "@/lib/email/catalog";
import { renderTemplateByKey } from "@/lib/email/templates";

type AdminEmailPreviewPageProps = {
  searchParams: Promise<{
    template?: string;
    courseId?: string;
  }>;
};

function buildAbsoluteUrl(path: string) {
  const base =
    process.env.APP_BASE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000";

  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export default async function AdminEmailPreviewPage({
  searchParams,
}: AdminEmailPreviewPageProps) {
  await requireRoleAccess([USER_ROLES.ADMIN, USER_ROLES.SALES_MANAGER]);

  const { template, courseId } = await searchParams;
  const templateKey = emailTemplateKeys.includes(template as EmailTemplateKey)
    ? (template as EmailTemplateKey)
    : "campaign-course-launch";

  const course = courseId
    ? await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          title: true,
          slug: true,
        },
      })
    : null;

  const rendered = renderTemplateByKey(templateKey, {
    recipientName: "Получатель",
    courseTitle: course?.title,
    links: {
      catalogUrl: buildAbsoluteUrl("/catalog"),
      signInUrl: buildAbsoluteUrl("/sign-in"),
      learningUrl: buildAbsoluteUrl("/learning"),
      courseUrl: course?.slug
        ? buildAbsoluteUrl(`/catalog#${course.slug}`)
        : buildAbsoluteUrl("/catalog"),
      expertUrl: buildAbsoluteUrl("/admin/courses"),
      preferencesUrl: buildAbsoluteUrl("/email/preferences?token=demo-preview"),
    },
    replyEmail:
      process.env.EMAIL_REPLY_TO_EMAIL ||
      process.env.EMAIL_FROM_EMAIL ||
      "academy@example.com",
  });

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Preview"
        title={emailTemplateCatalogMap[templateKey].label}
        description="Предпросмотр HTML-письма в брендовой вёрстке платформы."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/emails?section=email-test-section">
              Вернуться в почтовый центр
            </Link>
          </Button>
        }
      />

      <WorkspacePanel
        eyebrow="Тема письма"
        title={rendered.subject}
        description={rendered.preheader}
        className="overflow-hidden"
      >
        <div
          className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[#eef3ff]"
          dangerouslySetInnerHTML={{ __html: rendered.html }}
        />
      </WorkspacePanel>
    </section>
  );
}
