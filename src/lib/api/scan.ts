import { apiFetch, apiFetchBlob, ApiError } from "@/lib/api/client";
import type {
  CreateScanResponse,
  LegacyScanPreview,
  LegacyScanReport,
  ScanRecord,
} from "@/types/api";
import type { AuditReport } from "@/types/audit";
import { isAuditReport } from "@/types/audit";

export type { LegacyScanPreview as ScanPreview, LegacyScanReport as ScanReport };

/** @deprecated GEO checker now returns AuditReport. Kept for leftover v1 GEO UI. */
export type GeoCheckResponse = {
  url: string;
  score: { value: number; max: number };
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
};
export type ScanResultResponse = {
  readonly success: boolean;
  readonly data: ScanRecord;
};

export type CreateScanInput = {
  readonly url: string;
  readonly competitorUrl?: string;
  readonly email?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function normalizeScanRecord(raw: unknown): ScanRecord {
  const root = asRecord(raw);
  const payload = asRecord(root?.data) ?? root;
  if (!payload) {
    throw new ApiError(500, "Invalid scan response.");
  }

  const publicId = String(payload.publicId ?? payload.scanId ?? payload.id ?? "");
  const preview = (payload.preview ?? null) as ScanRecord["preview"];
  const reportVersion = payload.reportVersion === 1 ? 1 : 2;
  const status = (payload.status as ScanRecord["status"]) ?? "processing";

  return {
    id: Number(payload.id) || 0,
    publicId,
    url: String(payload.url ?? ""),
    competitorUrl:
      typeof payload.competitorUrl === "string" ? payload.competitorUrl : null,
    status,
    reportVersion,
    auditComplete: Boolean(
      payload.auditComplete ??
        (status !== "processing" && preview != null)
    ),
    preview,
    competitorPreview:
      (payload.competitorPreview as ScanRecord["competitorPreview"]) ?? null,
    competitorAnalysis:
      (payload.competitorAnalysis as ScanRecord["competitorAnalysis"]) ?? null,
    fullReport: (payload.fullReport as ScanRecord["fullReport"]) ??
      (payload.aiReport as ScanRecord["fullReport"]) ??
      (payload.report as ScanRecord["fullReport"]) ??
      null,
    isUnlocked: Boolean(payload.isUnlocked),
    locked: Boolean(payload.locked ?? !payload.isUnlocked),
    processing: Boolean(
      payload.processing ??
        (status === "generating_full_report" || status === "paid")
    ),
    createdAt: String(payload.createdAt ?? ""),
  };
}

export async function createScanRequest(
  input: CreateScanInput | string,
  competitorUrl?: string
): Promise<CreateScanResponse> {
  const body =
    typeof input === "string"
      ? { url: input, ...(competitorUrl ? { competitorUrl } : {}) }
      : {
          url: input.url,
          ...(input.competitorUrl ? { competitorUrl: input.competitorUrl } : {}),
          ...(input.email ? { email: input.email } : {}),
        };

  const data = await apiFetch<CreateScanResponse>("/scan/create", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuthInterceptor: true,
  });

  const publicId = String(data.publicId ?? data.scanId);
  return {
    success: data.success,
    scanId: publicId,
    publicId,
    unlocked: Boolean(data.unlocked),
    cached: Boolean(data.cached),
  };
}

export async function fetchScanResult(publicId: string): Promise<ScanRecord> {
  const data = await apiFetch<unknown>(`/scan/${publicId}`, {
    method: "GET",
    skipAuthInterceptor: true,
  });
  return normalizeScanRecord(data);
}

export async function fetchPublicScanResult(
  publicId: string
): Promise<ScanResultResponse> {
  const record = await fetchScanResult(publicId);
  return { success: true, data: record };
}

export async function downloadScanPdf(publicId: string): Promise<Blob> {
  return apiFetchBlob(`/scan/${publicId}/pdf`, {
    skipAuthInterceptor: true,
  });
}

export async function runGeoScanRequest(
  url: string,
  email?: string
): Promise<AuditReport> {
  const data = await apiFetch<{ success: boolean; data: AuditReport }>(
    "/geo/check",
    {
      method: "POST",
      body: JSON.stringify({ url, ...(email ? { email } : {}) }),
      skipAuthInterceptor: true,
    }
  );

  const report = data.data;
  if (!isAuditReport(report)) {
    throw new ApiError(500, "Invalid GEO audit response.");
  }
  return report;
}

export function getAuditPreview(scan: ScanRecord | null): AuditReport | null {
  if (!scan?.preview) return null;
  return isAuditReport(scan.preview) ? scan.preview : null;
}

export function getLegacyPreview(scan: ScanRecord | null): LegacyScanPreview | null {
  if (!scan?.preview) return null;
  return isAuditReport(scan.preview) ? null : scan.preview;
}
