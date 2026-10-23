import { apiFetch } from "@/lib/api/client";
import { detectClientRegion } from "@/lib/payments/payment-region";
import type {
  ApiEnvelope,
  CreateOrderResponse,
  PaymentQuote,
  PaymentRegion,
  VerifyPaymentResponse,
} from "@/types/api";

function regionHeaders(region: PaymentRegion) {
  return { "x-client-region": region };
}

export function formatQuoteLabel(quote: PaymentQuote): string {
  if (quote.currency === "INR") {
    return `₹${quote.total} incl. ${quote.gstRatePercent}% GST`;
  }
  return `$${quote.total}`;
}

export async function fetchPaymentQuote(
  region: PaymentRegion = detectClientRegion()
): Promise<PaymentQuote> {
  const data = await apiFetch<ApiEnvelope<PaymentQuote>>(
    `/payment/razorpay/quote?region=${region}`,
    { headers: regionHeaders(region) }
  );
  if (!data.data) {
    throw new Error(data.message ?? "Unable to load payment quote.");
  }
  return data.data;
}

export async function createUnlockOrder(input: {
  readonly scanId: string;
  readonly email: string;
  readonly region?: PaymentRegion;
}): Promise<CreateOrderResponse> {
  const region = input.region ?? detectClientRegion();
  return apiFetch<CreateOrderResponse>("/payment/razorpay/create-order", {
    method: "POST",
    headers: regionHeaders(region),
    body: JSON.stringify({
      scanId: input.scanId,
      email: input.email,
      region,
    }),
  });
}

export async function verifyUnlockPayment(input: {
  readonly razorpay_order_id: string;
  readonly razorpay_payment_id: string;
  readonly razorpay_signature: string;
  readonly scanId: string;
}): Promise<VerifyPaymentResponse> {
  return apiFetch<VerifyPaymentResponse>("/payment/razorpay/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
