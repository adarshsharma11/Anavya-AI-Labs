export type CategoryId =
  | "aeo"
  | "geo"
  | "crawlers"
  | "technical"
  | "content"
  | "speed";

export type CheckStatus = "pass" | "partial" | "fail" | "na";

export type RecommendationPriority = "critical" | "important" | "minor";

export type PageType = "homepage" | "article" | "product" | "page";

export type AuditVerdict = "Excellent" | "Good" | "Needs Work" | "Poor";

export type ProgressState = "running" | "done";

export type SpeedProgressState = "running" | "done" | "unavailable";

export type SpeedData = {
  readonly score: number | null;
  readonly lcp?: number | null;
  readonly inp?: number | null;
  readonly cls?: number | null;
  readonly ttfb?: number | null;
};

export type CheckResult = {
  readonly id: string;
  readonly category: CategoryId;
  readonly label: string;
  readonly status: CheckStatus;
  readonly points: number;
  readonly maxPoints: number;
  readonly evidence: string;
  readonly why: string;
  readonly fix: string | null;
};

export type Recommendation = {
  readonly id: string;
  readonly category: CategoryId;
  readonly label: string;
  readonly priority: RecommendationPriority;
  readonly gain: number;
  readonly evidence: string;
  readonly fix: string;
  readonly why: string;
  readonly affectedPages: readonly string[];
};

export type PageAuditStats = {
  readonly wordCount: number;
  readonly sizeKB: number;
  readonly internalLinks: number;
  readonly externalLinks: number;
  readonly images: number;
  readonly schemaTypes: readonly string[];
};

export type PageAudit = {
  readonly url: string;
  readonly title: string;
  readonly pageType: PageType;
  readonly isHomepage: boolean;
  readonly overall: number;
  readonly categories: Readonly<Record<CategoryId, number | null>>;
  readonly checks: readonly CheckResult[];
  readonly speed: SpeedData | null;
  readonly stats: PageAuditStats;
};

export type AuditProgress = {
  readonly pages: ProgressState;
  readonly speed: SpeedProgressState;
};

export type CrawlerAccess = {
  readonly allowed: number;
  readonly total: number;
};

export type AuditReport = {
  readonly version: 2;
  readonly url: string;
  readonly origin: string;
  readonly generatedAt: string;
  readonly complete: boolean;
  readonly progress: AuditProgress;
  readonly overall: number;
  readonly verdict: AuditVerdict;
  readonly summary: string;
  readonly totalIssuesFound: number;
  readonly categories: Readonly<Record<CategoryId, number | null>>;
  readonly crawlerAccess: CrawlerAccess;
  readonly structuredDataTypes: readonly string[];
  readonly siteChecks: readonly CheckResult[];
  readonly pages: readonly PageAudit[];
  readonly recommendations: readonly Recommendation[];
};

export type CompetitorCategoryGap = {
  readonly category: CategoryId | string;
  readonly label: string;
  readonly yours: number | null;
  readonly competitor: number | null;
  readonly gap: number | null;
};

export type CompetitorAnalysis = {
  readonly scoreGap: number;
  readonly summary: string;
  readonly categoryGaps: readonly CompetitorCategoryGap[];
  readonly actionItems: readonly string[];
};

export type AiReport = {
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

export const CATEGORY_LABELS: Readonly<Record<CategoryId, string>> = {
  aeo: "AEO",
  geo: "GEO",
  crawlers: "AI Crawlers",
  technical: "Technical",
  content: "Content",
  speed: "Page Speed",
};

export const CATEGORY_ORDER: readonly CategoryId[] = [
  "aeo",
  "geo",
  "crawlers",
  "technical",
  "content",
  "speed",
];

export function isAuditReport(value: unknown): value is AuditReport {
  if (!value || typeof value !== "object") return false;
  return (value as { version?: unknown }).version === 2;
}
