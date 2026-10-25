import type { ScanRecord } from "@/types/api";
import { isAuditReport } from "@/types/audit";

function isFailedStatus(scan: ScanRecord) {
  return scan.status === "report_failed";
}

function isPrimaryAuditSettled(scan: ScanRecord) {
  if (scan.auditComplete) return true;
  if (scan.status === "completed" || isFailedStatus(scan)) return true;
  return false;
}

export function isCompetitorSideSettled(scan: ScanRecord) {
  if (!scan.competitorUrl) return true;
  if (scan.competitorStatus === "running" || scan.competitorStatus === "pending") {
    return false;
  }
  if (scan.competitorStatus === "completed" || scan.competitorStatus === "failed") {
    return true;
  }
  if (scan.status === "completed" || isFailedStatus(scan)) return true;

  const preview = scan.competitorPreview;
  if (preview && isAuditReport(preview) && !preview.complete) {
    return false;
  }

  return isPrimaryAuditSettled(scan);
}

export function shouldStopScanPolling(scan: ScanRecord | null | undefined) {
  if (!scan) return false;
  if (!isPrimaryAuditSettled(scan)) return false;
  if (!isCompetitorSideSettled(scan)) return false;
  if (scan.processing && !scan.fullReport && !isFailedStatus(scan)) {
    return false;
  }
  return true;
}
