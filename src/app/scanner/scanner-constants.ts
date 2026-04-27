import { formatAmount } from "@/lib/payments/razorpay";

export const scanSteps = [
  "Analyzing SEO structure...",
  "Checking performance bottlenecks...",
  "Reviewing accessibility signals...",
  "Generating AI report...",
];

export const competitorSteps = [
  "Fetching competitor benchmarks...",
  "Comparing performance deltas...",
  "Modeling opportunity impact...",
  "Building comparison report...",
];

export const REPORT_UNLOCK_STORAGE_KEY = "report_unlocked";
export const REPORT_UNLOCK_AMOUNT = 2.99;
export const REPORT_UNLOCK_CURRENCY =
  process.env.NEXT_PUBLIC_PAYMENT_CURRENCY?.trim() || "INR";
export const REPORT_UNLOCK_PRICE_LABEL = formatAmount(
  REPORT_UNLOCK_AMOUNT,
  REPORT_UNLOCK_CURRENCY
);
