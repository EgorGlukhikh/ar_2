export type LearningDashboardCourse = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  statusLabel: string;
  statusVariant: "default" | "neutral" | "success" | "warning";
  lessonCount: number;
  completedLessons: number;
  progressPercent: number;
  nextLessonTitle: string | null;
};

export type LearningDashboardPayload = {
  isElevated: boolean;
  totalCourses: number;
  averageProgress: number;
  hasNextLesson: boolean;
  courses: LearningDashboardCourse[];
};
