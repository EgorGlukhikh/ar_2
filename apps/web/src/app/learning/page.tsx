import { getLearningDashboardPayload } from "@backend/learning-dashboard/get-learning-dashboard-payload";
import { LearningDashboardPageContent } from "@frontend/learning/components/learning-dashboard-page-content";

import { isElevatedUserRole, requireStudentOrElevatedUser } from "@/lib/user";

export default async function LearningDashboardPage() {
  const user = await requireStudentOrElevatedUser();
  const payload = await getLearningDashboardPayload({
    userId: user.id,
    isElevated: isElevatedUserRole(user.role),
  });

  return <LearningDashboardPageContent payload={payload} />;
}
