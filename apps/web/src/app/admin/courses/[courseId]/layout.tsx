import type { ReactNode } from "react";
import Link from "next/link";
import { GraduationCap, Settings2 } from "lucide-react";
import { USER_ROLES } from "@academy/shared";

import { AdminCourseTabs } from "@/components/admin/admin-course-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseThumb } from "@/components/workspace/workspace-primitives";
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
    <div className="space-y-6">
      <header className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <CourseThumb title={course.title} subtitle={`/${course.slug}`} />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-4">
                  <Link
                    href="/admin/courses"
                    className="inline-flex items-center text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]"
                  >
                    К списку курсов
                  </Link>

                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                      Управление курсом
                    </p>
                    <Badge variant={courseStatusVariantMap[course.status]}>
                      {courseStatusLabelMap[course.status]}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                      {course.title}
                    </h1>
                    <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
                      {course.description ||
                        "Добавь краткое описание курса, чтобы команде было проще ориентироваться в его назначении и формате."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href={`/learning/courses/${course.id}`}>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Проверить как студент
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/admin/courses/${course.id}`}>
                      <Settings2 className="mr-2 h-4 w-4" />
                      Настройки курса
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                <span className="rounded-full bg-[var(--surface)] px-3 py-2">
                  Модулей: {course._count.modules}
                </span>
                <span className="rounded-full bg-[var(--surface)] px-3 py-2">
                  Уроков: {course.lessonCount}
                </span>
                {isAdminMode ? (
                  <span className="rounded-full bg-[var(--surface)] px-3 py-2">
                    Зачислений: {course._count.enrollments}
                  </span>
                ) : null}
              </div>
            </div>

            <AdminCourseTabs courseId={course.id} showAccessTab={isAdminMode} />
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
