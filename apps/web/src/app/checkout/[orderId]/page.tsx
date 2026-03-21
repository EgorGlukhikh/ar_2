import {
  OrderStatus,
  PaymentStatus,
  PaymentProviderType,
  prisma,
} from "@academy/db";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  completeDemoPayment,
  failDemoPayment,
  startDemoCheckout,
} from "@/features/billing/actions";
import { formatMinorUnits } from "@/lib/money";
import { requireAuthenticatedUser } from "@/lib/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CheckoutPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

const orderStatusVariantMap: Record<
  OrderStatus,
  "default" | "neutral" | "success" | "warning"
> = {
  DRAFT: "neutral",
  PENDING: "warning",
  PAID: "success",
  CANCELED: "warning",
  REFUNDED: "warning",
};

const paymentStatusVariantMap: Record<
  PaymentStatus,
  "default" | "neutral" | "success" | "warning"
> = {
  CREATED: "neutral",
  PENDING: "warning",
  SUCCEEDED: "success",
  FAILED: "warning",
  CANCELED: "warning",
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const user = await requireAuthenticatedUser();
  const { orderId } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id,
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

  if (!order) {
    notFound();
  }

  const orderItem = order.items[0];
  const payment = order.payments[0];
  const course = orderItem?.product.course;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f9ff_0%,_#f1f5ff_100%)] px-6 py-10">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Demo Checkout
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                Оплата курса в демо-режиме
              </h1>
              <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
                Этот экран показывает, как будет выглядеть checkout: создается
                заказ, платеж и после подтверждения выдается доступ к курсу.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={orderStatusVariantMap[order.status]}>
                Order {order.status}
              </Badge>
              {payment ? (
                <Badge variant={paymentStatusVariantMap[payment.status]}>
                  Payment {payment.status}
                </Badge>
              ) : null}
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Order Summary
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              {course?.title ?? orderItem?.product.name ?? "Курс"}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Заказ #{order.id}
            </p>

            <div className="mt-6 space-y-4 rounded-[24px] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                <span>Продукт</span>
                <span className="font-medium text-[var(--foreground)]">
                  {orderItem?.product.name ?? "Не найден"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                <span>Сумма</span>
                <span className="font-medium text-[var(--foreground)]">
                  {formatMinorUnits(order.totalAmount, order.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                <span>Провайдер</span>
                <span className="font-medium text-[var(--foreground)]">
                  {order.paymentProvider}
                </span>
              </div>
              {payment?.providerPaymentId ? (
                <div className="flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
                  <span>Payment ID</span>
                  <span className="break-all font-medium text-[var(--foreground)]">
                    {payment.providerPaymentId}
                  </span>
                </div>
              ) : null}
            </div>
          </article>

          <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Demo Controls
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Инструменты демонстрации оплаты
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Здесь можно сымитировать успешную оплату курса или ошибку платежа.
            </p>

            <div className="mt-6 space-y-4">
              {order.status === OrderStatus.PAID ? (
                <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-lg font-semibold text-emerald-900">
                    Доступ выдан
                  </p>
                  <p className="mt-3 text-sm leading-7 text-emerald-800">
                    Demo-оплата прошла успешно. Пользователь зачислен на курс и
                    может открыть обучение.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {course?.id ? (
                      <Button asChild>
                        <Link href={`/learning/courses/${course.id}`}>Открыть курс</Link>
                      </Button>
                    ) : null}
                    <Button asChild variant="outline">
                      <Link href="/catalog">Вернуться в каталог</Link>
                    </Button>
                  </div>
                </div>
              ) : order.status === OrderStatus.CANCELED ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
                  <p className="text-lg font-semibold text-amber-900">
                    Demo-оплата завершилась отказом
                  </p>
                  <p className="mt-3 text-sm leading-7 text-amber-800">
                    Заказ закрыт как неуспешный. Можно вернуться в каталог и
                    создать новый demo checkout.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {course?.id ? (
                      <form action={startDemoCheckout}>
                        <input type="hidden" name="courseId" value={course.id} />
                        <Button type="submit">Создать новый checkout</Button>
                      </form>
                    ) : null}
                    <Button asChild variant="outline">
                      <Link href="/catalog">Вернуться в каталог</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <form action={completeDemoPayment}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <Button type="submit" className="w-full">
                      Оплатить курс
                    </Button>
                  </form>

                  <form action={failDemoPayment}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <Button type="submit" variant="outline" className="w-full">
                      Сымитировать отказ
                    </Button>
                  </form>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-[24px] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--muted)]">
              После подключения реальных провайдеров на месте этих demo-кнопок будут
              ссылки и callback-сценарии Robokassa, T-Bank или Bank 131.
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
