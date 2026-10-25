import {
  fetchPaymentQuote as fetchQuoteFromApi,
  formatQuoteLabel,
} from "@/lib/api/payment";
import {
  createSubscription,
  verifySubscription,
} from "@/lib/api/subscription";
import { isApiError } from "@/lib/api/client";
import { detectClientRegion } from "@/lib/payments/payment-region";
import type { PaymentQuote, PaymentRegion, SubscribeResponse } from "@/types/api";

export type { PaymentQuote };

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
    reason?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount?: number;
  currency?: string;
  order_id?: string;
  subscription_id?: string;
  name: string;
  description: string;
  prefill?: { email?: string; name?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: RazorpayFailureResponse) => void
  ) => void;
};

let razorpayScriptPromise: Promise<void> | null = null;

export function formatAmount(amount: number, currency: "INR" | "USD") {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPaymentPriceLabel(quote: PaymentQuote) {
  return formatQuoteLabel(quote);
}

export async function fetchPaymentQuote(
  region: PaymentRegion = detectClientRegion()
): Promise<PaymentQuote> {
  return fetchQuoteFromApi(region);
}

export async function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Razorpay can only run in browser.");
  }
  if (window.Razorpay) return;
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Unable to load Razorpay checkout."))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

async function openCheckout(options: RazorpayOptions) {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error("Razorpay checkout not available.");
  }

  return new Promise<RazorpaySuccessResponse>((resolve, reject) => {
    const checkout = new window.Razorpay!({
      ...options,
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled.")),
      },
    });
    checkout.on("payment.failed", (response) => {
      reject(
        new Error(
          response.error?.description ||
            response.error?.reason ||
            "Payment failed."
        )
      );
    });
    checkout.open();
  });
}

export async function startRazorpaySubscription(input: {
  readonly plan: string;
  readonly region: PaymentRegion;
}): Promise<SubscribeResponse> {
  const created = await createSubscription(input);
  const payment = await openCheckout({
    key: created.keyId,
    subscription_id: created.subscriptionId,
    name: "Anavya AI Labs",
    description: `${created.plan.name} monthly`,
    prefill: {
      email: created.prefill.email,
      name: created.prefill.name,
    },
    handler: () => undefined,
  });

  if (!payment.razorpay_subscription_id) {
    throw new Error("Subscription payment is missing an id.");
  }

  await verifySubscription({
    razorpay_payment_id: payment.razorpay_payment_id,
    razorpay_subscription_id: payment.razorpay_subscription_id,
    razorpay_signature: payment.razorpay_signature,
  });

  return created;
}

export { isApiError };
