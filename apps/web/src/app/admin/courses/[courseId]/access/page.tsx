import { notFound } from "next/navigation";

import { getAdminCourseAccessPayload } from "@backend/admin-course-access/get-admin-course-access-payload";
import { CourseAccessPageContent } from "@frontend/admin/components/course-access-page-content";

import { requireAdminUser } from "@/lib/admin";

type CourseAccessPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseAccessPage({
  params,
}: CourseAccessPageProps) {
  await requireAdminUser();

  const { courseId } = await params;
  const payload = await getAdminCourseAccessPayload(courseId);

  if (!payload) {
    notFound();
  }

  return <CourseAccessPageContent payload={payload} />;
}
