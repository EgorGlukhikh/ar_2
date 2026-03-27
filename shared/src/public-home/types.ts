export type LandingRole = "learn" | "author";

export type PublicLessonPreview = {
  id: string;
  title: string;
};

export type PublicModulePreview = {
  id: string;
  title: string;
  lessons: PublicLessonPreview[];
};

export type PublicCourseCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessonCount: number;
  priceLabel: string;
  authorName: string;
  modules: PublicModulePreview[];
};

export type PublicHomePayload = {
  publishedCourses: number;
  courses: PublicCourseCard[];
};
