import type { AiReport, AuditReport, CompetitorAnalysis } from "./audit";

export type ScanStatus =
  | "processing"
  | "preview_done"
  | "paid"
  | "generating_full_report"
  | "completed"
  | "report_failed";

export type CompetitorStatus = "pending" | "running" | "completed" | "failed";

export type ReportVersion = 1 | 2;

export type PaymentRegion = "IN" | "INTL";

export type PaymentCurrency = "INR" | "USD";

export type SubscriptionStatus =
  | "none"
  | "created"
  | "active"
  | "cancel_scheduled"
  | "past_due"
  | "cancelled"
  | "expired";

export type BlogStatus = "draft" | "published";

export type RevenueType = "report" | "subscription" | "donation";

export type ApiEnvelope<T> = {
  readonly success: boolean;
  readonly data?: T;
  readonly message?: string;
  readonly code?: string;
};

export type CreateScanResponse = {
  readonly success: boolean;
  readonly scanId: string;
  readonly publicId: string;
  readonly unlocked: boolean;
  readonly cached: boolean;
  readonly message?: string;
  readonly code?: string;
};

export type LegacyScanPreview = {
  readonly overall: number;
  readonly verdict: string;
  readonly totalIssuesFound?: number;
  readonly categories: {
    readonly performance: number;
    readonly seo: number;
    readonly accessibility: number;
    readonly security: number;
  };
  readonly metrics?: {
    readonly loadTime?: string;
    readonly pageSize?: string;
    readonly images?: number;
    readonly scripts?: number;
    readonly links?: number;
    readonly titleChars?: number;
    readonly metaDescriptionChars?: number;
    readonly metaDescriptionWords?: number;
  } | null;
  readonly social?: {
    readonly ogTags?: boolean;
    readonly ogImage?: boolean;
    readonly twitterTags?: boolean;
    readonly facebookAdmins?: boolean;
    readonly facebookAppId?: boolean;
  } | null;
  readonly seoMeta?: {
    readonly canonical?: boolean;
    readonly metaRobots?: string;
    readonly favicon?: boolean;
  } | null;
  readonly indexing?: {
    readonly robots?: boolean;
    readonly sitemap?: boolean;
  } | null;
  readonly improvements?: {
    readonly potentialScore: number;
    readonly trafficPotential: string;
    readonly fixCount: number;
  };
  readonly topIssues?: readonly {
    readonly title: string;
    readonly severity: string;
  }[];
  readonly quickWins?: readonly string[];
  readonly lockedIssues?: number;
  readonly locked?: boolean;
  readonly isUnlocked?: boolean;
};

export type LegacyScanReport = {
  readonly issues?: readonly {
    readonly title: string;
    readonly severity: string;
    readonly suggestion?: string;
    readonly codeSnippet?: {
      readonly html?: string;
      readonly css?: string;
      readonly js?: string;
    };
  }[];
  readonly suggestions?: readonly string[];
  readonly summary?: string;
  readonly executiveSummary?: string;
  readonly technicalAnalysis?: string;
  readonly seoImprovements?: readonly string[];
  readonly performanceImprovements?: readonly string[];
  readonly businessGrowthSuggestions?: readonly string[];
  readonly geoImprovements?: readonly string[];
  readonly competitorStrategy?: string | null;
  readonly estimatedTrafficImpact?: string;
  readonly error?: string;
};

