export type PublicCheckoutPayload = {
  orderId: string;
  orderStatusLabel: string;
  paymentStatusLabel: string | null;
  courseId: string | null;
  courseTitle: string;
  totalAmountLabel: string;
  paymentProviderLabel: string;
  providerPaymentId: string | null;
  isPaid: boolean;
  isCanceled: boolean;
};
