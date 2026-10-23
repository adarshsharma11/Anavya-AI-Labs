"use client";

import { Button } from "@/components/ui/button";
import type { ScanRecord } from "@/types/api";
import type { AiReport, AuditReport, CompetitorAnalysis } from "@/types/audit";
import {
  AiDeepReportSection,
  AuditProgressBanner,
  CategoryCards,
  ChecksTabs,
  CompetitorSection,
  PagesTable,
  RecommendationsList,
  ReportHeader,
} from "./v2-report";

export function AuditView({
  report,
  scan,
  onUnlock,
  unlockPriceLabel,
  unlocking,
  pdfButton,
  isAdmin,
  onRegenerate,
}: {
  report: AuditReport;
  scan?: ScanRecord | null;
  onUnlock?: () => void;
  unlockPriceLabel?: string;
  unlocking?: boolean;
  pdfButton?: React.ReactNode;
  isAdmin?: boolean;
  onRegenerate?: () => void;
}) {
  const locked = Boolean(scan?.locked ?? !scan?.isUnlocked);
  const processing = Boolean(scan?.processing);
  const failed = scan?.status === "report_failed";
  const fullReport = (scan?.fullReport as AiReport | null) ?? null;
  const competitor = scan?.competitorAnalysis as CompetitorAnalysis | null;

  return (
    <div className="space-y-10">
      <ReportHeader
        report={report}
        actions={
          <div className="flex flex-wrap gap-2">
            {pdfButton}
          </div>
        }
      />
      <AuditProgressBanner report={report} />
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Category scores</h3>
        <CategoryCards report={report} />
      </section>
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Top recommendations</h3>
        <RecommendationsList recommendations={report.recommendations} />
      </section>
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Pages</h3>
        <PagesTable report={report} />
      </section>
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Detailed checks</h3>
        <ChecksTabs report={report} />
      </section>
      {competitor ? (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Competitor comparison</h3>
          <CompetitorSection analysis={competitor} />
        </section>
      ) : null}
      {onUnlock ? (
        <AiDeepReportSection
          locked={locked}
          processing={processing}
          failed={Boolean(failed)}
          report={fullReport}
          onUnlock={onUnlock}
          unlockPriceLabel={unlockPriceLabel ?? ""}
          unlocking={unlocking}
          isAdmin={isAdmin}
          onRegenerate={onRegenerate}
        />
      ) : (
        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <a href={`/scanner?url=${encodeURIComponent(report.url)}`}>
              Run the full multi-page audit
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
