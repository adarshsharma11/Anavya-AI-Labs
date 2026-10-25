import type {
  PaymentCurrency,
  PaymentRegion,
  Plan,
  PlanCtaView,
  PlanPriceQuote,
  PlanPrices,
  PricingUser,
  SubscriptionState,
  SubscriptionStatus,
} from "@/types/pricing";

export const PRICING_REGION_STORAGE_KEY = "anavya-payment-region";

const STATUSES = new Set<SubscriptionStatus>([
  "none",
  "created",
  "active",
  "cancel_scheduled",
  "past_due",
  "cancelled",
  "expired",
]);

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

export function planQuote(plan: Plan, region: PaymentRegion): PlanPriceQuote {
  return region === "IN" ? plan.prices.INR : plan.prices.USD;
}

export function planPriceView(
  plan: Plan,
  region: PaymentRegion
): { readonly headline: string; readonly taxLine: string | null } {
  if (plan.type === "free") {
    return { headline: "Free", taxLine: null };
  }

  const quote = planQuote(plan, region);
  if (region === "IN") {
    return {
      headline: `${formatPrice(quote.total, "INR")}/month`,
      taxLine: `${formatPrice(quote.base, "INR")} + ${formatPrice(quote.gstAmount, "INR")} GST (${quote.gstRatePercent}%)`,
    };
  }

  return {
    headline: `${formatPrice(quote.total, "USD")}/month`,
    taxLine: null,
  };
}

export function scanLimitLabel(plan: Plan): string {
  if (plan.scanLimit === null || plan.scanLimit < 0) return "Unlimited scans";
  return `${plan.scanLimit} scans / day`;
}

export function defaultPlanCta(plan: Plan): string {
  if (plan.cta) return plan.cta;
  if (plan.type === "free") return "Start free";
  return plan.name;
}

export function subscribeLoginHref(slug: string): string {
  const next = `/pricing?plan=${encodeURIComponent(slug)}`;
  return `/login?next=${encodeURIComponent(next)}&intent=subscribe&plan=${encodeURIComponent(slug)}`;
}

export function planCtaHref(plan: Plan, user: PricingUser | null): string {
  if (plan.type === "free") return "/scanner";
  if (!user?.isAuthenticated) return subscribeLoginHref(plan.slug);
  return "/pricing";
}

export function formatPeriodDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function isThisPlan(plan: Plan, subscription: SubscriptionState | null) {
  if (!subscription?.plan) return false;
  return subscription.plan.slug === plan.slug;
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
    return { kind: "link", href: planCtaHref(plan, user), label };
  }

  if (!isAuthenticated) {
    return { kind: "link", href: planCtaHref(plan, user), label };
  }

  const period = formatPeriodDate(subscription?.currentPeriodEnd ?? null);
  const current = isThisPlan(plan, subscription);

  if (current && subscription?.status === "active") {
    return {
      kind: "disabled",
      label: "Current plan",
      hint: period ? `Renews on ${period}` : undefined,
      manageHref: "/dashboard/billing",
    };
  }

  if (current && subscription?.status === "cancel_scheduled") {
    return {
      kind: "disabled",
      label: period ? `Cancels on ${period}` : "Cancellation scheduled",
      manageHref: "/dashboard/billing",
    };
  }

  if (current && subscription?.status === "past_due") {
    return {
      kind: "past_due",
      href: "/dashboard/billing",
      label: "Payment issue: update payment",
    };
  }

  return { kind: "subscribe", label, slug: plan.slug };
}

export function comparisonFeatureRows(plans: readonly Plan[]): readonly string[] {
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const plan of plans) {
    for (const feature of plan.features) {
      if (seen.has(feature)) continue;
      seen.add(feature);
      rows.push(feature);
    }
  }
  return rows;
}

