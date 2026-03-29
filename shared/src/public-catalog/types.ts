export type PublicCatalogLessonPreview = {
  id: string;
  title: string;
};

export type PublicCatalogModulePreview = {
  id: string;
  title: string;
  lessons: PublicCatalogLessonPreview[];
};

export type PublicCatalogCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  result: string;
  lessonCount: number;
  priceLabel: string;
  deliveryFormatLabel: string;
  canCheckout: boolean;
  isFree: boolean;
  hasAccess: boolean;
  modules: PublicCatalogModulePreview[];
};

export type PublicCatalogPayload = {
  featuredCourse: PublicCatalogCourse | null;
  courses: PublicCatalogCourse[];
};
