'use client';

import type { ScanResult, ScanSummary } from '@/lib/scan-types';
import { Progress } from '@/components/ui/progress';

interface ScannerResultsSummaryProps {
  results: ScanResult[];
  summary?: ScanSummary;
}

export default function ScannerResultsSummary({
  results,
  summary,
}: ScannerResultsSummaryProps) {
  const nonPremium = results.filter((r) => !r.isPremium);

  const counts = nonPremium.reduce(
    (acc, result) => {
      acc.bySeverity[result.severity] = (acc.bySeverity[result.severity] || 0) + 1;
      acc.byType[result.type] = (acc.byType[result.type] || 0) + 1;
      return acc;
    },
    {
      bySeverity: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    }
  );

  const weights = {
    High: 25,
    Medium: 12,
    Low: 5,
  } as const;

  const computedScores = nonPremium.reduce(
    (acc, result) => {
      acc[result.type] = Math.max(0, Math.min(100, acc[result.type] - weights[result.severity]));
      return acc;
    },
    {
      Performance: 100,
      SEO: 100,
      Accessibility: 100,
    }
  );

  const computedOverall = Math.round(
    (computedScores.Performance + computedScores.SEO + computedScores.Accessibility) / 3
  );

  const scores = summary?.scores ?? computedScores;
  const overallScore = summary?.overallScore ?? computedOverall;

  return (
    <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-foreground/5 via-background to-background p-6 shadow-lg md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="space-y-4">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Scan Summary
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Overall health score
          </h2>
          <div className="flex flex-wrap items-end gap-6">
            <div className="text-6xl font-semibold tabular-nums">
              {overallScore}
            </div>
            <div className="text-sm text-muted-foreground">
              Based on performance, SEO, and accessibility.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-background/80 p-4 text-center">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                High
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">
                {counts.bySeverity['High'] ?? 0}
              </div>
            </div>
            <div className="rounded-2xl border bg-background/80 p-4 text-center">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Medium
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">
                {counts.bySeverity['Medium'] ?? 0}
              </div>
            </div>
            <div className="rounded-2xl border bg-background/80 p-4 text-center">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Low
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">
                {counts.bySeverity['Low'] ?? 0}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {[
            { label: 'Performance', value: scores.Performance },
            { label: 'SEO', value: scores.SEO },
            { label: 'Accessibility', value: scores.Accessibility },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {item.value}/100
                </span>
              </div>
              <Progress value={item.value} />
            </div>
          ))}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center justify-between gap-4 rounded-xl border bg-background/80 p-3">
              <dt className="text-muted-foreground">Response time</dt>
              <dd className="font-medium tabular-nums">
                {summary ? `${summary.metrics.responseTimeMs}ms` : '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border bg-background/80 p-3">
              <dt className="text-muted-foreground">HTML size</dt>
              <dd className="font-medium tabular-nums">
                {summary ? `${Math.round(summary.metrics.contentBytes / 1024)}KB` : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
