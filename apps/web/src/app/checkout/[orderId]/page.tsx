import { CheckCircle2, CreditCard, ShieldCheck, XCircle } from "lucide-react";
import { OrderStatus, PaymentProviderType, prisma } from "@academy/db";
import { notFound } from "next/navigation";

import {
  PublicButton,
  SectionLead,
  publicBadgeClassName,
  publicButtonClassName,
  publicCardClassName,
  publicIconBoxClassName,
} from "@/components/marketing/public-primitives";
import {
  completeDemoPayment,
  failDemoPayment,
  startDemoCheckout,
} from "@/features/billing/actions";
import {
  orderStatusLabelMap,
  paymentProviderLabelMap,
  paymentStatusLabelMap,
} from "@/lib/labels";
import {
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";
import { formatMinorUnits } from "@/lib/money";
import { formatPublicCopy } from "@/lib/public-copy";
import { requireAuthenticatedUser } from "@/lib/user";

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
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <header className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.9)] px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur md:px-6">
              <div className="flex min-h-20 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className={publicBadgeClassName}>
                      {formatPublicCopy(`Заказ: ${orderStatusLabelMap[order.status]}`)}
                    </span>
                    {payment ? (
                      <span className={publicBadgeClassName}>
                        {formatPublicCopy(`Платёж: ${paymentStatusLabelMap[payment.status]}`)}
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatPublicCopy("Подтверждение доступа")}
                    </p>
                    <p className="max-w-[560px] text-sm leading-6 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Здесь видно, какой курс ты открываешь, сколько он стоит и что произойдёт после подтверждения оплаты.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <PublicButton href="/catalog" tone="secondary">
                    {formatPublicCopy("К курсам")}
                  </PublicButton>
                  <PublicButton href="/learning" tone="secondary">
                    {formatPublicCopy("Мой кабинет")}
                  </PublicButton>
                </div>
              </div>
            </header>

            <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
              <div className="space-y-8">
                <SectionLead
                  eyebrow="Что оформляем"
                  title={course?.title ?? orderItem?.product.name ?? "Курс"}
                  text="Курс, стоимость и способ оплаты собраны в одном месте, чтобы можно было быстро проверить заказ перед подтверждением."
                />

                <article className={publicCardClassName}>
                  <div className="space-y-4 text-base leading-7 text-[var(--muted)]">
                    <Row
                      label="Курс"
                      value={orderItem?.product.name ?? formatPublicCopy("Не найден")}
                    />
                    <Row
                      label="Сумма"
                      value={formatMinorUnits(order.totalAmount, order.currency)}
                      strong
                    />
                    <Row
                      label="Способ оплаты"
                      value={paymentProviderLabelMap[order.paymentProvider]}
                    />
                    {payment?.providerPaymentId ? (
                      <Row
                        label="Номер платежа"
                        value={payment.providerPaymentId}
                        breakAll
                      />
                    ) : null}
                  </div>
                </article>

                <div className="grid gap-4 md:grid-cols-2">
                  <article className={publicCardClassName}>
                    <div className={publicIconBoxClassName}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold leading-7 text-[var(--foreground)]">
                      {formatPublicCopy("После оплаты")}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Курс откроется автоматически и сразу появится в учебном кабинете.",
                      )}
                    </p>
                  </article>

                  <article className={publicCardClassName}>
                    <div className={publicIconBoxClassName}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold leading-7 text-[var(--foreground)]">
                      {formatPublicCopy("Что дальше")}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Если передумаешь, заказ можно закрыть и позже вернуться к покупке из каталога.",
                      )}
                    </p>
                  </article>
                </div>
              </div>

              <div className="space-y-6">
                {isPaid ? (
                  <article className={publicCardClassName}>
                    <div className={publicIconBoxClassName}>
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-[32px] font-semibold leading-10 tracking-[-0.02em] text-[var(--foreground)]">
                      {formatPublicCopy("Доступ открыт")}
                    </h2>
                    <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Оплата подтверждена, а курс уже доступен в учебном кабинете.",
                      )}
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {course?.id ? (
                        <PublicButton href={`/learning/courses/${course.id}`}>
                          {formatPublicCopy("Перейти к курсу")}
                        </PublicButton>
                      ) : null}
                      <PublicButton href="/catalog" tone="secondary">
                        {formatPublicCopy("Выбрать ещё курс")}
                      </PublicButton>
                    </div>
                  </article>
                ) : isCanceled ? (
                  <article className={publicCardClassName}>
                    <div className={publicIconBoxClassName}>
                      <XCircle className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-[32px] font-semibold leading-10 tracking-[-0.02em] text-[var(--foreground)]">
                      {formatPublicCopy("Заказ закрыт")}
                    </h2>
                    <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Оплата не завершена. Можно вернуться в каталог и оформить доступ заново, когда будешь готов продолжить.",
                      )}
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {course?.id ? (
                        <form action={startDemoCheckout}>
                          <input type="hidden" name="courseId" value={course.id} />
                          <button type="submit" className={publicButtonClassName("primary")}>
                            {formatPublicCopy("Оформить заново")}
                          </button>
                        </form>
                      ) : null}
                      <PublicButton href="/catalog" tone="secondary">
                        {formatPublicCopy("Вернуться к курсам")}
                      </PublicButton>
                    </div>
                  </article>
                ) : (
                  <div className="grid gap-4">
                    <article className={publicCardClassName}>
                      <div className={publicIconBoxClassName}>
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold leading-8 text-[var(--foreground)]">
                        {formatPublicCopy("Подтвердить оплату")}
                      </h2>
                      <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                        {formatPublicCopy(
                          "После подтверждения курс сразу появится в учебном кабинете и будет доступен без дополнительных шагов.",
                        )}
                      </p>
                      <form action={completeDemoPayment} className="mt-6">
                        <input type="hidden" name="orderId" value={order.id} />
                        <button type="submit" className={`${publicButtonClassName("primary")} w-full justify-center`}>
                          {formatPublicCopy("Подтвердить оплату")}
                        </button>
                      </form>
                    </article>

                    <article className={publicCardClassName}>
                      <div className={publicIconBoxClassName}>
                        <XCircle className="h-5 w-5" />
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold leading-8 text-[var(--foreground)]">
                        {formatPublicCopy("Отменить заказ")}
                      </h2>
                      <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                        {formatPublicCopy(
                          "Заказ закроется без доступа к курсу, а к покупке можно будет вернуться позже.",
                        )}
                      </p>
                      <form action={failDemoPayment} className="mt-6">
                        <input type="hidden" name="orderId" value={order.id} />
                        <button type="submit" className={`${publicButtonClassName("secondary")} w-full justify-center`}>
                          {formatPublicCopy("Отменить заказ")}
                        </button>
                      </form>
                    </article>
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  strong = false,
  breakAll = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  breakAll?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span>{formatPublicCopy(label)}</span>
      <span
        className={[
          "text-right text-[var(--foreground)]",
          strong ? "font-semibold" : "font-medium",
          breakAll ? "break-all" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
