export type PaymentRegion = "IN" | "INTL";

export type PaymentCurrency = "INR" | "USD";

export type PlanType = "free" | "one_time" | "subscription";

export type SubscriptionStatus =
  | "none"
  | "created"
  | "active"
  | "cancel_scheduled"
  | "past_due"
  | "cancelled";

export type Plan = {
  readonly id: string | number;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly compareAtPrice: number | null;
  readonly discountPercent: number | null;
  readonly hasDiscount: boolean;
  readonly cadence: string | null;
  readonly type: PlanType;
  readonly features: readonly string[] | null;
  readonly cta: string | null;
  readonly scanLimit: number | null;
  readonly badge: string | null;
  readonly isHighlighted: boolean | null;
};

export type PaymentQuote = {
  readonly region: PaymentRegion;
  readonly currency: PaymentCurrency;
  readonly total: number;
  readonly amountSubunits: number;
  readonly gstInclusive: boolean;
  readonly gstRatePercent: number;
  readonly usdToInrRate?: number;
};

export type SubscriptionState = {
  readonly isPro: boolean;
  readonly dailyScanLimit: number | null;
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
    }
  | {
      readonly kind: "past_due";
      readonly href: string;
      readonly label: string;
    };
