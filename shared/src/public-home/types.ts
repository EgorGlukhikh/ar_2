export type LandingRole = "learn" | "author";

export type PublicCourseCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessonCount: number;
  priceLabel: string;
};

export type PublicHomePayload = {
  publishedCourses: number;
  courses: PublicCourseCard[];
};
