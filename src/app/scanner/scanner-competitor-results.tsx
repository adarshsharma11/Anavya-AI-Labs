"use client";

import { motion } from "framer-motion";
import { Crown, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditView } from "@/components/report/audit-view";
import { ShareReportButton } from "@/components/report/share-report-button";
import { CompetitorSection } from "@/components/report/v2-report";
import type { ScanRecord } from "@/types/api";
import type { AuditReport } from "@/types/audit";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/types/audit";
import { FullReportSection } from "./scanner-website-components";
import {
  AiSuggestions,
  CompetitorAnalysisCard,
  QuickWinsCard,
} from "./scanner-shared-components";
import {
  ComparisonCard,
  CompetitorLoader,
  CompetitorScoreCard,
} from "./scanner-competitor-cards";
import type { LegacyScanPreview } from "@/types/api";

export function CompetitorV2Results({
  scan,
  primary,
  competitor,
  primaryLabel,
  competitorLabel,
  stillUpdating,
  locked,
  onUnlock,
  unlockPriceLabel,
  unlocking,
  unlockingLabel,
  onDownload,
  isDownloading,
}: {
  scan: ScanRecord;
  primary: AuditReport;
  competitor: AuditReport | null;
  primaryLabel: string;
  competitorLabel: string;
  stillUpdating: boolean;
  locked: boolean;
  onUnlock: () => void;
  unlockPriceLabel: string;
  unlocking: boolean;
  unlockingLabel: string;
  onDownload: () => void;
  isDownloading: boolean;
}) {
  const winner =
    competitor && competitor.overall > primary.overall ? "competitor" : "primary";
  const scanForAudit = { ...scan, competitorAnalysis: null };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Comparison report
            </div>
            <h4 className="mt-2 text-xl font-semibold">
              {primaryLabel} vs {competitorLabel}
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Live AI benchmark. Scores update as each site finishes its pages
              and speed checks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {stillUpdating ? (
              <Badge variant="secondary">Updating comparison…</Badge>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <Crown className="h-4 w-4" />
                {winner === "primary" ? primaryLabel : competitorLabel} leads
              </div>
            )}
            <ShareReportButton
              publicId={scan.publicId}
              path="/competitor-scanner"
              description="Anyone with this URL can open this comparison."
            />
            <Button
              variant="outline"
              onClick={onDownload}
              disabled={isDownloading}
              aria-busy={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </Card>

      {competitor ? (
        <ComparisonCard
          title="Category comparison"
          primaryLabel={primaryLabel}
          competitorLabel={competitorLabel}
          rows={CATEGORY_ORDER.map((category) => ({
            label: CATEGORY_LABELS[category],
            primary: primary.categories[category],
            competitor: competitor.categories[category],
          }))}
        />
      ) : (
        <CompetitorLoader activeStep="Competitor pages are still being analysed…" />
      )}

      {scan.competitorAnalysis ? (
        <CompetitorSection analysis={scan.competitorAnalysis} />
      ) : null}

      <Tabs defaultValue="yours" className="space-y-4">
        <TabsList>
          <TabsTrigger value="yours">Your site</TabsTrigger>
          <TabsTrigger value="competitor" disabled={!competitor}>
            Competitor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="yours">
          <AuditView
            report={primary}
            scan={scanForAudit}
            onUnlock={onUnlock}
            unlockPriceLabel={unlockPriceLabel}
            unlocking={unlocking}
          />
        </TabsContent>
        {competitor ? (
          <TabsContent value="competitor">
            <AuditView
              report={competitor}
              scan={scanForAudit}
              onUnlock={onUnlock}
              unlockPriceLabel={unlockPriceLabel}
              unlocking={unlocking}
            />
          </TabsContent>
        ) : null}
      </Tabs>
    </motion.div>
  );
}

