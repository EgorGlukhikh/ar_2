import { USER_ROLES } from "@academy/shared";
import { notFound } from "next/navigation";

import { getAdminCoursesPayload } from "@backend/admin-courses/get-admin-courses-payload";
import { CoursesPageContent } from "@frontend/admin/components/courses-page-content";

import { canCreateCourses } from "@/lib/admin";
import { requireAdminViewer } from "@/lib/viewer";

export default async function CoursesPage() {
  const viewer = await requireAdminViewer();
  const isAuthorMode = viewer.effectiveRole === USER_ROLES.AUTHOR;
  const isAdminMode = viewer.effectiveRole === USER_ROLES.ADMIN;

  if (!isAuthorMode && !isAdminMode) {
    notFound();
  }

  const payload = await getAdminCoursesPayload({
    isAuthorMode,
    isAdminMode,
    canCreateCourse: canCreateCourses({
      ...viewer.user,
      role: viewer.effectiveRole,
    }),
    authorId: isAuthorMode ? viewer.user.id : undefined,
  });

  return <CoursesPageContent payload={payload} />;
}
