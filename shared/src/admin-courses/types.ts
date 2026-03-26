export type AdminCoursesListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  statusLabel: string;
  statusVariant: "default" | "neutral" | "success" | "warning";
  moduleCount: number;
  lessonCount: number;
  enrollmentCount: number;
  authorLabel: string | null;
};

export type AdminCoursesPayload = {
  isAuthorMode: boolean;
  isAdminMode: boolean;
  canCreateCourse: boolean;
  totalCourses: number;
  courses: AdminCoursesListItem[];
};
