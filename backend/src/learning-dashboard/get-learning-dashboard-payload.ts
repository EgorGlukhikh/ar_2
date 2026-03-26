import type { LearningDashboardPayload } from "@shared/learning-dashboard/types";

import {
  getElevatedLearningDashboardSnapshot,
  getStudentLearningDashboardSnapshot,
} from "@database/learning-dashboard/learning-dashboard.repository";

export async function getLearningDashboardPayload(input: {
  userId: string;
  isElevated: boolean;
}): Promise<LearningDashboardPayload> {
  const courses = input.isElevated
    ? await getElevatedLearningDashboardSnapshot()
    : await getStudentLearningDashboardSnapshot(input.userId);

  const averageProgress =
    courses.length === 0
      ? 0
      : Math.round(
          courses.reduce((sum, course) => sum + course.progressPercent, 0) /
            courses.length,
        );

  return {
    isElevated: input.isElevated,
    totalCourses: courses.length,
    averageProgress,
    hasNextLesson: courses.some((course) => Boolean(course.nextLessonTitle)),
    courses,
  };
}
