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
};

export type PublicCatalogPayload = {
  featuredCourse: PublicCatalogCourse | null;
  courses: PublicCatalogCourse[];
};
