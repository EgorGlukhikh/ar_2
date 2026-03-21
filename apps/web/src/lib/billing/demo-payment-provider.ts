import { randomUUID } from "node:crypto";

import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  PaymentWebhookInput,
} from "@academy/billing-domain";

export class DemoPaymentProvider implements PaymentProvider {
  async createPaymentLink(
    input: CreatePaymentInput,
  ): Promise<CreatePaymentResult> {
    return {
      providerPaymentId: `demo_${randomUUID()}`,
      paymentUrl: `/checkout/${input.orderId}`,
    };
  }

  async handleWebhook(_input: PaymentWebhookInput): Promise<void> {
    void _input;
    return;
  }
}
