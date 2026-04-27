import { REPORT_UNLOCK_STORAGE_KEY } from "./scanner-constants";
import type { ScanReport } from "@/lib/api/scan";

export function normalizeUrl(value: string) {
  const trimmed = value
    .trim()
    .replace(/^`+|`+$/g, "")
    .replace(/^["']+|["']+$/g, "")
    .trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function formatDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

export function getComparableSiteKey(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .toLowerCase();
  }
}

export function readReportUnlockState() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("success") === "1" || params.get("unlock") === "1") {
    window.localStorage.setItem(REPORT_UNLOCK_STORAGE_KEY, "true");
    return true;
  }
  return window.localStorage.getItem(REPORT_UNLOCK_STORAGE_KEY) === "true";
}

export function clearReportUnlock() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REPORT_UNLOCK_STORAGE_KEY);
}

export function setReportUnlock() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REPORT_UNLOCK_STORAGE_KEY, "true");
}

export function hasReportContent(report: ScanReport | null | undefined) {
  if (!report) return false;
  return Boolean(
    report.summary ||
      report.executiveSummary ||
      report.technicalAnalysis ||
      report.estimatedTrafficImpact ||
      (report.issues?.length ?? 0) > 0 ||
      (report.suggestions?.length ?? 0) > 0 ||
      (report.seoImprovements?.length ?? 0) > 0 ||
      (report.performanceImprovements?.length ?? 0) > 0 ||
      (report.businessGrowthSuggestions?.length ?? 0) > 0
  );
}
