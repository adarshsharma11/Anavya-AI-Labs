import { z } from "zod";

import { apiFetch } from "@/lib/api/client";
import { GST_INCLUSIVE_LABEL } from "@/lib/payments/payment-constants";
import {
  detectClientRegion,
  type PaymentRegion,
} from "@/lib/payments/payment-region";

export type PaymentQuote = {
  region: PaymentRegion;
  currency: "INR" | "USD";
  total: number;
  amountSubunits: number;
  gstInclusive: boolean;
  gstRatePercent: number;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
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
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
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

const verifyResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

const paymentQuoteSchema = z.object({
  region: z.enum(["IN", "INTL"]),
  currency: z.enum(["INR", "USD"]),
  total: z.number().positive(),
  amountSubunits: z.number().positive(),
  gstInclusive: z.boolean(),
  gstRatePercent: z.number(),
});

const quoteResponseSchema = z.object({
  success: z.boolean(),
  data: paymentQuoteSchema.optional(),
  message: z.string().optional(),
});

const createOrderSchema = z.object({
  id: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(3),
});

const createOrderResponseSchema = z.object({
  success: z.boolean(),
  order: createOrderSchema.optional(),
  quote: paymentQuoteSchema.optional(),
  key_id: z.string().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

const paymentResultSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

const VERIFY_MAX_RETRIES = 2;

let razorpayScriptPromise: Promise<void> | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clientRegionHeaders(region: PaymentRegion) {
  return { "x-client-region": region };
}

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
  return `${formatAmount(quote.total, quote.currency)} (${GST_INCLUSIVE_LABEL})`;
}

export async function fetchPaymentQuote(
  region: PaymentRegion = detectClientRegion()
): Promise<PaymentQuote> {
  const data = await apiFetch<unknown>(
    `/payment/razorpay/quote?region=${region}`,
    { headers: clientRegionHeaders(region) }
  );

  const parsed = quoteResponseSchema.safeParse(data);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new Error(
      parsed.data?.message ?? "Unable to load payment quote."
    );
  }

  return parsed.data.data;
}

async function loadRazorpayScript(): Promise<void> {
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

async function verifyPaymentWithRetry(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  scanId: number;
}) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= VERIFY_MAX_RETRIES; attempt += 1) {
    try {
      const verifyData = await apiFetch<unknown>("/payment/razorpay/verify", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const parsed = verifyResponseSchema.safeParse(verifyData);
      if (!parsed.success) {
        throw new Error("Invalid verify response.");
      }
      if (!parsed.data.success) {
        const message =
          parsed.data.message ?? parsed.data.error ?? "Payment verify failed.";
        throw new Error(message);
      }

      return;
    } catch (error) {
      const typedError =
        error instanceof Error ? error : new Error("Payment verify failed.");
      if (/signature/i.test(typedError.message)) {
        throw new Error("Payment verification failed: invalid signature.");
      }
      lastError = typedError;
      if (attempt >= VERIFY_MAX_RETRIES) break;
      await sleep(500 * (attempt + 1));
    }
  }

  throw lastError ?? new Error("Payment verification failed.");
}

export async function startRazorpayPayment(scanId: number) {
  if (!Number.isFinite(scanId) || scanId <= 0) {
    throw new Error("Invalid scanId.");
  }

  const region = detectClientRegion();

  const createOrderResponse = await apiFetch<unknown>(
    "/payment/razorpay/create-order",
    {
      method: "POST",
      headers: clientRegionHeaders(region),
      body: JSON.stringify({ scanId, region }),
    }
  );

  const parsedCreate = createOrderResponseSchema.safeParse(createOrderResponse);
  if (!parsedCreate.success) {
    throw new Error("Invalid create-order response.");
  }
  if (!parsedCreate.data.success) {
    throw new Error(
      parsedCreate.data.message ??
        parsedCreate.data.error ??
        "Unable to create payment order."
    );
  }

  const order = parsedCreate.data.order;
  const quote = parsedCreate.data.quote;
  if (!order || !quote) {
    throw new Error("Order details missing in create-order response.");
  }

  if (String(order.currency).toUpperCase() !== quote.currency) {
    throw new Error("Payment order currency mismatch.");
  }

  if (Number(order.amount) !== quote.amountSubunits) {
    throw new Error("Payment order amount mismatch.");
  }

  const keyId =
    parsedCreate.data.key_id ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("Razorpay key is not configured.");
  }

  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error("Razorpay checkout not available.");
  }

  const RazorpayCtor = window.Razorpay;
  const paymentResponse = await new Promise<RazorpaySuccessResponse>(
    (resolve, reject) => {
      const checkout = new RazorpayCtor({
        key: keyId,
        amount: order.amount,
        currency: quote.currency,
        order_id: order.id,
        name: "Anvaya AI Labs",
        description: `Unlock full AI report (${GST_INCLUSIVE_LABEL})`,
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
    }
  );

  const parsedPayment = paymentResultSchema.safeParse(paymentResponse);
  if (!parsedPayment.success) {
    throw new Error("Payment response missing fields.");
  }

  await verifyPaymentWithRetry({
    razorpay_order_id: parsedPayment.data.razorpay_order_id,
    razorpay_payment_id: parsedPayment.data.razorpay_payment_id,
    razorpay_signature: parsedPayment.data.razorpay_signature,
    scanId,
  });

  return parsedPayment.data;
}
