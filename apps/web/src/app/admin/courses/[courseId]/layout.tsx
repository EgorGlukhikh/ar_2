import type { ReactNode } from "react";
import Link from "next/link";
import { GraduationCap, Settings2 } from "lucide-react";
import { USER_ROLES } from "@academy/shared";

import { AdminCourseTabs } from "@/components/admin/admin-course-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminCourseShell } from "@/features/admin/course-page-data";
import { courseStatusLabelMap, courseStatusVariantMap } from "@/lib/labels";
import { requireAdminViewer } from "@/lib/viewer";

type CourseLayoutProps = {
  children: ReactNode;
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseLayout({
  children,
  params,
}: CourseLayoutProps) {
  const viewer = await requireAdminViewer();
  const { courseId } = await params;
  const course = await getAdminCourseShell(courseId);
  const isAdminMode = viewer.effectiveRole === USER_ROLES.ADMIN;

  return (
    <div className="space-y-0 -mx-4 md:-mx-6">
      {/* ─── Compact course header bar ─── */}
      <div className="border-b border-[var(--border)] bg-white px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left: back + title + badge + stats */}
          <div className="min-w-0">
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              ← К списку курсов
            </Link>

            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {course.title}
              </h1>
              <Badge variant={courseStatusVariantMap[course.status]}>
                {courseStatusLabelMap[course.status]}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
              <span>Модулей: {course._count.modules}</span>
              <span>Уроков: {course.lessonCount}</span>
              {isAdminMode ? (
                <span>Зачислений: {course._count.enrollments}</span>
              ) : null}
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={`/learning/courses/${course.id}`}>
                <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                Как студент
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={`/admin/courses/${course.id}`}>
                <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                Настройки
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <AdminCourseTabs courseId={course.id} showAccessTab={isAdminMode} />
        </div>
      </div>

      {/* ─── Page content (full width, padding restored) ─── */}
      <div className="px-4 py-5 md:px-6 md:py-6">
        {children}
      </div>
    </div>
  );
}
