export type PaymentRegion = "IN" | "INTL";

/** Detect India vs international for Razorpay currency (INR vs USD). */
export function detectClientRegion(): PaymentRegion {
  if (typeof window === "undefined") return "INTL";

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "IN";
  } catch {
    // ignore
  }

  const locale = navigator.language || "";
  if (locale === "en-IN" || locale.endsWith("-IN")) return "IN";

  return "INTL";
}
