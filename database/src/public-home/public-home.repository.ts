import { CourseStatus, prisma } from "@academy/db";

/** Database-only read for the number of published public courses. */
export async function countPublishedCourses() {
  return prisma.course.count({
    where: {
      status: CourseStatus.PUBLISHED,
      products: {
        some: {
          isActive: true,
          prices: {
            some: {
              isDefault: true,
            },
          },
        },
      },
    },
  });
}

/** Database-only read for published courses used in the public landing/catalog preview. */
export async function listPublishedLandingCourses(limit = 8) {
  return prisma.course.findMany({
    where: {
      status: CourseStatus.PUBLISHED,
      products: {
        some: {
          isActive: true,
          prices: {
            some: {
              isDefault: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
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
  });
}
