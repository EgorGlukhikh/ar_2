import {
  CourseStatus,
  EnrollmentStatus,
  prisma,
} from "@academy/db";

export async function listPublishedCatalogCourses(userId?: string) {
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
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        take: 1,
      },
      enrollments: userId
        ? {
            where: {
              userId,
              status: {
                not: EnrollmentStatus.CANCELED,
              },
            },
            take: 1,
          }
        : false,
    },
  });
}