export function planHasFeature(plan: Plan, feature: string): boolean {
  return plan.features.includes(feature);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asQuote(value: unknown, fallbackRegion: PaymentRegion): PlanPriceQuote | null {
  const raw = asRecord(value);
  if (!raw) return null;
  const currency = raw.currency === "INR" || raw.currency === "USD" ? raw.currency : null;
  const region = raw.region === "IN" || raw.region === "INTL" ? raw.region : fallbackRegion;
  if (!currency) return null;
  if (typeof raw.total !== "number" || !Number.isFinite(raw.total)) return null;
  return {
    region,
    currency,
    base: typeof raw.base === "number" && Number.isFinite(raw.base) ? raw.base : raw.total,
    gstAmount:
      typeof raw.gstAmount === "number" && Number.isFinite(raw.gstAmount) ? raw.gstAmount : 0,
    gstRatePercent:
      typeof raw.gstRatePercent === "number" && Number.isFinite(raw.gstRatePercent)
        ? raw.gstRatePercent
        : 0,
    total: raw.total,
    amountSubunits:
      typeof raw.amountSubunits === "number" && Number.isFinite(raw.amountSubunits)
        ? raw.amountSubunits
        : Math.round(raw.total * 100),
    usdToInrRate: asNullableNumber(raw.usdToInrRate) ?? undefined,
  };
}

function asPrices(value: unknown): PlanPrices | null {
  const raw = asRecord(value);
  if (!raw) return null;
  const usd = asQuote(raw.USD, "INTL");
  const inr = asQuote(raw.INR, "IN");
  if (!usd || !inr) return null;
  return { USD: usd, INR: inr };
}

export function normalizePlan(value: unknown): Plan | null {
  const raw = asRecord(value);
  if (!raw) return null;
  const type = raw.type === "free" || raw.type === "subscription" ? raw.type : null;
  if (!type) return null;
  if (typeof raw.name !== "string" || raw.name.length === 0) return null;
  if (typeof raw.slug !== "string" || raw.slug.length === 0) return null;
  if (typeof raw.id !== "string" && typeof raw.id !== "number") return null;
  const prices = asPrices(raw.prices);
  if (!prices) return null;

  const features = Array.isArray(raw.features)
    ? raw.features.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    description: asNullableString(raw.description),
    price: typeof raw.price === "number" && Number.isFinite(raw.price) ? raw.price : prices.USD.total,
    cadence: asNullableString(raw.cadence),
    type,
    features,
    cta: asNullableString(raw.cta),
    scanLimit: asNullableNumber(raw.scanLimit),
    whiteLabel: raw.whiteLabel === true,
    monitoring: raw.monitoring === true,
    badge: asNullableString(raw.badge),
    isHighlighted: raw.isHighlighted === true,
    prices,
  };
}

export function normalizePlans(payload: unknown): readonly Plan[] {
  const list = Array.isArray(payload)
    ? payload
    : asRecord(payload) && Array.isArray(asRecord(payload)?.data)
      ? (asRecord(payload)?.data as unknown[])
      : null;
  if (!list) return [];
  return list.map(normalizePlan).filter((plan): plan is Plan => plan !== null);
}

export function normalizeSubscriptionStatus(value: unknown): SubscriptionStatus {
  return typeof value === "string" && STATUSES.has(value as SubscriptionStatus)
    ? (value as SubscriptionStatus)
    : "none";
}

export function emptySubscription(): SubscriptionState {
  return {
    plan: null,
    isPaid: false,
    isPro: false,
    dailyScanLimit: null,
    whiteLabel: false,
    monitoring: false,
    status: "none",
    currentPeriodEnd: null,
  };
}

export function normalizeSubscription(payload: unknown): SubscriptionState {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  if (!data) return emptySubscription();

  const planRaw = asRecord(data.plan);
  const plan =
    planRaw && typeof planRaw.slug === "string" && typeof planRaw.name === "string"
      ? {
          id:
            typeof planRaw.id === "string" || typeof planRaw.id === "number"
              ? planRaw.id
              : planRaw.slug,
          slug: planRaw.slug,
          name: planRaw.name,
        }
      : null;

  return {
    plan,
    isPaid: typeof data.isPaid === "boolean" ? data.isPaid : plan !== null,
    isPro: data.isPro === true,
    dailyScanLimit: asNullableNumber(data.dailyScanLimit),
    whiteLabel: data.whiteLabel === true,
    monitoring: data.monitoring === true,
    status: normalizeSubscriptionStatus(data.status),
    currentPeriodEnd: asNullableString(data.currentPeriodEnd),
  };
}
