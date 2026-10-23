"use client";

import { useMemo } from "react";

import type { ScanRecord } from "@/types/api";
import { getLegacyPreview, type ScanReport } from "@/lib/api/scan";
import { hasReportContent } from "./scanner-utils";
import { AiSuggestions } from "./scanner-shared-components";
import {
  FullReportSection,
  IssuesList,
  MetricsCard,
  ResultsHeader,
  ScoreOverview,
} from "./scanner-website-components";
import type { Issue } from "./scanner-types";

export function V1ReportView({
  scan,
  onReset,
  onDownload,
  onUnlock,
  unlockPriceLabel,
  unlocking,
  unlockingLabel,
  downloading,
}: {
  scan: ScanRecord;
  onReset: () => void;
  onDownload: () => void;
  onUnlock: () => void;
  unlockPriceLabel: string;
  unlocking: boolean;
  unlockingLabel: string;
  downloading: boolean;
}) {
  const preview = getLegacyPreview(scan);
  const fullReport = scan.fullReport as ScanReport | null;
  const locked = scan.locked && !scan.isUnlocked;
  const hasFullReportContent = hasReportContent(fullReport);

  const previewIssues = useMemo<Issue[]>(() => {
    if (!preview) return [];
    if (!locked && fullReport?.issues) {
      return fullReport.issues.map((issue, index) => ({
        id: `full-issue-${index}`,
        title: issue.title,
        severity: issue.severity || "Medium",
        suggestion: issue.suggestion,
        codeSnippet: issue.codeSnippet,
      }));
    }
    return (preview.topIssues ?? []).map((issue, index) => ({
      id: `preview-issue-${index}`,
      title: issue.title,
      severity: issue.severity,
    }));
  }, [fullReport, locked, preview]);

  if (!preview) return null;

  return (
    <div className="space-y-10">
      <ResultsHeader
        url={scan.url}
        overall={preview.overall}
        verdict={preview.verdict}
        totalIssues={preview.totalIssuesFound ?? 0}
        onReset={onReset}
        unlocked={!locked}
        onDownload={onDownload}
        onUnlock={onUnlock}
        unlockPriceLabel={unlockPriceLabel}
        unlocking={unlocking}
        unlockingLabel={unlockingLabel}
        downloading={downloading}
      />
      {!locked ? (
        <FullReportSection report={fullReport} pending={!hasFullReportContent} />
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <ScoreOverview
          overall={preview.overall}
          categories={preview.categories}
          indexing={preview.indexing}
          social={preview.social}
        />
        <MetricsCard
          metrics={preview.metrics}
          improvements={preview.improvements}
          seoMeta={preview.seoMeta}
        />
      </div>
      <IssuesList
        issues={previewIssues}
        totalIssues={preview.totalIssuesFound ?? 0}
        locked={locked}
        lockedCount={preview.lockedIssues ?? 0}
        onUnlock={onUnlock}
        unlockPriceLabel={unlockPriceLabel}
        unlocking={unlocking}
        unlockingLabel={unlockingLabel}
      />
      <AiSuggestions
        title="AI suggestions"
        suggestions={
          locked ? [] : fullReport?.suggestions?.length
            ? [...fullReport.suggestions]
            : [...(preview.quickWins ?? [])]
        }
        locked={locked}
        onUnlock={onUnlock}
        unlockPriceLabel={unlockPriceLabel}
        unlocking={unlocking}
        unlockingLabel={unlockingLabel}
        description="Paid report includes actionable AI recommendations."
      />
    </div>
  );
}
