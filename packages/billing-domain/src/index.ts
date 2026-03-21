export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customerEmail?: string;
}

export interface CreatePaymentResult {
  providerPaymentId: string;
  paymentUrl: string;
}

export interface PaymentWebhookInput {
  headers: Record<string, string>;
  body: unknown;
}

export interface PaymentProvider {
  createPaymentLink(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  handleWebhook(input: PaymentWebhookInput): Promise<void>;
}
