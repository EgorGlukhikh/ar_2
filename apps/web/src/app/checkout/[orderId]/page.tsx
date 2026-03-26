import { auth } from "@academy/auth";
import { notFound } from "next/navigation";

import { getPublicCheckoutPayload } from "@backend/public-checkout/get-public-checkout-payload";
import { CheckoutPageContent } from "@frontend/checkout/components/checkout-page-content";

import { PublicFooter } from "@/components/marketing/public-footer";
import {
  PublicButton,
  publicBadgeClassName,
} from "@/components/marketing/public-primitives";
import {
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";
import { formatPublicCopy } from "@/lib/public-copy";

type CheckoutPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const { orderId } = await params;
  const payload = await getPublicCheckoutPayload(orderId, session.user.id);

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <header className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[rgba(255,255,255,0.9)] px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur md:px-6">
              <div className="flex min-h-20 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className={publicBadgeClassName}>
                      {formatPublicCopy(`Заказ: ${payload.orderStatusLabel}`)}
                    </span>
                    {payload.paymentStatusLabel ? (
                      <span className={publicBadgeClassName}>
                        {formatPublicCopy(`Платёж: ${payload.paymentStatusLabel}`)}
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatPublicCopy("Подтверждение доступа")}
                    </p>
                    <p className="max-w-[560px] text-sm leading-6 text-[var(--muted)]">
                      {formatPublicCopy(
                        "Здесь видно, какой курс ты открываешь, сколько он стоит и что произойдет после подтверждения оплаты.",
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

            <CheckoutPageContent payload={payload} />
            <PublicFooter />
          </div>
        </section>
      </div>
    </main>
  );
}
