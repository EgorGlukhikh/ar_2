import { auth } from "@academy/auth";
import { CourseStatus, prisma } from "@academy/db";
import { redirect } from "next/navigation";

import { LandingExperience } from "@/components/marketing/landing-experience";
import {
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  const [publishedCourses, showcaseCourses] = await Promise.all([
    prisma.course.count({
      where: {
        status: CourseStatus.PUBLISHED,
      },
    }),
    prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 3,
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
              },
            },
          },
        },
        products: {
          where: {
            isActive: true,
          },
          include: {
            prices: {
              where: {
                isDefault: true,
              },
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          take: 1,
        },
      },
    }),
  ]);

  const courses = showcaseCourses.map((course) => {
    const lessonCount = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );
    const defaultPrice = course.products[0]?.prices[0];
    const priceLabel =
      defaultPrice && defaultPrice.amount === 0
        ? "Бесплатно"
        : defaultPrice
          ? `${(defaultPrice.amount / 100).toFixed(0)} ₽`
          : "Цена скоро";

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description ?? "",
      lessonCount,
      priceLabel,
    };
  });

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <LandingExperience
              publishedCourses={publishedCourses}
              courses={courses}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