export function CompetitorLegacyResults({
  reportData,
  preview,
  competitorPreview,
  primaryLabel,
  competitorLabel,
  locked,
  onUnlock,
  unlockPriceLabel,
  unlocking,
  unlockingLabel,
  onDownload,
  isDownloading,
  hasFullReportContent,
}: {
  reportData: ScanRecord;
  preview: LegacyScanPreview;
  competitorPreview: LegacyScanPreview;
  primaryLabel: string;
  competitorLabel: string;
  locked: boolean;
  onUnlock: () => void;
  unlockPriceLabel: string;
  unlocking: boolean;
  unlockingLabel: string;
  onDownload: () => void;
  isDownloading: boolean;
  hasFullReportContent: boolean;
}) {
  const winner = preview.overall >= competitorPreview.overall ? "primary" : "competitor";
  const competitorAnalysis = reportData.competitorAnalysis;
  const fullReport = reportData.fullReport;
  const aiSuggestions = competitorAnalysis?.actionItems ?? [];
  const otherSuggestions = Array.from(
    new Set([...(preview.quickWins ?? []), ...(competitorPreview.quickWins ?? [])])
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Comparison report
            </div>
            <h4 className="mt-2 text-xl font-semibold">
              {primaryLabel} vs {competitorLabel}
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              AI benchmark report highlighting performance, SEO, and growth gaps.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Crown className="h-4 w-4" />
              {winner === "primary" ? primaryLabel : competitorLabel} leads
            </div>
            <ShareReportButton
              publicId={reportData.publicId}
              path="/competitor-scanner"
              description="Anyone with this URL can open this comparison."
            />
            <Button
              variant="outline"
              onClick={onDownload}
              disabled={isDownloading}
              aria-busy={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </Card>

      {!locked ? (
        <FullReportSection report={fullReport} pending={!hasFullReportContent} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <CompetitorScoreCard
          title="Your site"
          highlight={winner === "primary"}
          preview={preview}
          locked={locked}
          onUnlock={onUnlock}
          unlockPriceLabel={unlockPriceLabel}
          unlocking={unlocking}
          unlockingLabel={unlockingLabel}
        />
        <CompetitorScoreCard
          title="Competitor"
          highlight={winner === "competitor"}
          preview={competitorPreview}
          locked={locked}
          onUnlock={onUnlock}
          unlockPriceLabel={unlockPriceLabel}
          unlocking={unlocking}
          unlockingLabel={unlockingLabel}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickWinsCard
          title="Your quick wins"
          wins={preview.quickWins ?? []}
          locked={locked}
          onUnlock={onUnlock}
          unlockPriceLabel={unlockPriceLabel}
          unlocking={unlocking}
          unlockingLabel={unlockingLabel}
        />
        <QuickWinsCard
          title="Competitor quick wins"
          wins={competitorPreview.quickWins ?? []}
          locked={locked}
          onUnlock={onUnlock}
          unlockPriceLabel={unlockPriceLabel}
          unlocking={unlocking}
          unlockingLabel={unlockingLabel}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ComparisonCard
          title="Category comparison"
          primaryLabel={primaryLabel}
          competitorLabel={competitorLabel}
          rows={[
            {
              label: "Performance",
              primary: preview.categories.performance,
              competitor: competitorPreview.categories.performance,
            },
            {
              label: "SEO",
              primary: preview.categories.seo,
              competitor: competitorPreview.categories.seo,
            },
            {
              label: "Accessibility",
              primary: preview.categories.accessibility,
              competitor: competitorPreview.categories.accessibility,
            },
            {
              label: "Security",
              primary: preview.categories.security,
              competitor: competitorPreview.categories.security,
            },
          ]}
        />
        <CompetitorAnalysisCard
          scoreGap={competitorAnalysis?.scoreGap ?? 0}
          summary={competitorAnalysis?.summary ?? ""}
          actionItems={competitorAnalysis?.actionItems ?? []}
          locked={locked}
          onUnlock={onUnlock}
          unlockPriceLabel={unlockPriceLabel}
          unlocking={unlocking}
          unlockingLabel={unlockingLabel}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AiSuggestions
          title="AI suggestions"
          suggestions={aiSuggestions}
          locked={locked}
          onUnlock={onUnlock}
          unlockPriceLabel={unlockPriceLabel}
          unlocking={unlocking}
          unlockingLabel={unlockingLabel}
          description="AI-generated opportunities from your competitor comparison report."
        />
        <AiSuggestions
          title="Other suggestions"
          suggestions={otherSuggestions}
          locked={locked}
          onUnlock={onUnlock}
          unlockPriceLabel={unlockPriceLabel}
          unlocking={unlocking}
          unlockingLabel={unlockingLabel}
          description="Combined improvement suggestions from both websites."
        />
      </div>
    </motion.div>
  );
}
