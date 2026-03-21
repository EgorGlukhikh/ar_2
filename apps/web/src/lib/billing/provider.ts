import type { PaymentProvider } from "@academy/billing-domain";

import { DemoPaymentProvider } from "@/lib/billing/demo-payment-provider";

export function getPaymentProvider(): PaymentProvider {
  return new DemoPaymentProvider();
}
