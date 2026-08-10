import { z } from "zod";
import { API_PREFIX, apiFetch } from "@/lib/api/client";

const scanCreateResponseSchema = z.object({
  success: z.boolean(),
  scanId: z.number(),
});

const stringish = z.union([z.string(), z.number()]).transform((value) => `${value}`);
const numberish = z.preprocess((value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}, z.number());

const booleanish = z
  .union([z.boolean(), z.number(), z.string()])
  .transform((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "present", "detected", "found"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "missing", "absent", "not_found"].includes(normalized)) {
      return false;
    }
    return false;
  });

const indexingSchema = z.preprocess(
  (value) => {
    if (!value || typeof value !== "object") return value;
    const raw = value as Record<string, unknown>;
    return {
      ...raw,
      robots:
        raw.robots ??
        raw.robotsTxt ??
        raw.robotTxt ??
        raw.hasRobots ??
        raw.robotsFound,
      sitemap:
        raw.sitemap ??
        raw.sitemapXml ??
        raw.sitemapIndex ??
        raw.hasSitemap ??
        raw.sitemapFound,
    };
  },
  z
    .object({
      robots: booleanish.optional().default(false),
      sitemap: booleanish.optional().default(false),
    })
    .passthrough()
);

const scanPreviewSchema = z
  .preprocess((value) => {
    if (!value || typeof value !== "object") return value;
    const raw = value as Record<string, unknown>;
    const existingIndexing = raw.indexing;

    if (existingIndexing && typeof existingIndexing === "object") {
      return value;
    }

    const robotsCandidate =
      raw.robots ??
      raw.robotsTxt ??
      raw.robotTxt ??
      raw.hasRobots ??
      raw.robotsFound;
    const sitemapCandidate =
      raw.sitemap ??
      raw.sitemapXml ??
      raw.sitemapIndex ??
      raw.hasSitemap ??
      raw.sitemapFound;

    if (robotsCandidate === undefined && sitemapCandidate === undefined) {
      return value;
    }

    return {
      ...raw,
      indexing: {
        robots: robotsCandidate,
        sitemap: sitemapCandidate,
      },
    };
  }, z.object({
    overall: z.number(),
    verdict: z.string(),
    totalIssuesFound: z.number().optional().default(0),
    categories: z.object({
      performance: z.number(),
      seo: z.number(),
      accessibility: z.number(),
      security: z.number(),
    }).passthrough(),
    metrics: z.object({
      loadTime: stringish,
      pageSize: stringish,
      images: z.number(),
      scripts: z.number(),
      links: z.number(),
      titleChars: numberish.optional(),
      metaDescriptionChars: numberish.optional(),
      metaDescriptionWords: numberish.optional(),
    }).passthrough().optional().nullable(),
    social: z.object({
      ogTags: booleanish,
      ogImage: booleanish.optional().default(false),
      twitterTags: booleanish,
      facebookAdmins: booleanish.optional().default(false),
      facebookAppId: booleanish.optional().default(false),
    }).passthrough().optional().nullable(),
    seoMeta: z
      .object({
        canonical: booleanish.optional().default(false),
        metaRobots: z.string().optional(),
        favicon: booleanish.optional().default(false),
      })
      .passthrough()
      .optional()
      .nullable(),
    indexing: indexingSchema.optional().nullable(),
    improvements: z
      .object({
        potentialScore: z.number(),
        trafficPotential: z.string(),
        fixCount: z.number(),
      })
      .passthrough()
      .optional(),
    topIssues: z.array(
      z.object({
        title: z.string(),
        severity: z.string(),
      }).passthrough()
    ).optional().default([]),
    quickWins: z.array(z.string()).optional().default([]),
    lockedIssues: z.number().optional().default(0),
    locked: z.boolean().optional().default(true),
    isUnlocked: z.boolean().optional().default(false),
  }).passthrough());

const codeSnippetSchema = z.object({
  html: z.string().optional(),
  css: z.string().optional(),
  js: z.string().optional(),
}).passthrough();

const reportIssueSchema = z.object({
  title: z.string(),
  severity: z.string(),
  suggestion: z.string().optional(),
  codeSnippet: codeSnippetSchema.optional(),
}).passthrough();

const scanReportSchema = z
  .object({
    issues: z.array(reportIssueSchema).optional().default([]),
    suggestions: z.array(z.string()).optional().default([]),
    summary: z.string().optional(),
    executiveSummary: z.string().optional(),
    technicalAnalysis: z.string().optional(),
    seoImprovements: z.array(z.string()).optional(),
    performanceImprovements: z.array(z.string()).optional(),
    businessGrowthSuggestions: z.array(z.string()).optional(),
    competitorStrategy: z.string().nullable().optional(),
    estimatedTrafficImpact: z.string().optional(),
  })
  .passthrough();

