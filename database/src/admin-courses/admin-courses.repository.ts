import { prisma } from "@academy/db";

const courseStatusLabelMap = {
  DRAFT: "Черновик",
  PUBLISHED: "Опубликован",
  ARCHIVED: "Архив",
} as const;

const courseStatusVariantMap = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  ARCHIVED: "warning",
} as const;

export async function getAdminCoursesSnapshot(input: {
  authorId?: string;
}) {
  const courses = await prisma.course.findMany({
    where: input.authorId ? { authorId: input.authorId } : undefined,
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      modules: {
        select: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
    },
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    statusLabel: courseStatusLabelMap[course.status],
    statusVariant: courseStatusVariantMap[course.status],
    moduleCount: course._count.modules,
    lessonCount: course.modules.reduce(
      (sum, module) => sum + module._count.lessons,
      0,
    ),
    enrollmentCount: course._count.enrollments,
    authorLabel: course.author
      ? course.author.name || course.author.email
      : null,
  }));
}
