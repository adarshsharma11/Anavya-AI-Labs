import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isCompetitorSideSettled, shouldStopScanPolling } from "./polling";
import type { ScanRecord } from "@/types/api";
import type { AuditReport } from "@/types/audit";

function audit(overrides: Partial<AuditReport> = {}): AuditReport {
  return {
    version: 2,
    url: "https://anavyaailabs.com/",
    origin: "https://anavyaailabs.com",
    generatedAt: "2026-10-25T12:08:44.350Z",
    complete: false,
    progress: { pages: "done", speed: "running" },
    overall: 75,
    verdict: "Good",
    summary: "Partial audit",
    totalIssuesFound: 19,
    categories: {
      aeo: 42,
      geo: 67,
      crawlers: 100,
      technical: 91,
      content: 77,
      speed: 87,
    },
    crawlerAccess: { allowed: 10, total: 10 },
    structuredDataTypes: [],
    siteChecks: [],
    pages: [],
    recommendations: [],
    ...overrides,
  };
}

function scan(overrides: Partial<ScanRecord> = {}): ScanRecord {
  return {
    id: 35,
    publicId: "8ee6668d-4fd5-49c6-b60a-58d7cca85db8",
    url: "https://anavyaailabs.com/",
    competitorUrl: "https://codetribesolutions.com/",
    status: "processing",
    reportVersion: 2,
    auditComplete: false,
    preview: audit(),
    competitorPreview: audit({
      url: "https://codetribesolutions.com/",
      origin: "https://codetribesolutions.com",
      overall: 37,
      verdict: "Poor",
      progress: { pages: "running", speed: "unavailable" },
    }),
    competitorStatus: "running",
    competitorAnalysis: {
      scoreGap: -44,
      summary: "You are ahead of this competitor",
      categoryGaps: [],
      actionItems: [],
    },
    fullReport: null,
    isUnlocked: false,
    locked: true,
    processing: false,
    createdAt: "2026-10-25T12:08:43.246Z",
    ...overrides,
  };
}

describe("shouldStopScanPolling", () => {
  it("keeps polling progressive competitor payloads that still have running work", () => {
    const inFlight = scan();
    assert.equal(shouldStopScanPolling(inFlight), false);
    assert.equal(isCompetitorSideSettled(inFlight), false);
  });

  it("keeps polling after the primary audit finishes while the competitor is running", () => {
    assert.equal(
      shouldStopScanPolling(
        scan({
          auditComplete: true,
          preview: audit({ complete: true, progress: { pages: "done", speed: "done" } }),
        })
      ),
      false
    );
  });

  it("stops when both sides are complete and no full report is pending", () => {
    assert.equal(
      shouldStopScanPolling(
        scan({
          status: "preview_done",
          auditComplete: true,
          competitorStatus: "completed",
          preview: audit({ complete: true, progress: { pages: "done", speed: "done" } }),
          competitorPreview: audit({
            complete: true,
            progress: { pages: "done", speed: "done" },
          }),
        })
      ),
      true
    );
  });

  it("keeps polling an unlocked scan that is still writing the full report", () => {
    assert.equal(
      shouldStopScanPolling(
        scan({
          status: "generating_full_report",
          auditComplete: true,
          competitorStatus: "completed",
          processing: true,
          isUnlocked: true,
          locked: false,
        })
      ),
      false
    );
  });

  it("stops a website scan once the primary audit is complete", () => {
    assert.equal(
      shouldStopScanPolling(
        scan({
          competitorUrl: null,
          competitorPreview: null,
          competitorStatus: null,
          competitorAnalysis: null,
          auditComplete: true,
          status: "preview_done",
        })
      ),
      true
    );
  });

  it("does not treat a successful progressive payload as complete just because previews exist", () => {
    assert.equal(
      shouldStopScanPolling(
        scan({
          competitorStatus: null,
          competitorPreview: audit({ complete: false }),
          auditComplete: true,
        })
      ),
      false
    );
  });

  it("stops a v1 competitor scan once the primary audit and preview are present", () => {
    assert.equal(
      shouldStopScanPolling(
        scan({
          reportVersion: 1,
          auditComplete: true,
          status: "preview_done",
          competitorStatus: null,
          preview: {
            overall: 70,
            verdict: "Good",
            categories: {
              performance: 70,
              seo: 68,
              accessibility: 80,
              security: 90,
            },
          },
          competitorPreview: {
            overall: 55,
            verdict: "Needs Work",
            categories: {
              performance: 50,
              seo: 52,
              accessibility: 70,
              security: 80,
            },
          },
        })
      ),
      true
    );
  });
});
