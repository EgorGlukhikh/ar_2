"use server";

import {
  EnrollmentStatus,
  OrderStatus,
  PaymentProviderType,
  PaymentStatus,
  prisma,
} from "@academy/db";
import { hashPassword } from "@academy/auth";
import { USER_ROLES } from "@academy/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin";
import {
  processDueEmailQueue,
  queueCourseAccessGrantedEmail,
  queuePaymentSuccessEmail,
  queueStudentAccountCreatedEmail,
  queueStudentMarketingSequence,
} from "@/features/email/service";
import { formatMinorUnits } from "@/lib/money";

const createStudentSchema = z.object({
  email: z.email().trim().toLowerCase(),
  name: z.string().trim().min(2),
  password: z.string().min(5),
  courseId: z.string().trim().min(1).optional(),
  grantMode: z.enum(["free", "demo_charge"]).default("free"),
  confirmPaidAccess: z.boolean().default(false),
});

const enrollmentIdentitySchema = z.object({
  userId: z.string().trim().min(1),
  courseId: z.string().trim().min(1),
});

const enrollmentSchema = enrollmentIdentitySchema.extend({
  grantMode: z.enum(["free", "demo_charge"]).default("free"),
  confirmPaidAccess: z.boolean().default(false),
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

async function getCourseAccessContext(courseId: string) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
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
    },
  });

  if (!course) {
    throw new Error("Курс не найден.");
  }

  const product = course.products[0] ?? null;
  const price = product?.prices[0] ?? null;

  return {
    course,
    product,
    price,
    isPaidCourse: Boolean(price && price.amount > 0),
  };
}

async function grantCourseAccess(args: {
  userId: string;
  courseId: string;
  grantMode: "free" | "demo_charge";
  confirmPaidAccess: boolean;
}) {
  const { course, product, price, isPaidCourse } = await getCourseAccessContext(
    args.courseId,
  );

  if (isPaidCourse && !args.confirmPaidAccess) {
    throw new Error(
      "Подтверди сценарий выдачи доступа для платного курса перед сохранением.",
    );
  }

  if (args.grantMode === "demo_charge") {
    if (!isPaidCourse || !product || !price) {
      throw new Error("Для демо-списания у курса должна быть настроена цена.");
    }

    const order = await prisma.order.create({
      data: {
        userId: args.userId,
        status: OrderStatus.PAID,
        currency: price.currency,
        totalAmount: price.amount,
        paymentProvider: PaymentProviderType.DEMO,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            unitAmount: price.amount,
          },
        },
        payments: {
          create: {
            provider: PaymentProviderType.DEMO,
            status: PaymentStatus.SUCCEEDED,
            rawPayload: {
              mode: "admin-demo-charge",
              paidAt: new Date().toISOString(),
            },
          },
        },
      },
      select: {
        id: true,
        totalAmount: true,
        currency: true,
      },
    });

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: args.userId,
          courseId: args.courseId,
        },
      },
      create: {
        userId: args.userId,
        courseId: args.courseId,
        status: EnrollmentStatus.ACTIVE,
        startedAt: new Date(),
      },
      update: {
        status: EnrollmentStatus.ACTIVE,
        startedAt: new Date(),
        completedAt: null,
      },
    });

    return {
      course: {
        id: course.id,
        title: course.title,
      },
      order,
      accessSource: "demo_charge" as const,
      amountLabel: formatMinorUnits(order.totalAmount, order.currency),
    };
  }

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: args.userId,
        courseId: args.courseId,
      },
    },
    create: {
      userId: args.userId,
      courseId: args.courseId,
      status: EnrollmentStatus.ACTIVE,
      startedAt: new Date(),
    },
    update: {
      status: EnrollmentStatus.ACTIVE,
      startedAt: new Date(),
      completedAt: null,
    },
  });

  return {
    course: {
      id: course.id,
      title: course.title,
    },
    order: null,
    accessSource: "free" as const,
    amountLabel: null,
  };
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
    grantMode:
      (getTrimmedValue(formData, "grantMode") as "free" | "demo_charge") || "free",
    confirmPaidAccess: formData.get("confirmPaidAccess") === "on",
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

    if (parsed.courseId && userId) {
      const grantResult = await grantCourseAccess({
        userId,
        courseId: parsed.courseId,
        grantMode: parsed.grantMode,
        confirmPaidAccess: parsed.confirmPaidAccess,
      });

      if (grantResult.accessSource === "demo_charge") {
        await queuePaymentSuccessEmail({
          user: student,
          course: grantResult.course,
          order: grantResult.order!,
          amountLabel: grantResult.amountLabel!,
        });
      } else {
        await queueCourseAccessGrantedEmail({
          user: student,
          course: grantResult.course,
        });
      }
    } else if (course) {
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
    grantMode:
      (getTrimmedValue(formData, "grantMode") as "free" | "demo_charge") || "free",
    confirmPaidAccess: formData.get("confirmPaidAccess") === "on",
  });

  const grantResult = await grantCourseAccess({
    userId: parsed.userId,
    courseId: parsed.courseId,
    grantMode: parsed.grantMode,
    confirmPaidAccess: parsed.confirmPaidAccess,
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
    if (grantResult.accessSource === "demo_charge") {
      await queuePaymentSuccessEmail({
        user: student,
        course,
        order: grantResult.order!,
        amountLabel: grantResult.amountLabel!,
      });
    } else {
      await queueCourseAccessGrantedEmail({
        user: student,
        course,
      });
    }

    await processDueEmailQueue({ force: true, limit: 10 });
  }

  refreshStudentAdminRoutes(parsed.courseId);
}

export async function removeEnrollment(formData: FormData) {
  await requireAdminUser();

  const parsed = enrollmentIdentitySchema.parse({
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

  const parsed = enrollmentIdentitySchema.parse({
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
