import { CheckCircle2, CreditCard, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PublicButton,
  SectionLead,
  publicCardClassName,
  publicIconBoxClassName,
} from "@/components/marketing/public-primitives";
import {
  completeDemoPayment,
  failDemoPayment,
  startDemoCheckout,
} from "@/features/billing/actions";
import { formatPublicCopy } from "@/lib/public-copy";
import type { PublicCheckoutPayload } from "@shared/public-checkout/types";

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

/**
 * Purpose: render checkout UI from a normalized payload.
 * Props:
 * - payload: checkout DTO from backend layer
 */
export function CheckoutPageContent({
  payload,
}: {
  payload: PublicCheckoutPayload;
}) {
  return (
    <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="space-y-8">
        <SectionLead
          eyebrow="Что оформляем"
          title={payload.courseTitle}
          text="Курс, стоимость и способ оплаты собраны в одном месте, чтобы можно было быстро проверить заказ перед подтверждением."
        />

        <article className={publicCardClassName}>
          <div className="space-y-4 text-base leading-7 text-[var(--muted)]">
            <Row label="Курс" value={payload.courseTitle} />
            <Row label="Сумма" value={payload.totalAmountLabel} strong />
            <Row label="Способ оплаты" value={payload.paymentProviderLabel} />
            {payload.providerPaymentId ? (
              <Row label="Номер платежа" value={payload.providerPaymentId} breakAll />
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
        {payload.isPaid ? (
          <article className={publicCardClassName}>
            <div className={publicIconBoxClassName}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[var(--foreground)]">
              {formatPublicCopy("Доступ открыт")}
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {formatPublicCopy(
                "Оплата подтверждена, а курс уже доступен в учебном кабинете.",
              )}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {payload.courseId ? (
                <PublicButton href={`/learning/courses/${payload.courseId}`}>
                  {formatPublicCopy("Перейти к курсу")}
                </PublicButton>
              ) : null}
              <PublicButton href="/catalog" tone="secondary">
                {formatPublicCopy("Выбрать ещё курс")}
              </PublicButton>
            </div>
          </article>
        ) : payload.isCanceled ? (
          <article className={publicCardClassName}>
            <div className={publicIconBoxClassName}>
              <XCircle className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[var(--foreground)]">
              {formatPublicCopy("Заказ закрыт")}
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {formatPublicCopy(
                "Оплата не завершена. Можно вернуться в каталог и оформить доступ заново, когда будешь готов продолжить.",
              )}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {payload.courseId ? (
                <form action={startDemoCheckout}>
                  <input type="hidden" name="courseId" value={payload.courseId} />
                  <Button type="submit">
                    {formatPublicCopy("Оформить заново")}
                  </Button>
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
                <input type="hidden" name="orderId" value={payload.orderId} />
                <Button type="submit" className="w-full justify-center">
                  {formatPublicCopy("Подтвердить оплату")}
                </Button>
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
                <input type="hidden" name="orderId" value={payload.orderId} />
                <Button type="submit" variant="outline" className="w-full justify-center">
                  {formatPublicCopy("Отменить заказ")}
                </Button>
              </form>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
