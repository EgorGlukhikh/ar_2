import { CheckCircle2, CreditCard, ShieldCheck, XCircle } from "lucide-react";
import { OrderStatus, PaymentProviderType, prisma } from "@academy/db";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  completeDemoPayment,
  failDemoPayment,
  startDemoCheckout,
} from "@/features/billing/actions";
import {
  orderStatusLabelMap,
  orderStatusVariantMap,
  paymentProviderLabelMap,
  paymentStatusLabelMap,
  paymentStatusVariantMap,
} from "@/lib/labels";
import { formatMinorUnits } from "@/lib/money";
import { requireAuthenticatedUser } from "@/lib/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CourseThumb,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/workspace/workspace-primitives";

type CheckoutPageProps = {
  params: Promise<{
    orderId: string;
  }>;
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
  const isPaid = order.status === OrderStatus.PAID;
  const isCanceled = order.status === OrderStatus.CANCELED;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f9ff_0%,_#f1f5ff_100%)] px-4 py-4 md:px-6 md:py-6">
      <section className="mx-auto max-w-[1400px] space-y-6">
        <WorkspacePageHeader
          eyebrow="Оформление доступа"
          title="Подтверждение покупки курса"
          description="Проверь состав заказа, сумму и статус оплаты. После подтверждения доступ к курсу откроется автоматически."
          meta={
            <div className="flex flex-wrap gap-2">
              <Badge variant={orderStatusVariantMap[order.status]}>
                Заказ: {orderStatusLabelMap[order.status]}
              </Badge>
              {payment ? (
                <Badge variant={paymentStatusVariantMap[payment.status]}>
                  Платеж: {paymentStatusLabelMap[payment.status]}
                </Badge>
              ) : null}
            </div>
          }
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/catalog">Каталог</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/learning">Учебный кабинет</Link>
              </Button>
            </>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <WorkspacePanel
            eyebrow="Состав заказа"
            title={course?.title ?? orderItem?.product.name ?? "Курс"}
            description="Ниже показаны данные покупки: продукт, сумма и платежный контур."
          >
            <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
              <CourseThumb
                title={course?.title ?? orderItem?.product.name ?? "Курс"}
                subtitle={`Заказ #${order.id}`}
              />

              <div className="space-y-4">
                <div className="rounded-[24px] bg-[var(--surface)] p-5">
                  <div className="space-y-4 text-sm text-[var(--muted)]">
                    <div className="flex items-center justify-between gap-4">
                      <span>Продукт</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {orderItem?.product.name ?? "Не найден"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Сумма</span>
                      <span className="font-semibold text-[var(--foreground)]">
                        {formatMinorUnits(order.totalAmount, order.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Платежный контур</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {paymentProviderLabelMap[order.paymentProvider]}
                      </span>
                    </div>
                    {payment?.providerPaymentId ? (
                      <div className="flex items-start justify-between gap-4">
                        <span>Идентификатор</span>
                        <span className="break-all text-right font-medium text-[var(--foreground)]">
                          {payment.providerPaymentId}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                    <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                    <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                      После оплаты
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      Доступ к курсу выдается автоматически и курс появляется в учебном кабинете.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                    <CreditCard className="h-4 w-4 text-[var(--primary)]" />
                    <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                      Оплата онлайн
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      Страница оформляет заказ и показывает его актуальный статус до открытия доступа.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Статус оплаты"
            title="Что происходит с заказом"
            description="Здесь можно завершить оплату или закрыть заказ, если пользователь решил не продолжать покупку."
          >
            <div className="space-y-5">
              {isPaid ? (
                <div className="rounded-[26px] border border-emerald-200 bg-emerald-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-white p-3 text-emerald-700 shadow-sm">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-emerald-950">
                        Доступ выдан успешно
                      </p>
                      <p className="mt-3 text-sm leading-7 text-emerald-900">
                        Платеж подтвержден, заказ переведен в оплаченный, студент уже зачислен на курс.
                      </p>
                    </div>
                  </div>

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
              ) : isCanceled ? (
                <div className="rounded-[26px] border border-amber-200 bg-amber-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-white p-3 text-amber-700 shadow-sm">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-amber-950">
                        Заказ закрыт
                      </p>
                      <p className="mt-3 text-sm leading-7 text-amber-900">
                        Оплата не была завершена. Можно вернуться в каталог и оформить новый заказ, если пользователь решит продолжить покупку.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {course?.id ? (
                      <form action={startDemoCheckout}>
                        <input type="hidden" name="courseId" value={course.id} />
                        <Button type="submit">Оформить новый заказ</Button>
                      </form>
                    ) : null}
                    <Button asChild variant="outline">
                      <Link href="/catalog">Вернуться в каталог</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <form action={completeDemoPayment} className="h-full">
                    <input type="hidden" name="orderId" value={order.id} />
                    <button
                      type="submit"
                      className="flex h-full w-full flex-col justify-between rounded-[28px] border border-[#dce4ff] bg-[linear-gradient(180deg,_#eff4ff_0%,_#ffffff_100%)] p-5 text-left shadow-sm transition hover:-translate-y-[1px] hover:border-[var(--primary)]"
                    >
                      <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="mt-8">
                        <p className="text-lg font-semibold text-[var(--foreground)]">
                          Оплатить курс
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                          После подтверждения доступ откроется автоматически, а курс появится в учебном кабинете.
                        </p>
                      </div>
                    </button>
                  </form>

                  <form action={failDemoPayment} className="h-full">
                    <button
                      type="submit"
                      className="flex h-full w-full flex-col justify-between rounded-[28px] border border-[#ffe1c1] bg-[linear-gradient(180deg,_#fff6ea_0%,_#ffffff_100%)] p-5 text-left shadow-sm transition hover:-translate-y-[1px] hover:border-[#f3a55c]"
                    >
                      <input type="hidden" name="orderId" value={order.id} />
                      <div className="rounded-2xl bg-white p-3 text-[#c97726] shadow-sm">
                        <XCircle className="h-5 w-5" />
                      </div>
                      <div className="mt-8">
                        <p className="text-lg font-semibold text-[var(--foreground)]">
                          Отменить заказ
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                          Заказ будет закрыт без выдачи доступа, и пользователь сможет вернуться к покупке позже.
                        </p>
                      </div>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </WorkspacePanel>
        </div>
      </section>
    </main>
  );
}
