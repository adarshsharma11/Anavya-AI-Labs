export type PaymentRegion = "IN" | "INTL";

export type PaymentCurrency = "INR" | "USD";

export type PlanType = "free" | "subscription";

export type SubscriptionStatus =
  | "none"
  | "created"
  | "active"
  | "cancel_scheduled"
  | "past_due"
  | "cancelled"
  | "expired";

export type PlanPriceQuote = {
  readonly region: PaymentRegion;
  readonly currency: PaymentCurrency;
  readonly base: number;
  readonly gstAmount: number;
  readonly gstRatePercent: number;
  readonly total: number;
  readonly amountSubunits: number;
  readonly usdToInrRate?: number;
};

export type PlanPrices = {
  readonly USD: PlanPriceQuote;
  readonly INR: PlanPriceQuote;
};

export type Plan = {
  readonly id: string | number;
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly cadence: string | null;
  readonly type: PlanType;
  readonly features: readonly string[];
  readonly cta: string | null;
  readonly scanLimit: number | null;
  readonly whiteLabel: boolean;
  readonly monitoring: boolean;
  readonly badge: string | null;
  readonly isHighlighted: boolean;
  readonly prices: PlanPrices;
};

export type AccountPlan = {
  readonly id: string | number;
  readonly slug: string;
  readonly name: string;
};

export type SubscriptionState = {
  readonly plan: AccountPlan | null;
  readonly isPaid: boolean;
  readonly isPro: boolean;
  readonly dailyScanLimit: number | null;
  readonly whiteLabel: boolean;
  readonly monitoring: boolean;
  readonly status: SubscriptionStatus;
  readonly currentPeriodEnd: string | null;
};

export type PricingUser = {
  readonly isAuthenticated: boolean;
};

export type PlanCtaView =
  | {
      readonly kind: "link";
      readonly href: string;
      readonly label: string;
    }
  | {
      readonly kind: "disabled";
      readonly label: string;
      readonly hint?: string;
      readonly manageHref?: string;
    }
  | {
      readonly kind: "subscribe";
      readonly label: string;
      readonly slug: string;
    }
  | {
      readonly kind: "past_due";
      readonly href: string;
      readonly label: string;
    };
