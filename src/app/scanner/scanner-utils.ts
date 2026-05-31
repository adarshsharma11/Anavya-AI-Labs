import { REPORT_UNLOCK_STORAGE_KEY } from "./scanner-constants";
import type { ScanReport } from "@/lib/api/scan";

const REPORT_UNLOCK_EMAIL_STORAGE_KEY = "report_unlock_email";

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

export function getValidScanUrl(value: string) {
  const normalized = normalizeUrl(value);
  if (!normalized) {
    return { valid: false as const, normalized: "", error: "Please enter a website URL." };
  }

  // Prevent plain search-style phrases like "this too" or "seo audit tool".
  if (/\s/.test(value.trim())) {
    return {
      valid: false as const,
      normalized: "",
      error: "Enter a valid website URL like example.com or https://example.com.",
    };
  }

  try {
    const parsed = new URL(normalized);
    const protocol = parsed.protocol.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();

    if (protocol !== "http:" && protocol !== "https:") {
      return {
        valid: false as const,
        normalized: "",
        error: "Only http and https website URLs are supported.",
      };
    }

    const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    const isDomainLike =
      hostname.includes(".") &&
      !hostname.startsWith(".") &&
      !hostname.endsWith(".") &&
      /^[a-z0-9.-]+$/.test(hostname);

    if (!isDomainLike && !isIpv4) {
      return {
        valid: false as const,
        normalized: "",
        error: "Enter a valid public website domain like example.com.",
      };
    }

    return { valid: true as const, normalized: parsed.toString() };
  } catch {
    return {
      valid: false as const,
      normalized: "",
      error: "Enter a valid website URL like example.com or https://example.com.",
    };
  }
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

export function readReportUnlockEmail() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(REPORT_UNLOCK_EMAIL_STORAGE_KEY) ?? "";
}

export function setReportUnlockEmail(email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REPORT_UNLOCK_EMAIL_STORAGE_KEY, email.trim());
}

export function hasReportUnlockEmail() {
  return Boolean(readReportUnlockEmail());
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
