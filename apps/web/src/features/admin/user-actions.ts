"use server";

import { EnrollmentStatus, prisma } from "@academy/db";
import { hashPassword } from "@academy/auth";
import { USER_ROLES } from "@academy/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin";

const createStudentSchema = z.object({
  email: z.email().trim().toLowerCase(),
  name: z.string().trim().min(2),
  password: z.string().min(5),
  courseId: z.string().trim().min(1).optional(),
});

const enrollmentSchema = z.object({
  userId: z.string().trim().min(1),
  courseId: z.string().trim().min(1),
});

function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function refreshStudentAdminRoutes(courseId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/students");
  revalidatePath("/learning");

  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/learning/courses/${courseId}`);
  }
}

export async function createStudent(formData: FormData) {
  await requireAdminUser();

  const parsed = createStudentSchema.parse({
    email: getTrimmedValue(formData, "email"),
    name: getTrimmedValue(formData, "name"),
    password: getTrimmedValue(formData, "password"),
    courseId: getTrimmedValue(formData, "courseId") || undefined,
  });

  const existingUser = await prisma.user.findUnique({
    where: {
      email: parsed.email,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (existingUser && existingUser.role !== USER_ROLES.STUDENT) {
    throw new Error("A non-student user with this email already exists.");
  }

  const passwordHash = await hashPassword(parsed.password);

  let userId = existingUser?.id;

  if (existingUser) {
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        name: parsed.name,
        passwordHash,
      },
    });
  } else {
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        name: parsed.name,
        passwordHash,
        emailVerified: new Date(),
        role: USER_ROLES.STUDENT,
      },
    });

    userId = user.id;
  }

  if (parsed.courseId && userId) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId: parsed.courseId,
        },
      },
      create: {
        userId,
        courseId: parsed.courseId,
        status: EnrollmentStatus.ACTIVE,
        startedAt: new Date(),
      },
      update: {
        status: EnrollmentStatus.ACTIVE,
        startedAt: new Date(),
        completedAt: null,
      },
    });
  }

  refreshStudentAdminRoutes(parsed.courseId);
}

export async function enrollStudentInCourse(formData: FormData) {
  await requireAdminUser();

  const parsed = enrollmentSchema.parse({
    userId: getTrimmedValue(formData, "userId"),
    courseId: getTrimmedValue(formData, "courseId"),
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: parsed.userId,
        courseId: parsed.courseId,
      },
    },
    create: {
      userId: parsed.userId,
      courseId: parsed.courseId,
      status: EnrollmentStatus.ACTIVE,
      startedAt: new Date(),
    },
    update: {
      status: EnrollmentStatus.ACTIVE,
      startedAt: new Date(),
      completedAt: null,
    },
  });

  refreshStudentAdminRoutes(parsed.courseId);
}

export async function removeEnrollment(formData: FormData) {
  await requireAdminUser();

  const parsed = enrollmentSchema.parse({
    userId: getTrimmedValue(formData, "userId"),
    courseId: getTrimmedValue(formData, "courseId"),
  });

  await prisma.$transaction([
    prisma.lessonProgress.deleteMany({
      where: {
        userId: parsed.userId,
        lesson: {
          module: {
            courseId: parsed.courseId,
          },
        },
      },
    }),
    prisma.enrollment.deleteMany({
      where: {
        userId: parsed.userId,
        courseId: parsed.courseId,
      },
    }),
  ]);

  refreshStudentAdminRoutes(parsed.courseId);
}

export async function resetCourseProgress(formData: FormData) {
  await requireAdminUser();

  const parsed = enrollmentSchema.parse({
    userId: getTrimmedValue(formData, "userId"),
    courseId: getTrimmedValue(formData, "courseId"),
  });

  await prisma.lessonProgress.deleteMany({
    where: {
      userId: parsed.userId,
      lesson: {
        module: {
          courseId: parsed.courseId,
        },
      },
    },
  });

  refreshStudentAdminRoutes(parsed.courseId);
}