const scanDataSchema = z.preprocess(
  (value) => {
    if (!value || typeof value !== "object") return value;
    const raw = value as Record<string, unknown>;

    const competitor =
      raw.competitor && typeof raw.competitor === "object"
        ? (raw.competitor as Record<string, unknown>)
        : null;

    return {
      ...raw,
      competitorPreview:
        raw.competitorPreview ??
        raw.competitor_preview ??
        competitor?.preview ??
        competitor?.competitorPreview ??
        competitor?.competitor_preview,
      competitorAnalysis:
        raw.competitorAnalysis ??
        raw.competitor_analysis ??
        competitor?.analysis ??
        competitor?.competitorAnalysis ??
        competitor?.competitor_analysis,
    };
  },
  z.object({
    id: z.number(),
    url: z.string(),
    preview: scanPreviewSchema,
    fullReport: scanReportSchema.optional().nullable(),
    aiReport: scanReportSchema.optional().nullable(),
    report: scanReportSchema.optional().nullable(),
    competitorPreview: scanPreviewSchema.nullable().optional(),
    competitorAnalysis: z
      .object({
        scoreGap: z.number(),
        summary: z.string(),
        actionItems: z.array(z.string()),
      })
      .nullable()
      .optional(),
    locked: z.boolean().optional().default(false),
  })
);

const scanResultSchema = z.object({
  success: z.boolean(),
  data: scanDataSchema,
}).passthrough();

export type ScanPreview = z.infer<typeof scanPreviewSchema>;
export type ScanResultResponse = z.infer<typeof scanResultSchema>;
export type ScanReport = z.infer<typeof scanReportSchema>;

function parseScanResultResponse(raw: unknown): ScanResultResponse | null {
  const direct = scanResultSchema.safeParse(raw);
  if (direct.success && direct.data.success) {
    return direct.data as ScanResultResponse;
  }

  if (!raw || typeof raw !== "object") {
    console.error("❌ Invalid scan response: raw data is not an object", raw);
    return null;
  }

  const root = raw as Record<string, unknown>;
  if (Object.keys(root).length === 0) {
    console.warn("⚠️ Empty scan response object received. Check API base URL and backend route.");
    return null;
  }
  const rootSuccess = typeof root.success === "boolean" ? root.success : true;
  const candidates = [root.data, root.scan, root.result, root];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const parsedCandidate = scanDataSchema.safeParse(candidate);
    if (parsedCandidate.success) {
      return {
        success: rootSuccess,
        data: parsedCandidate.data as any,
      };
    }
  }

  console.warn("⚠️ All parsing candidates failed for scan response shape:", raw);
  return null;
}

export async function createScanRequest(
  url: string,
  competitorUrl?: string
): Promise<{ scanId: number }> {
  const data = await apiFetch<unknown>("/scan/create", {
    method: "POST",
    body: JSON.stringify({
      url,
      ...(competitorUrl ? { competitorUrl } : {}),
    }),
  });

  const parsed = scanCreateResponseSchema.safeParse(data);
  if (!parsed.success || !parsed.data.success) {
    throw new Error("Unable to start scan.");
  }

  return { scanId: parsed.data.scanId };
}

export async function fetchScanResult(scanId: number): Promise<ScanResultResponse> {
  const base = API_PREFIX.toLowerCase();
  const hasApiV1 = base.endsWith("/api/v1") || base.includes("/api/v1/");
  const candidatePaths = [
    `/scan/${scanId}`,
    ...(hasApiV1 ? [] : [`/api/v1/scan/${scanId}`]),
  ];

  for (const path of candidatePaths) {
    const data = await apiFetch<unknown>(path, {
      method: "GET",
      // Shared scan links should not trigger global auth redirects.
      skipAuthInterceptor: true,
    });

    const parsed = parseScanResultResponse(data);
    if (parsed && parsed.success) {
      return parsed;
    }
  }

  const baseHint = API_PREFIX
    ? `API base is "${API_PREFIX}".`
    : "API base is not set (NEXT_PUBLIC_API_BASE_URL).";
  throw new Error(
    `Unable to fetch scan result. ${baseHint} Expected backend route like ".../api/v1/scan/${scanId}".`
  );
}

export async function fetchPublicScanResult(
  scanId: number
): Promise<ScanResultResponse> {
  // Current backend contract serves scan result via /scan/:id.
  // Keep this function name stable for callers that expect a post-payment refresh API.
  return fetchScanResult(scanId);
}

export interface GeoCheckResponse {
  url: string;
  score: {
    value: number;
    max: number;
  };
  categories: {
    crawlability: number;
    schema: number;
    content: number;
    metadata: number;
    authority: number;
    technical: number;
  };
  checks: {
    robotsAllowed: boolean;
    llmsTxt: boolean;
    sitemap: boolean;
    schema: boolean;
    faqSchema: boolean;
    metaDescription: boolean;
    canonical: boolean;
    author: boolean;
    publishedDate: boolean;
    openGraph: boolean;
    twitterCards: boolean;
    readability: boolean;
    technical: boolean;
  };
  recommendations: Array<{
    title: string;
    severity: "high" | "medium" | "low";
    description: string;
  }>;
}

export async function runGeoScanRequest(url: string): Promise<GeoCheckResponse> {
  // Try candidate paths to be robust
  const base = API_PREFIX.toLowerCase();
  const hasApiV1 = base.endsWith("/api/v1") || base.includes("/api/v1/");
  const candidatePaths = [
    "/geo/check",
    ...(hasApiV1 ? [] : ["/api/v1/geo/check", "/api/geo/check"]),
  ];

  let lastError: Error | null = null;

  for (const path of candidatePaths) {
    try {
      const data = await apiFetch<GeoCheckResponse>(path, {
        method: "POST",
        body: JSON.stringify({ url }),
        skipAuthInterceptor: true,
      });
      if (data && data.score) {
        return data;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to execute GEO analysis.");
}
