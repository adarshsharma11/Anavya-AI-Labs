import { apiFetch } from "@/lib/api/client";
import { emptySubscription, normalizeSubscription } from "@/lib/pricing";
import type {
  ApiEnvelope,
  CancelSubscriptionResponse,
  PaymentRegion,
  SubscribeResponse,
  SubscribeVerifyResponse,
  SubscriptionState,
} from "@/types/api";

export async function fetchSubscription(): Promise<SubscriptionState> {
  const data = await apiFetch<unknown>("/payment/subscription");
  return normalizeSubscription(data);
}

export async function createSubscription(input: {
  readonly plan: string;
  readonly region: PaymentRegion;
}): Promise<SubscribeResponse> {
  const data = await apiFetch<ApiEnvelope<SubscribeResponse>>(
    "/payment/razorpay/subscribe",
    {
      method: "POST",
      body: JSON.stringify({
        plan: input.plan,
        region: input.region,
      }),
    }
  );
  if (!data.data?.subscriptionId || !data.data.keyId) {
    throw new Error(data.message ?? "Unable to start subscription.");
  }
  return data.data;
}

export async function verifySubscription(input: {
  readonly razorpay_payment_id: string;
  readonly razorpay_subscription_id: string;
  readonly razorpay_signature: string;
}): Promise<SubscribeVerifyResponse> {
  const data = await apiFetch<ApiEnvelope<SubscribeVerifyResponse>>(
    "/payment/razorpay/subscribe/verify",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  if (data.success === false) {
    throw new Error(data.message ?? "Unable to verify subscription.");
  }
  return (
    data.data ?? {
      status: "active",
      currentPeriodEnd: null,
    }
  );
}

export async function cancelSubscription(): Promise<CancelSubscriptionResponse> {
  const data = await apiFetch<ApiEnvelope<CancelSubscriptionResponse>>(
    "/payment/subscription/cancel",
    { method: "POST" }
  );
  if (!data.data) {
    throw new Error(data.message ?? "Unable to cancel subscription.");
  }
  return data.data;
}

export { emptySubscription };
