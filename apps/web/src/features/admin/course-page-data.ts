import { prisma } from "@academy/db";
import { notFound } from "next/navigation";

function isLessonsCountModule(
  module: unknown,
): module is { _count: { lessons: number } } {
  if (!module || typeof module !== "object") {
    return false;
  }

  const count = (module as { _count?: unknown })._count;

  if (!count || typeof count !== "object" || !("lessons" in count)) {
    return false;
  }

  return typeof count.lessons === "number";
}

function isLessonsArrayModule(module: unknown): module is { lessons: unknown[] } {
  if (!module || typeof module !== "object") {
    return false;
  }

  return "lessons" in module && Array.isArray(module.lessons);
}

export function getCourseLessonCount(modules: unknown[]): number {
  return modules.reduce<number>((sum, module) => {
    if (isLessonsCountModule(module)) {
      return sum + module._count.lessons;
    }

    if (isLessonsArrayModule(module)) {
      return sum + module.lessons.length;
    }

    return sum;
  }, 0);
}

export function extractLessonBody(content: unknown) {
  if (
    content &&
    typeof content === "object" &&
    "body" in content &&
    typeof content.body === "string"
  ) {
    return content.body;
  }

  return "";
}

export async function getAdminCourseShell(courseId: string) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      status: true,
      modules: {
        orderBy: {
          position: "asc",
        },
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

  if (!course) {
    notFound();
  }

  return {
    ...course,
    lessonCount: getCourseLessonCount(course.modules),
  };
}
