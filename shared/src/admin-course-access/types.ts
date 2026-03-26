export type CourseAccessMode = "free" | "demo_charge";

export type AdminCourseAccessStudentOption = {
  id: string;
  label: string;
};

export type AdminCourseAccessEnrollment = {
  id: string;
  userId: string;
  studentName: string;
  email: string;
  statusLabel: string;
  statusVariant: "default" | "neutral" | "success" | "warning";
  completedLessons: number;
  totalLessons: number;
  accessSourceLabel: string;
};

export type AdminCourseAccessPayload = {
  courseId: string;
  courseTitle: string;
  description: string | null;
  lessonCount: number;
  enrollmentCount: number;
  isPaidCourse: boolean;
  amountValue: string;
  currency: string;
  priceLabel: string | null;
  offerActive: boolean;
  availableStudents: AdminCourseAccessStudentOption[];
  enrollments: AdminCourseAccessEnrollment[];
  stats: Array<{
    label: string;
    value: string;
    hint: string;
  }>;
};
