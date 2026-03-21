import type { ReactNode } from "react";
import Link from "next/link";

import { AdminCourseTabs } from "@/components/admin/admin-course-tabs";
import { Badge } from "@/components/ui/badge";
import { getAdminCourseShell } from "@/features/admin/course-page-data";
import { courseStatusLabelMap, courseStatusVariantMap } from "@/lib/labels";

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
  const { courseId } = await params;
  const course = await getAdminCourseShell(courseId);

  return (
    <div className="space-y-6">
      <header className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
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
                <p className="text-sm text-[var(--muted)]">/{course.slug}</p>
                <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
                  {course.description ||
                    "Добавь краткое описание курса, чтобы команде было проще ориентироваться в его назначении и формате."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
              <span className="rounded-full bg-[var(--surface)] px-3 py-2">
                Модулей: {course._count.modules}
              </span>
              <span className="rounded-full bg-[var(--surface)] px-3 py-2">
                Уроков: {course.lessonCount}
              </span>
              <span className="rounded-full bg-[var(--surface)] px-3 py-2">
                Зачислений: {course._count.enrollments}
              </span>
            </div>
          </div>

          <AdminCourseTabs courseId={course.id} />
        </div>
      </header>

      {children}
    </div>
  );
}
