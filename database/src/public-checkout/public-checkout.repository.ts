import { PaymentProviderType, prisma } from "@academy/db";

export async function findDemoCheckoutOrder(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
      paymentProvider: PaymentProviderType.DEMO,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              course: true,
            },
          },
        },
      },
      payments: true,
    },
  });
}
