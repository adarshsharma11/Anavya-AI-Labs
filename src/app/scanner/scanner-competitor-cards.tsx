"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ScanPreview } from "@/lib/api/scan";
import { REPORT_UNLOCK_PRICE_LABEL } from "./scanner-constants";
import { UnlockReportNotice } from "./scanner-shared-components";
import {
  CircularScore,
  MetricRow,
  ScoreBar,
  SeverityBadge,
  SkeletonCard,
  StatusRow,
} from "./scanner-ui-primitives";

export function CompetitorScoreCard({
  title,
  highlight,
  preview,
  locked,
  onUnlock,
  unlocking = false,
  unlockingLabel,
}: {
  title: string;
  highlight: boolean;
  preview: ScanPreview;
  locked: boolean;
  onUnlock: () => void;
  unlocking?: boolean;
  unlockingLabel?: string;
}) {
  const hiddenIssueCount = Math.max(
    0,
    (preview.lockedIssues ?? 0) - preview.topIssues.length
  );
  const verdictTone = preview.verdict.toLowerCase().includes("good")
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
    : preview.verdict.toLowerCase().includes("needs")
      ? "border-amber-500/40 bg-amber-500/10 text-amber-600"
      : "border-sky-500/40 bg-sky-500/10 text-sky-600";

  return (
    <Card
      className={`border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur ${
        highlight ? "ring-2 ring-primary/40" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">{title}</h4>
        {highlight ? (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Leading
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${verdictTone}`}
        >
          {preview.verdict}
        </span>
        <Badge variant="secondary">{preview.totalIssuesFound} total issues</Badge>
      </div>
      <div className="mt-5 grid gap-6 md:grid-cols-[160px_1fr] md:items-center">
        <CircularScore value={preview.overall} />
        <div className="space-y-4 text-sm text-muted-foreground">
          <ScoreBar label="Performance" value={preview.categories.performance} tone="emerald" />
          <ScoreBar label="SEO" value={preview.categories.seo} tone="sky" />
          <ScoreBar label="Accessibility" value={preview.categories.accessibility} tone="amber" />
          <ScoreBar label="Security" value={preview.categories.security} tone="violet" />
        </div>
      </div>
      <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
        <MetricRow label="Load time" value={preview.metrics?.loadTime || "N/A"} />
        <MetricRow label="Page size" value={preview.metrics?.pageSize || "N/A"} />
        <MetricRow label="Images" value={preview.metrics ? `${preview.metrics.images}` : "0"} />
        <MetricRow label="Scripts" value={preview.metrics ? `${preview.metrics.scripts}` : "0"} />
        <MetricRow label="Links" value={preview.metrics ? `${preview.metrics.links}` : "0"} />
        {"titleChars" in (preview.metrics ?? {}) ? (
          <MetricRow
            label="Title length"
            value={
              (preview.metrics as any)?.titleChars !== undefined
                ? `${(preview.metrics as any).titleChars} chars`
                : "N/A"
            }
          />
        ) : null}
        {"metaDescriptionChars" in (preview.metrics ?? {}) || "metaDescriptionWords" in (preview.metrics ?? {}) ? (
          <MetricRow
            label="Meta description"
            value={
              (preview.metrics as any)?.metaDescriptionChars !== undefined &&
              (preview.metrics as any)?.metaDescriptionWords !== undefined
                ? `${(preview.metrics as any).metaDescriptionChars} chars (${(preview.metrics as any).metaDescriptionWords} words)`
                : (preview.metrics as any)?.metaDescriptionChars !== undefined
                  ? `${(preview.metrics as any).metaDescriptionChars} chars`
                  : (preview.metrics as any)?.metaDescriptionWords !== undefined
                    ? `${(preview.metrics as any).metaDescriptionWords} words`
                    : "N/A"
            }
          />
        ) : null}
        {preview.improvements ? (
          <>
            <MetricRow
              label="Potential score"
              value={preview.improvements.potentialScore}
            />
            <MetricRow
              label="Growth potential"
              value={preview.improvements.trafficPotential}
            />
            <MetricRow label="Fix count" value={preview.improvements.fixCount} />
          </>
        ) : null}
      </div>

      {preview.seoMeta ? (
        <div className="mt-6 border-t border-border/60 pt-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            SEO meta
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <StatusRow
              label="Favicon"
              value={Boolean((preview.seoMeta as any).favicon)}
              positiveLabel="Detected"
              negativeLabel="Missing"
            />
            <StatusRow
              label="Canonical"
              value={Boolean((preview.seoMeta as any).canonical)}
              positiveLabel="Configured"
              negativeLabel="Missing"
            />
            <MetricRow label="Meta robots" value={(preview.seoMeta as any).metaRobots || "N/A"} />
          </div>
        </div>
      ) : null}

      <div className="mt-6 border-t border-border/60 pt-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Indexing & Social
        </div>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
          {preview.indexing && (
            <>
              <StatusRow
                label="Robots.txt"
                value={preview.indexing.robots}
                positiveLabel="Detected"
                negativeLabel="Missing"
              />
              <StatusRow
                label="Sitemap"
                value={preview.indexing.sitemap}
                positiveLabel="Detected"
                negativeLabel="Missing"
              />
            </>
          )}
          {preview.social && (
            <>
              <StatusRow
                label="OpenGraph tags"
                value={preview.social.ogTags}
                positiveLabel="Configured"
                negativeLabel="Missing"
              />
              <StatusRow
                label="OG image"
                value={Boolean(preview.social.ogImage)}
                positiveLabel="Configured"
                negativeLabel="Missing"
              />
              <StatusRow
                label="Twitter cards"
                value={preview.social.twitterTags}
                positiveLabel="Configured"
                negativeLabel="Missing"
              />
            </>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-border/60 pt-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Top issues
          </div>
          <Badge variant="secondary">{preview.topIssues.length} shown</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {preview.topIssues.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
              No issues in preview.
            </div>
          ) : (
            preview.topIssues.map((issue, index) => (
              <div
                key={`${issue.title}-${index}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2"
              >
                <span className="text-sm text-foreground">{issue.title}</span>
                <SeverityBadge severity={issue.severity} />
              </div>
            ))
          )}
        </div>
        {locked && hiddenIssueCount > 0 ? (
          <div className="mt-4">
            <UnlockReportNotice
              message={`Unlock ${hiddenIssueCount} more issue${hiddenIssueCount > 1 ? "s" : ""}.`}
              onUnlock={onUnlock}
              unlockPriceLabel={REPORT_UNLOCK_PRICE_LABEL}
              unlocking={unlocking}
              unlockingLabel={unlockingLabel}
              compact
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function ComparisonCard({
  title,
  primaryLabel,
  competitorLabel,
  rows,
}: {
  title: string;
  primaryLabel: string;
  competitorLabel: string;
  rows: Array<{
    label: string;
    primary: number;
    competitor: number;
  }>;
}) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">{title}</h4>
        <Badge variant="secondary">AI benchmark</Badge>
      </div>
      <div className="mt-5 space-y-5">
        {rows.map((row) => (
          <div key={row.label} className="space-y-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span>{row.label}</span>
              <span>
                {row.primary} vs {row.competitor}
              </span>
            </div>
            <ComparisonBar label={primaryLabel} value={row.primary} tone="emerald" />
            <ComparisonBar label={competitorLabel} value={row.competitor} tone="violet" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ComparisonBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "violet";
}) {
  const toneMap = {
    emerald: "from-emerald-500 to-emerald-300",
    violet: "from-violet-500 to-violet-300",
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-semibold text-foreground">{value}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${toneMap}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function CompetitorLoader({ activeStep }: { activeStep: string }) {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-5xl border-border/60 bg-background/80 p-10 text-center shadow-lg backdrop-blur">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full border border-primary/40 bg-primary/10 text-primary shadow-[0_0_30px_rgba(59,130,246,0.35)]">
          <div className="h-full w-full animate-spin rounded-full border-2 border-transparent border-t-primary" />
        </div>
        <h3 className="text-xl font-semibold">Comparing competitor data…</h3>
        <p className="mt-2 text-sm text-muted-foreground">{activeStep}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <SkeletonCard title="Benchmarking categories" />
          <SkeletonCard title="Modeling opportunities" />
        </div>
      </Card>
    </div>
  );
}
