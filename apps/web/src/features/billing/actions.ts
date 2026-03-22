"use server";

import {
  EnrollmentStatus,
  OrderStatus,
  PaymentProviderType,
  PaymentStatus,
  prisma,
} from "@academy/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  processDueEmailQueue,
  queuePaymentSuccessEmail,
} from "@/features/email/service";
import { requireAdminUser } from "@/lib/admin";
import { getPaymentProvider } from "@/lib/billing/provider";
import { formatMinorUnits, parseAmountToMinorUnits } from "@/lib/money";
import { requireAuthenticatedUser } from "@/lib/user";

const courseOfferSchema = z.object({
  courseId: z.string().trim().min(1),
  productName: z.string().trim().min(2),
  description: z.string().trim().optional(),
  amount: z.string().trim().min(1),
  currency: z.string().trim().length(3).default("RUB"),
  isActive: z.boolean().default(true),
});

const courseIdSchema = z.object({
  courseId: z.string().trim().min(1),
});

const orderIdSchema = z.object({
  orderId: z.string().trim().min(1),
});

function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getOptionalValue(formData: FormData, key: string) {
  const value = getTrimmedValue(formData, key);
  return value || undefined;
}

function refreshBillingPaths(courseId?: string, orderId?: string) {
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/learning");

  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}/content`);
    revalidatePath(`/admin/courses/${courseId}/access`);
    revalidatePath(`/learning/courses/${courseId}`);
  }

  if (orderId) {
    revalidatePath(`/checkout/${orderId}`);
  }
}

async function getCourseSellableOffer(courseId: string) {
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

  const product = course?.products[0];
  const price = product?.prices[0];

  if (!course || !product || !price) {
    throw new Error("Для курса пока не настроено demo-предложение.");
  }

  return { course, product, price };
}

export async function upsertCourseOffer(formData: FormData) {
  await requireAdminUser();

  const parsed = courseOfferSchema.parse({
    courseId: getTrimmedValue(formData, "courseId"),
    productName: getTrimmedValue(formData, "productName"),
    description: getOptionalValue(formData, "description"),
    amount: getTrimmedValue(formData, "amount"),
    currency: getTrimmedValue(formData, "currency").toUpperCase() || "RUB",
    isActive: formData.get("isActive") === "on",
  });

  const amountInMinorUnits = parseAmountToMinorUnits(parsed.amount);

  const product = await prisma.product.upsert({
    where: {
      courseId: parsed.courseId,
    },
    update: {
      name: parsed.productName,
      description: parsed.description,
      isActive: parsed.isActive,
    },
    create: {
      courseId: parsed.courseId,
      name: parsed.productName,
      description: parsed.description,
      isActive: parsed.isActive,
    },
    select: {
      id: true,
    },
  });

  const defaultPrice = await prisma.price.findFirst({
    where: {
      productId: product.id,
      isDefault: true,
    },
    select: {
      id: true,
    },
  });

  if (defaultPrice) {
    await prisma.price.update({
      where: {
        id: defaultPrice.id,
      },
      data: {
        amount: amountInMinorUnits,
        currency: parsed.currency,
        isDefault: true,
      },
    });
  } else {
    await prisma.price.create({
      data: {
        productId: product.id,
        amount: amountInMinorUnits,
        currency: parsed.currency,
        isDefault: true,
      },
    });
  }

  refreshBillingPaths(parsed.courseId);
}

export async function startDemoCheckout(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const parsed = courseIdSchema.parse({
    courseId: getTrimmedValue(formData, "courseId"),
  });

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: parsed.courseId,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (
    existingEnrollment &&
    existingEnrollment.status !== EnrollmentStatus.CANCELED &&
    existingEnrollment.status !== EnrollmentStatus.EXPIRED
  ) {
    redirect(`/learning/courses/${parsed.courseId}`);
  }

  const { product, price } = await getCourseSellableOffer(parsed.courseId);

  const existingPendingOrder = await prisma.order.findFirst({
    where: {
      userId: user.id,
      status: {
        in: [OrderStatus.DRAFT, OrderStatus.PENDING],
      },
      paymentProvider: PaymentProviderType.DEMO,
      items: {
        some: {
          productId: product.id,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
    },
  });

  if (existingPendingOrder) {
    redirect(`/checkout/${existingPendingOrder.id}`);
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: OrderStatus.PENDING,
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
    },
    select: {
      id: true,
    },
  });

  const paymentProvider = getPaymentProvider();
  const paymentLink = await paymentProvider.createPaymentLink({
    orderId: order.id,
    amount: price.amount,
    currency: price.currency,
    description: product.name,
    customerEmail: user.email ?? undefined,
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: PaymentProviderType.DEMO,
      status: PaymentStatus.CREATED,
      providerPaymentId: paymentLink.providerPaymentId,
      paymentUrl: paymentLink.paymentUrl,
      rawPayload: {
        mode: "demo",
      },
    },
  });

  refreshBillingPaths(parsed.courseId, order.id);
  redirect(`/checkout/${order.id}`);
}

export async function completeDemoPayment(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const parsed = orderIdSchema.parse({
    orderId: getTrimmedValue(formData, "orderId"),
  });

  const order = await prisma.order.findFirst({
    where: {
      id: parsed.orderId,
      userId: user.id,
      paymentProvider: PaymentProviderType.DEMO,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              courseId: true,
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
      payments: true,
    },
  });

  if (!order) {
    throw new Error("Demo checkout не найден.");
  }

  const courseId = order.items[0]?.product.courseId;
  const course = order.items[0]?.product.course ?? null;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: OrderStatus.PAID,
      },
    });

    if (order.payments[0]) {
      await tx.payment.update({
        where: {
          id: order.payments[0].id,
        },
        data: {
          status: PaymentStatus.SUCCEEDED,
          rawPayload: {
            mode: "demo",
            result: "success",
            paidAt: new Date().toISOString(),
          },
        },
      });
    }

    if (courseId) {
      await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        create: {
          userId: user.id,
          courseId,
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
  });

  if (course) {
    await queuePaymentSuccessEmail({
      user: {
        id: user.id,
        email: user.email ?? "",
        name: user.name ?? null,
      },
      course,
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        currency: order.currency,
      },
      amountLabel: formatMinorUnits(order.totalAmount, order.currency),
    });

    await processDueEmailQueue({ force: true, limit: 10 });
  }

  refreshBillingPaths(courseId ?? undefined, order.id);
  redirect(`/checkout/${order.id}?paid=1`);
}

export async function failDemoPayment(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const parsed = orderIdSchema.parse({
    orderId: getTrimmedValue(formData, "orderId"),
  });

  const order = await prisma.order.findFirst({
    where: {
      id: parsed.orderId,
      userId: user.id,
      paymentProvider: PaymentProviderType.DEMO,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              courseId: true,
            },
          },
        },
      },
      payments: true,
    },
  });

  if (!order) {
    throw new Error("Demo checkout не найден.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: OrderStatus.CANCELED,
      },
    });

    if (order.payments[0]) {
      await tx.payment.update({
        where: {
          id: order.payments[0].id,
        },
        data: {
          status: PaymentStatus.FAILED,
          rawPayload: {
            mode: "demo",
            result: "failed",
            failedAt: new Date().toISOString(),
          },
        },
      });
    }
  });

  refreshBillingPaths(order.items[0]?.product.courseId ?? undefined, order.id);
  redirect(`/checkout/${order.id}?failed=1`);
}
