import Link from "next/link";
import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";
import { Button } from "@/components/ui/button";
import { emailTemplateCatalogMap, emailTemplateKeys, type EmailTemplateKey } from "@/lib/email/catalog";
import { renderTemplateByKey } from "@/lib/email/templates";
import { requireRoleAccess } from "@/lib/admin";

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
        where: {
          id: courseId,
        },
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
      courseUrl: course?.slug ? buildAbsoluteUrl(`/catalog#${course.slug}`) : buildAbsoluteUrl("/catalog"),
      expertUrl: buildAbsoluteUrl("/admin/courses"),
      preferencesUrl: buildAbsoluteUrl("/email/preferences?token=demo-preview"),
    },
    replyEmail: process.env.EMAIL_REPLY_TO_EMAIL || process.env.EMAIL_FROM_EMAIL || "academy@example.com",
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Preview
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            {emailTemplateCatalogMap[templateKey].label}
          </h1>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Предпросмотр HTML-письма в брендовой верстке платформы.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/emails">Вернуться в почтовый центр</Link>
        </Button>
      </div>

      <article className="rounded-[32px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-lg)]">
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Тема письма
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{rendered.subject}</p>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{rendered.preheader}</p>
        </div>

        <div
          className="mt-6 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[#eef3ff]"
          dangerouslySetInnerHTML={{ __html: rendered.html }}
        />
      </article>
    </section>
  );
}
