"use server";

import { EnrollmentStatus, prisma } from "@academy/db";
import { hashPassword } from "@academy/auth";
import { USER_ROLES } from "@academy/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin";
import {
  processDueEmailQueue,
  queueCourseAccessGrantedEmail,
  queueStudentAccountCreatedEmail,
  queueStudentMarketingSequence,
} from "@/features/email/service";

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

const createWorkspaceMemberSchema = z.object({
  email: z.email().trim().toLowerCase(),
  name: z.string().trim().min(2),
  password: z.string().min(5),
  role: z.enum([USER_ROLES.AUTHOR, USER_ROLES.CURATOR, USER_ROLES.SALES_MANAGER]),
});

function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function refreshStudentAdminRoutes(courseId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/students");
  revalidatePath("/admin/team");
  revalidatePath("/learning");

  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}/content`);
    revalidatePath(`/admin/courses/${courseId}/access`);
    revalidatePath(`/learning/courses/${courseId}`);
  }
}

export async function createWorkspaceMember(formData: FormData) {
  await requireAdminUser();

  const parsed = createWorkspaceMemberSchema.parse({
    email: getTrimmedValue(formData, "email"),
    name: getTrimmedValue(formData, "name"),
    password: getTrimmedValue(formData, "password"),
    role: getTrimmedValue(formData, "role"),
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

  if (existingUser && existingUser.role !== parsed.role) {
    throw new Error("Пользователь с этим email уже существует с другой ролью.");
  }

  const passwordHash = await hashPassword(parsed.password);

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
    await prisma.user.create({
      data: {
        email: parsed.email,
        name: parsed.name,
        passwordHash,
        emailVerified: new Date(),
        role: parsed.role,
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/team");
  revalidatePath("/admin/courses");
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
    throw new Error("Пользователь с этим email уже существует, но имеет не студенческую роль.");
  }

  const passwordHash = await hashPassword(parsed.password);

  let userId = existingUser?.id;
  let isNewStudent = false;

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
    isNewStudent = true;
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

  const [student, course] = await Promise.all([
    userId
      ? prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            email: true,
            name: true,
          },
        })
      : Promise.resolve(null),
    parsed.courseId
      ? prisma.course.findUnique({
          where: {
            id: parsed.courseId,
          },
          select: {
            id: true,
            title: true,
          },
        })
      : Promise.resolve(null),
  ]);

  if (student) {
    await queueStudentAccountCreatedEmail({
      user: student,
      password: parsed.password,
      isExistingAccount: !isNewStudent,
    });

    if (isNewStudent) {
      await queueStudentMarketingSequence({
        user: student,
      });
    }

    if (course) {
      await queueCourseAccessGrantedEmail({
        user: student,
        course,
      });
    }

    await processDueEmailQueue({ force: true, limit: 10 });
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

  const [student, course] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: parsed.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    }),
    prisma.course.findUnique({
      where: {
        id: parsed.courseId,
      },
      select: {
        id: true,
        title: true,
      },
    }),
  ]);

  if (student && course) {
    await queueCourseAccessGrantedEmail({
      user: student,
      course,
    });

    await processDueEmailQueue({ force: true, limit: 10 });
  }

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
