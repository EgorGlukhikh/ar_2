import type { AdminCoursesPayload } from "@shared/admin-courses/types";

import { getAdminCoursesSnapshot } from "@database/admin-courses/admin-courses.repository";

export async function getAdminCoursesPayload(input: {
  isAuthorMode: boolean;
  isAdminMode: boolean;
  canCreateCourse: boolean;
  authorId?: string;
}): Promise<AdminCoursesPayload> {
  const courses = await getAdminCoursesSnapshot({
    authorId: input.authorId,
  });

  return {
    isAuthorMode: input.isAuthorMode,
    isAdminMode: input.isAdminMode,
    canCreateCourse: input.canCreateCourse,
    totalCourses: courses.length,
    courses,
  };
}
