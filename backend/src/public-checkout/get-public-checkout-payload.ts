import { notFound } from "next/navigation";

import { OrderStatus, PaymentStatus } from "@academy/db";
import type { PublicCheckoutPayload } from "@shared/public-checkout/types";

import { findDemoCheckoutOrder } from "@database/public-checkout/public-checkout.repository";

const orderStatusLabelMap: Record<OrderStatus, string> = {
  DRAFT: "Черновик",
  PENDING: "Ожидает оплаты",
  PAID: "Оплачен",
  CANCELED: "Отменен",
  REFUNDED: "Возврат",
};

const paymentStatusLabelMap: Record<PaymentStatus, string> = {
  CREATED: "Создан",
  PENDING: "Ожидает оплаты",
  SUCCEEDED: "Успешен",
  FAILED: "Ошибка",
  CANCELED: "Отменен",
};

/**
 * Builds a UI-safe payload for the checkout screen.
 * Purpose: keep order lookup and derived state out of the page component.
 */
export async function getPublicCheckoutPayload(
  orderId: string,
  userId: string,
): Promise<PublicCheckoutPayload> {
  const order = await findDemoCheckoutOrder(orderId, userId);

  if (!order) {
    notFound();
  }

  const orderItem = order.items[0];
  const payment = order.payments[0];
  const course = orderItem?.product.course;

  return {
    orderId: order.id,
    orderStatusLabel: orderStatusLabelMap[order.status],
    paymentStatusLabel: payment ? paymentStatusLabelMap[payment.status] : null,
    courseId: course?.id ?? null,
    courseTitle: course?.title ?? orderItem?.product.name ?? "Курс",
    totalAmountLabel: new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: order.currency,
      maximumFractionDigits: 2,
    }).format(order.totalAmount / 100),
    paymentProviderLabel: "Онлайн-оплата",
    providerPaymentId: payment?.providerPaymentId ?? null,
    isPaid: order.status === OrderStatus.PAID,
    isCanceled: order.status === OrderStatus.CANCELED,
  };
}
