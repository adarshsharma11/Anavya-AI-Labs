import type {
  PaymentCurrency,
  PaymentRegion,
  Plan,
  PlanCtaView,
  PricingUser,
  SubscriptionState,
} from "@/types/pricing";

export const PRICING_REGION_STORAGE_KEY = "anavya-payment-region";

export function inferRegionFromEnvironment(
  timeZone?: string,
  language?: string
): PaymentRegion {
  if (timeZone === "Asia/Kolkata" || timeZone === "Asia/Calcutta") return "IN";
  if (typeof language === "string" && language.endsWith("-IN")) return "IN";
  return "INTL";
}

export function detectRegion(): PaymentRegion {
  if (typeof window === "undefined") return "INTL";

  try {
    const stored = window.localStorage.getItem(PRICING_REGION_STORAGE_KEY);
    if (stored === "IN" || stored === "INTL") return stored;
  } catch {
    // ignore
  }

  let timeZone: string | undefined;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timeZone = undefined;
  }

  return inferRegionFromEnvironment(timeZone, navigator.language);
}

export function persistRegion(region: PaymentRegion): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRICING_REGION_STORAGE_KEY, region);
  } catch {
    // ignore
  }
}

export function formatPrice(amount: number, currency: PaymentCurrency): string {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}

export function scanLimitLabel(plan: Plan): string {
  const unset = plan.scanLimit === null || plan.scanLimit === -1;
  if (plan.type === "free" && unset) return "Free daily scans";
  if (unset) return "Unlimited scans";
  return `${plan.scanLimit} scans / day`;
}

export function defaultPlanCta(plan: Plan): string {
  if (plan.cta) return plan.cta;
  if (plan.type === "free") return "Start free";
  if (plan.type === "one_time") return "Run a free scan, then unlock the full report";
  return "Go Pro";
}

export function planCtaHref(plan: Plan, user: PricingUser | null): string {
  if (plan.type === "free") return "/?intent=scan";
  if (plan.type === "one_time") return "/?intent=unlock";
  if (!user?.isAuthenticated) return "/login?next=/pricing&intent=subscribe";
  return "/pricing";
}

export function formatPeriodDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export function selectPlanCta(input: {
  readonly plan: Plan;
  readonly isAuthenticated: boolean;
  readonly subscription: SubscriptionState | null;
}): PlanCtaView {
  const { plan, isAuthenticated, subscription } = input;
  const label = defaultPlanCta(plan);
  const user = { isAuthenticated };

  if (plan.type === "free") {
    if (isAuthenticated && subscription !== null && subscription.isPro === false) {
      return { kind: "disabled", label: "Current plan" };
    }
    return { kind: "link", href: planCtaHref(plan, user), label };
  }

  if (plan.type === "one_time") {
    return { kind: "link", href: planCtaHref(plan, user), label };
  }

  if (!isAuthenticated) {
    return { kind: "link", href: planCtaHref(plan, user), label };
  }

  const period = formatPeriodDate(subscription?.currentPeriodEnd ?? null);

  if (subscription?.status === "active") {
    return {
      kind: "disabled",
      label: "Current plan",
      hint: period ? `Renews on ${period}` : undefined,
      manageHref: "/dashboard/billing",
    };
  }

  if (subscription?.status === "cancel_scheduled") {
    return {
      kind: "disabled",
      label: period ? `Pro until ${period}` : "Pro until the period ends",
      manageHref: "/dashboard/billing",
    };
  }

  if (subscription?.status === "past_due") {
    return {
      kind: "past_due",
      href: "/dashboard/billing",
      label: "Payment issue: update payment",
    };
  }

  return { kind: "subscribe", label };
}

export function comparisonFeatureRows(plans: readonly Plan[]): readonly string[] {
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const plan of plans) {
    for (const feature of plan.features ?? []) {
      if (seen.has(feature)) continue;
      seen.add(feature);
      rows.push(feature);
    }
  }
  return rows;
}

export function planHasFeature(plan: Plan, feature: string): boolean {
  return (plan.features ?? []).includes(feature);
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizePlan(value: unknown): Plan | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const type = raw.type;
  if (type !== "free" && type !== "one_time" && type !== "subscription") return null;
  if (typeof raw.name !== "string" || raw.name.length === 0) return null;
  if (typeof raw.id !== "string" && typeof raw.id !== "number") return null;

  const features = Array.isArray(raw.features)
    ? raw.features.filter((item): item is string => typeof item === "string")
    : null;

  return {
    id: raw.id,
    name: raw.name,
    description: asNullableString(raw.description),
    price: typeof raw.price === "number" && Number.isFinite(raw.price) ? raw.price : 0,
    compareAtPrice: asNullableNumber(raw.compareAtPrice),
    discountPercent: asNullableNumber(raw.discountPercent),
    hasDiscount: raw.hasDiscount === true,
    cadence: asNullableString(raw.cadence),
    type,
    features: features && features.length > 0 ? features : null,
    cta: asNullableString(raw.cta),
    scanLimit: asNullableNumber(raw.scanLimit),
    badge: asNullableString(raw.badge),
    isHighlighted: typeof raw.isHighlighted === "boolean" ? raw.isHighlighted : null,
  };
}

export const FALLBACK_FREE_FEATURES = [
  "Multi-page audit",
  "AEO, GEO, and AI crawler checks",
  "Ranked recommendations in plain language",
  "Downloadable PDF",
] as const;

export const FALLBACK_FREE_PLAN: Plan = {
  id: "free",
  name: "Free",
  description: "Full AEO, GEO, technical and content audit plus a downloadable PDF.",
  price: 0,
  compareAtPrice: null,
  discountPercent: null,
  hasDiscount: false,
  cadence: null,
  type: "free",
  features: FALLBACK_FREE_FEATURES,
  cta: "Start free",
  scanLimit: null,
  badge: null,
  isHighlighted: false,
};

export function withFallbackFreePlan(plans: readonly Plan[]): readonly Plan[] {
  if (plans.some((plan) => plan.type === "free")) return plans;
  return [FALLBACK_FREE_PLAN, ...plans];
}

export function normalizePlans(payload: unknown): readonly Plan[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizePlan).filter((plan): plan is Plan => plan !== null);
  }
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) {
      return data.map(normalizePlan).filter((plan): plan is Plan => plan !== null);
    }
  }
  return [];
}
