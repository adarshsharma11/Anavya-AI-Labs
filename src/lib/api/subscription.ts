import { apiFetch } from "@/lib/api/client";
import type {
  ApiEnvelope,
  CancelSubscriptionResponse,
  SubscribeResponse,
  SubscribeVerifyResponse,
  SubscriptionState,
} from "@/types/api";

export async function fetchSubscription(): Promise<SubscriptionState> {
  const data = await apiFetch<ApiEnvelope<SubscriptionState>>(
    "/payment/subscription"
  );
  if (!data.data) {
    return {
      isPro: false,
      dailyScanLimit: null,
      status: "none",
      currentPeriodEnd: null,
    };
  }
  return data.data;
}

export async function createSubscription(): Promise<SubscribeResponse> {
  const data = await apiFetch<ApiEnvelope<SubscribeResponse>>(
    "/payment/razorpay/subscribe",
    { method: "POST" }
  );
  if (!data.data) {
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
  if (!data.data) {
    throw new Error(data.message ?? "Unable to verify subscription.");
  }
  return data.data;
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