export type ScanRecord = {
  readonly id: number;
  readonly publicId: string;
  readonly url: string;
  readonly competitorUrl: string | null;
  readonly status: ScanStatus;
  readonly reportVersion: ReportVersion;
  readonly auditComplete: boolean;
  readonly preview: AuditReport | LegacyScanPreview | null;
  readonly competitorPreview: AuditReport | LegacyScanPreview | null;
  readonly competitorStatus: CompetitorStatus | null;
  readonly competitorAnalysis: CompetitorAnalysis | null;
  readonly fullReport: AiReport | LegacyScanReport | null;
  readonly isUnlocked: boolean;
  readonly locked: boolean;
  readonly processing: boolean;
  readonly createdAt: string;
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

export type RazorpayOrder = {
  readonly id: string;
  readonly amount: number;
  readonly currency: string;
};

export type CreateOrderResponse = {
  readonly success: boolean;
  readonly order: RazorpayOrder;
  readonly quote: PaymentQuote;
  readonly publicId: string;
  readonly prefill: { readonly email?: string };
  readonly key_id: string;
  readonly message?: string;
  readonly code?: string;
};

export type VerifyPaymentResponse = {
  readonly success: boolean;
  readonly unlocked: boolean;
  readonly publicId: string;
  readonly message?: string;
  readonly code?: string;
};

export type SubscriptionPlan = {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly cadence: string;
};

export type SubscriptionState = {
  readonly isPro: boolean;
  readonly dailyScanLimit: number | null;
  readonly status: SubscriptionStatus;
  readonly currentPeriodEnd: string | null;
};

export type SubscribeResponse = {
  readonly subscriptionId: string;
  readonly keyId: string;
  readonly plan: SubscriptionPlan;
  readonly prefill: { readonly email?: string; readonly name?: string };
};

export type SubscribeVerifyResponse = {
  readonly status: SubscriptionStatus;
  readonly currentPeriodEnd: string | null;
};

export type CancelSubscriptionResponse = {
  readonly status: "cancel_scheduled";
  readonly currentPeriodEnd: string | null;
};

export type DashboardScan = {
  readonly id: number;
  readonly publicId: string;
  readonly url: string;
  readonly competitorUrl: string | null;
  readonly status: ScanStatus;
  readonly isUnlocked: boolean;
  readonly hasFullReport: boolean;
  readonly overall: number | null;
  readonly verdict: string | null;
  readonly categories?: Partial<
    Readonly<Record<"aeo" | "geo" | "performance" | "seo", number | null>>
  >;
  readonly reportVersion: ReportVersion;
  readonly createdAt: string;
};

export type DashboardAnalytics = {
  readonly totalScans: number;
  readonly avgOverallScore?: number;
  readonly avgPerformanceScore: number;
  readonly avgSeoScore: number;
  readonly avgAeoScore?: number;
  readonly avgGeoScore?: number;
  readonly totalIssuesFound: number;
  readonly recentActivity?: readonly DashboardScan[];
};

export type UserProfile = {
  readonly id: number;
  readonly email: string;
  readonly name: string;
  readonly username?: string;
  readonly phoneNumber?: string;
  readonly companyName?: string;
  readonly companyLogoUrl?: string;
  readonly role?: string;
};

export type Monitor = {
  readonly id: number;
  readonly url: string;
  readonly createdAt: string;
};

export type MonitorHistoryPoint = {
  readonly publicId: string;
  readonly status: ScanStatus;
  readonly overall: number | null;
  readonly geoScore: number | null;
  readonly aeoScore: number | null;
  readonly createdAt: string;
};

export type MonitorHistory = {
  readonly monitor: Monitor;
  readonly history: readonly MonitorHistoryPoint[];
};

export type RevenueTotal = {
  readonly type: RevenueType;
  readonly currency: PaymentCurrency | string;
  readonly count: number;
  readonly amountSubunits: number;
  readonly last30DaysSubunits: number;
};

export type RevenueScans = {
  readonly paidScans: number;
  readonly deliveredReports: number;
  readonly stuckReports: number;
  readonly failedReports: number;
};

export type RevenueSubscriptions = {
  readonly activeSubscriptions: number;
  readonly pastDueSubscriptions: number;
};

export type RevenuePayment = {
  readonly id: string | number;
  readonly type: RevenueType | string;
  readonly currency: string;
  readonly amountSubunits: number;
  readonly scanId?: number;
  readonly publicId?: string;
  readonly email?: string;
  readonly status?: string;
  readonly createdAt: string;
};

export type AdminRevenue = {
  readonly totals: readonly RevenueTotal[];
  readonly scans: RevenueScans;
  readonly subscriptions: RevenueSubscriptions;
  readonly recentPayments: readonly RevenuePayment[];
};

export type GeoLead = {
  readonly id: number;
  readonly url: string;
  readonly email: string | null;
  readonly userId: number | null;
  readonly score: number | null;
  readonly createdAt: string;
};

export type BlogPost = {
  readonly id: number;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly content: string;
  readonly image: string;
  readonly category: string;
  readonly authorName: string;
  readonly authorRole: string;
  readonly authorAvatar: string;
  readonly readTime: string;
  readonly date: string;
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly status?: BlogStatus;
};

export type AuthTokens = {
  readonly accessToken: string;
  readonly refreshToken: string;
};

export type ForgotPasswordResponse = {
  readonly success: boolean;
  readonly message?: string;
  readonly otp?: string;
  readonly mockEmailDelivery?: boolean;
};
