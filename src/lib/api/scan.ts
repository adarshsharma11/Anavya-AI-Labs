import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

const scanCreateResponseSchema = z.object({
  success: z.boolean(),
  scanId: z.number(),
});

const stringish = z.union([z.string(), z.number()]).transform((value) => `${value}`);

const scanPreviewSchema = z.object({
  overall: z.number(),
  verdict: z.string(),
  totalIssuesFound: z.number(),
  categories: z.object({
    performance: z.number(),
    seo: z.number(),
    accessibility: z.number(),
    security: z.number(),
  }),
  metrics: z.object({
    loadTime: stringish,
    pageSize: stringish,
    images: z.number(),
    scripts: z.number(),
    links: z.number(),
  }),
  social: z.object({
    ogTags: z.boolean(),
    ogImage: z.boolean().optional().default(false),
    twitterTags: z.boolean(),
  }),
  indexing: z.object({
    robots: z.boolean(),
    sitemap: z.boolean(),
  }),
  improvements: z
    .object({
      potentialScore: z.number(),
      trafficPotential: z.string(),
      fixCount: z.number(),
    })
    .optional(),
  topIssues: z.array(
    z.object({
      title: z.string(),
      severity: z.enum(["High", "Medium", "Low"]),
    })
  ),
  quickWins: z.array(z.string()),
  lockedIssues: z.number(),
  locked: z.boolean(),
  isUnlocked: z.boolean().optional(),
});

const scanDataSchema = z.object({
  id: z.number(),
  url: z.string(),
  preview: scanPreviewSchema,
  competitorPreview: scanPreviewSchema.nullable().optional(),
  competitorAnalysis: z
    .object({
      scoreGap: z.number(),
      summary: z.string(),
      actionItems: z.array(z.string()),
    })
    .nullable()
    .optional(),
  locked: z.boolean().optional(),
  isUnlocked: z.boolean().optional(),
});

const scanDataSchema = z.object({
  id: z.number(),
  url: z.string(),
  preview: scanPreviewSchema,
  competitorPreview: scanPreviewSchema.nullable().optional(),
  competitorAnalysis: z
    .object({
      scoreGap: z.number(),
      summary: z.string(),
      actionItems: z.array(z.string()),
    })
    .nullable()
    .optional(),
  locked: z.boolean(),
});

const scanResultSchema = z.object({
  success: z.boolean(),
  data: scanDataSchema,
});

export type ScanPreview = z.infer<typeof scanPreviewSchema>;
export type ScanResultResponse = z.infer<typeof scanResultSchema>;

function parseScanResultResponse(raw: unknown): ScanResultResponse | null {
  const direct = scanResultSchema.safeParse(raw);
  if (direct.success && direct.data.success) {
    return direct.data;
  }

  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  const rootSuccess = typeof root.success === "boolean" ? root.success : true;
  const candidates = [root.data, root.scan, root.result, root];

  for (const candidate of candidates) {
    const parsedCandidate = scanDataSchema.safeParse(candidate);
    if (parsedCandidate.success) {
      return {
        success: rootSuccess,
        data: parsedCandidate.data,
      };
    }
  }

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
  const data = await apiFetch<unknown>(`/scan/${scanId}`, {
    method: "GET",
  });

  const parsed = parseScanResultResponse(data);
  if (!parsed || !parsed.success) {
    throw new Error("Unable to fetch scan result.");
  }

  return parsed;
}

export async function fetchPublicScanResult(
  scanId: number
): Promise<ScanResultResponse> {
  // Current backend contract serves scan result via /scan/:id.
  // Keep this function name stable for callers that expect a post-payment refresh API.
  return fetchScanResult(scanId);
}
