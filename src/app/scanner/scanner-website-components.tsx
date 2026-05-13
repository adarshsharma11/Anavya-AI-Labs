"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BarChart3, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ScanPreview, ScanReport } from "@/lib/api/scan";
import type { Issue } from "./scanner-types";
import { UnlockReportNotice } from "./scanner-shared-components";
import {
  CircularScore,
  CodeBlock,
  MetricRow,
  ScoreBar,
  SeverityBadge,
  SkeletonCard,
  StatusRow,
} from "./scanner-ui-primitives";

export function Hero() {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
        <Sparkles className="h-4 w-4 text-emerald-500" />
        AI Tool
      </div>
      <h1 className="mt-6 font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        AI Website Scanner Tool
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        Scan your website and get an AI-powered report for performance, SEO,
        accessibility, and security.
      </p>
    </div>
  );
}

export function ScanInput({
  urlValue,
  onUrlChange,
  onScan,
  scanning,
  errorMessage,
}: {
  urlValue: string;
  onUrlChange: (value: string) => void;
  onScan: () => void;
  scanning: boolean;
  errorMessage: string | null;
}) {
  const examples = ["stripe.com", "vercel.com", "shopify.com"];

  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur md:p-8">
      <div>
        <label className="text-sm font-semibold text-foreground">
          Website URL
        </label>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={urlValue}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="example.com"
            className="h-12 flex-1 text-base"
          />
          <Button
            size="lg"
            className="h-12 w-full min-w-[160px] justify-center whitespace-nowrap shadow-lg shadow-primary/20 md:w-44"
            onClick={onScan}
            disabled={scanning}
            aria-busy={scanning}
          >
            {scanning ? "Scanning..." : "Scan Now"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 min-h-[20px] text-sm">
          {errorMessage ? (
            <p className="text-destructive">{errorMessage}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 px-3 py-1 text-emerald-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure & private
        </span>
        <span className="rounded-full border border-sky-400/30 px-3 py-1 text-sky-600">
          AI powered
        </span>
        <span className="rounded-full border border-amber-400/30 px-3 py-1 text-amber-600">
          Free scan
        </span>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>Try:</span>
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
            onClick={() => onUrlChange(example)}
          >
            {example}
          </button>
        ))}
      </div>
    </Card>
  );
}

export function ScanLoader({ activeStep }: { activeStep: string }) {
  return (
    <div className="mt-12 flex justify-center">
      <Card className="w-full max-w-4xl border-border/60 bg-background/80 p-10 text-center shadow-lg backdrop-blur">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full border border-primary/40 bg-primary/10 text-primary shadow-[0_0_30px_rgba(59,130,246,0.35)]">
          <div className="h-full w-full animate-spin rounded-full border-2 border-transparent border-t-primary" />
        </div>
        <h3 className="text-xl font-semibold">Scanning your website…</h3>
        <p className="mt-2 text-sm text-muted-foreground">{activeStep}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <SkeletonCard title="Analyzing performance" />
          <SkeletonCard title="Checking SEO" />
          <SkeletonCard title="Generating report" />
        </div>
      </Card>
    </div>
  );
}

export function ResultsHeader({
  url,
  overall,
  verdict,
  totalIssues,
  onReset,
  unlocked,
  onDownload,
  onUnlock,
  unlockPriceLabel,
  unlocking = false,
  unlockingLabel = "Processing...",
  downloading = false,
}: {
  url: string;
  overall: number;
  verdict: string;
  totalIssues: number;
  onReset: () => void;
  unlocked: boolean;
  onDownload: () => void;
  onUnlock: () => void;
  unlockPriceLabel: string;
  unlocking?: boolean;
  unlockingLabel?: string;
  downloading?: boolean;
}) {
  const verdictTone = verdict.toLowerCase().includes("excellent")
    ? "bg-emerald-500/10 text-emerald-600"
    : verdict.toLowerCase().includes("good")
      ? "bg-sky-500/10 text-sky-600"
      : verdict.toLowerCase().includes("needs")
        ? "bg-amber-500/10 text-amber-600"
        : "bg-rose-500/10 text-rose-600";

  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Audit Report
          </div>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{url}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${verdictTone}`}
            >
              {verdict}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalIssues} issues detected
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="rounded-full px-4 py-2">
            Overall score {overall}
          </Badge>
          {unlocked ? (
            <Button variant="outline" onClick={onDownload} disabled={downloading}>
              {downloading ? "Generating..." : "Download PDF"}
            </Button>
          ) : (
            <Button onClick={onUnlock} disabled={unlocking} aria-busy={unlocking}>
              {unlocking ? unlockingLabel : `Unlock full report (${unlockPriceLabel})`}
            </Button>
          )}
          <Button variant="outline" onClick={onReset}>
            Scan another
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ScoreOverview({
  overall,
  categories,
  indexing,
  social,
}: {
  overall: number;
  categories: ScanPreview["categories"];
  indexing?: ScanPreview["indexing"];
  social?: ScanPreview["social"];
}) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <h3 className="text-lg font-semibold">Overall health</h3>
      <div className="mt-5 grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
        <CircularScore value={overall} />
        <div className="space-y-4 text-sm text-muted-foreground">
          <ScoreBar label="Performance" value={categories.performance} tone="emerald" />
          <ScoreBar label="SEO" value={categories.seo} tone="sky" />
          <ScoreBar
            label="Accessibility"
            value={categories.accessibility}
            tone="amber"
          />
          <ScoreBar label="Security" value={categories.security} tone="violet" />
        </div>
      </div>
      <div className="mt-6 border-t border-border/60 pt-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Indexing & Social
        </div>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <StatusRow
            label="Robots.txt"
            value={Boolean(indexing?.robots)}
            positiveLabel="Detected"
            negativeLabel="Missing"
          />
          <StatusRow
            label="Sitemap"
            value={Boolean(indexing?.sitemap)}
            positiveLabel="Detected"
            negativeLabel="Missing"
          />
          <StatusRow
            label="OpenGraph tags"
            value={Boolean((social as any)?.ogTags)}
            positiveLabel="Configured"
            negativeLabel="Missing"
          />
          <StatusRow
            label="OG image"
            value={Boolean((social as any)?.ogImage)}
            positiveLabel="Configured"
            negativeLabel="Missing"
          />
          <StatusRow
            label="Twitter cards"
            value={Boolean((social as any)?.twitterTags)}
            positiveLabel="Configured"
            negativeLabel="Missing"
          />
          {social && "facebookAdmins" in (social as any) ? (
            <StatusRow
              label="Facebook admins"
              value={Boolean((social as any).facebookAdmins)}
              positiveLabel="Configured"
              negativeLabel="Missing"
            />
          ) : null}
          {social && "facebookAppId" in (social as any) ? (
            <StatusRow
              label="Facebook app ID"
              value={Boolean((social as any).facebookAppId)}
              positiveLabel="Configured"
              negativeLabel="Missing"
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function IssuesList({
  issues,
  totalIssues,
  locked,
  lockedCount,
  onUnlock,
  unlockPriceLabel,
  unlocking = false,
  unlockingLabel,
}: {
  issues: Issue[];
  totalIssues: number;
  locked: boolean;
  lockedCount: number;
  onUnlock: () => void;
  unlockPriceLabel: string;
  unlocking?: boolean;
  unlockingLabel?: string;
}) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Issues & AI Fixes</h3>
        <Badge variant="secondary">
          {issues.length} of {totalIssues}
        </Badge>
      </div>
      <div className="mt-5 space-y-4">
        {issues.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
            No critical issues detected in the free preview.
          </div>
        ) : (
          issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} locked={locked} />
          ))
        )}
        {locked && lockedCount > 0 ? (
          <UnlockReportNotice
            message={`Unlock the full report to see ${lockedCount} more issues and AI-powered code fixes.`}
            onUnlock={onUnlock}
            unlockPriceLabel={unlockPriceLabel}
            unlocking={unlocking}
            unlockingLabel={unlockingLabel}
          />
        ) : null}
      </div>
    </Card>
  );
}

function IssueCard({ issue, locked }: { issue: Issue; locked: boolean }) {
  const hasCode =
    issue.codeSnippet &&
    (issue.codeSnippet.html || issue.codeSnippet.css || issue.codeSnippet.js);

  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4 transition-all hover:border-border/100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{issue.title}</p>
            {!locked && hasCode && (
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/5 py-0 text-[10px] text-emerald-600"
              >
                AI Fix Available
              </Badge>
            )}
          </div>
          {issue.suggestion ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {issue.suggestion}
            </p>
          ) : null}

          {!locked && issue.codeSnippet && (
            <div className="mt-4 space-y-3">
              {issue.codeSnippet.html && (
                <CodeBlock label="HTML Fix" code={issue.codeSnippet.html} />
              )}
              {issue.codeSnippet.css && (
                <CodeBlock label="CSS Fix" code={issue.codeSnippet.css} />
              )}
              {issue.codeSnippet.js && (
                <CodeBlock label="Javascript Fix" code={issue.codeSnippet.js} />
              )}
            </div>
          )}
        </div>
        <SeverityBadge severity={issue.severity} />
      </div>
    </div>
  );
}

export function MetricsCard({
  metrics,
  improvements,
  seoMeta,
}: {
  metrics?: ScanPreview["metrics"];
  improvements?: ScanPreview["improvements"];
  seoMeta?: ScanPreview["seoMeta"];
}) {
  const titleChars =
    metrics && "titleChars" in metrics ? (metrics as any).titleChars : undefined;
  const metaDescriptionChars =
    metrics && "metaDescriptionChars" in metrics ? (metrics as any).metaDescriptionChars : undefined;
  const metaDescriptionWords =
    metrics && "metaDescriptionWords" in metrics ? (metrics as any).metaDescriptionWords : undefined;

  const metaDescriptionValue =
    metaDescriptionChars !== undefined && metaDescriptionWords !== undefined
      ? `${metaDescriptionChars} chars (${metaDescriptionWords} words)`
      : metaDescriptionChars !== undefined
        ? `${metaDescriptionChars} chars`
        : metaDescriptionWords !== undefined
          ? `${metaDescriptionWords} words`
          : "N/A";

  const hasSeoMeta =
    Boolean(seoMeta) ||
    titleChars !== undefined ||
    metaDescriptionChars !== undefined ||
    metaDescriptionWords !== undefined;

  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold text-sky-600">
        <BarChart3 className="h-4 w-4" />
        Scan metrics
      </div>
      <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
        <MetricRow label="Load time" value={metrics?.loadTime || "N/A"} />
        <MetricRow label="Page size" value={metrics?.pageSize || "N/A"} />
        <MetricRow label="Images" value={metrics ? `${metrics.images}` : "0"} />
        <MetricRow label="Scripts" value={metrics ? `${metrics.scripts}` : "0"} />
        <MetricRow label="Links" value={metrics ? `${metrics.links}` : "0"} />
      </div>
      {improvements ? (
        <div className="mt-6 border-t border-border/60 pt-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Potential improvements
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <MetricRow label="Potential score" value={improvements.potentialScore} />
            <MetricRow label="Growth potential" value={improvements.trafficPotential} />
            <MetricRow label="Fix count" value={improvements.fixCount} />
          </div>
        </div>
      ) : null}
      {hasSeoMeta ? (
        <div className="mt-6 border-t border-border/60 pt-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            SEO meta
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            {seoMeta ? (
              <>
                <StatusRow
                  label="Favicon"
                  value={Boolean((seoMeta as any).favicon)}
                  positiveLabel="Detected"
                  negativeLabel="Missing"
                />
                <StatusRow
                  label="Canonical"
                  value={Boolean((seoMeta as any).canonical)}
                  positiveLabel="Configured"
                  negativeLabel="Missing"
                />
                <MetricRow label="Meta robots" value={(seoMeta as any).metaRobots || "N/A"} />
              </>
            ) : null}
            <MetricRow
              label="Title length"
              value={titleChars !== undefined ? `${titleChars} chars` : "N/A"}
            />
            <MetricRow label="Meta description" value={metaDescriptionValue} />
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export function FullReportSection({
  report,
  pending = false,
}: {
  report: ScanReport | null;
  pending?: boolean;
}) {
  const seoItems = report?.seoImprovements ?? [];
  const perfItems = report?.performanceImprovements ?? [];
  const growthItems = report?.businessGrowthSuggestions ?? [];
  const additionalSuggestions = report?.suggestions ?? [];

  const hasContent =
    report?.executiveSummary ||
    report?.technicalAnalysis ||
    report?.summary ||
    report?.estimatedTrafficImpact ||
    additionalSuggestions.length ||
    seoItems.length ||
    perfItems.length ||
    growthItems.length;

  const tabEntries = useMemo(() => {
    const entries: Array<{ id: string; label: string }> = [];
    if (report?.executiveSummary || report?.summary) {
      entries.push({ id: "summary", label: "Summary" });
    }
    if (report?.technicalAnalysis) {
      entries.push({ id: "technical", label: "Technical" });
    }
    if (seoItems.length) {
      entries.push({ id: "seo", label: "SEO" });
    }
    if (perfItems.length) {
      entries.push({ id: "performance", label: "Performance" });
    }
    if (growthItems.length) {
      entries.push({ id: "growth", label: "Growth" });
    }
    if (additionalSuggestions.length) {
      entries.push({ id: "suggestions", label: "Suggestions" });
    }
    if (report?.estimatedTrafficImpact) {
      entries.push({ id: "impact", label: "Impact" });
    }
    return entries;
  }, [
    report?.executiveSummary,
    report?.summary,
    report?.technicalAnalysis,
    report?.estimatedTrafficImpact,
    seoItems.length,
    perfItems.length,
    growthItems.length,
    additionalSuggestions.length,
  ]);

  const defaultTab = tabEntries[0]?.id ?? "summary";
  const [activeReportTab, setActiveReportTab] = useState(defaultTab);

  useEffect(() => {
    if (!hasContent) return;
    if (typeof window === "undefined") return;
    const topLevelTab = new URLSearchParams(window.location.search).get("tab");
    const reportTabParam = topLevelTab === "competitor" ? "competitorReportTab" : "reportTab";
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get(reportTabParam);
    const validIds = new Set(tabEntries.map((entry) => entry.id));

    if (urlTab && validIds.has(urlTab)) {
      setActiveReportTab(urlTab);
      return;
    }

    setActiveReportTab(defaultTab);
    if (defaultTab) {
      params.set(reportTabParam, defaultTab);
      const url = new URL(window.location.href);
      url.search = params.toString();
      window.history.replaceState({}, "", url.toString());
    }
  }, [defaultTab, tabEntries, hasContent]);

  const handleReportTabChange = (value: string) => {
    setActiveReportTab(value);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const topLevelTab = url.searchParams.get("tab");
    const reportTabParam = topLevelTab === "competitor" ? "competitorReportTab" : "reportTab";
    url.searchParams.set(reportTabParam, value);
    window.history.replaceState({}, "", url.toString());
  };

  if (!hasContent || !report) {
    if (!pending) return null;
    return (
      <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
        <h3 className="text-lg font-semibold">Full AI Report</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your payment is complete. We are generating the unlocked full report now.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <h3 className="text-lg font-semibold">Full AI Report</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Unlocked detailed recommendations based on your scanned page.
      </p>

      <Tabs value={activeReportTab} onValueChange={handleReportTabChange} className="mt-5">
        <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-1.5">
          {tabEntries.map((entry) => (
            <TabsTrigger
              key={entry.id}
              value={entry.id}
              className="relative whitespace-nowrap rounded-lg bg-transparent px-3 py-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {activeReportTab === entry.id ? (
                <motion.span
                  layoutId="full-report-tab-pill"
                  className="absolute inset-0 z-0 rounded-lg border border-border/60 bg-gradient-to-r from-emerald-500/10 to-sky-500/10"
                  transition={{ type: "spring", stiffness: 340, damping: 28 }}
                />
              ) : null}
              <span className="relative z-10">{entry.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 text-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeReportTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {activeReportTab === "summary" ? (
                <SectionBlock
                  title="Executive Summary"
                  content={report.executiveSummary ?? report.summary ?? ""}
                  tone="sky"
                />
              ) : null}

              {activeReportTab === "technical" ? (
                <SectionBlock
                  title="Technical Analysis"
                  content={report.technicalAnalysis ?? ""}
                  tone="emerald"
                />
              ) : null}

              {activeReportTab === "seo" ? (
                <ListBlock title="SEO Improvements" items={seoItems} tone="violet" />
              ) : null}

              {activeReportTab === "performance" ? (
                <ListBlock
                  title="Performance Improvements"
                  items={perfItems}
                  tone="amber"
                />
              ) : null}

              {activeReportTab === "growth" ? (
                <ListBlock
                  title="Business Growth Suggestions"
                  items={growthItems}
                  tone="rose"
                />
              ) : null}

              {activeReportTab === "suggestions" ? (
                <ListBlock
                  title="Additional Suggestions"
                  items={additionalSuggestions}
                  tone="indigo"
                />
              ) : null}

              {activeReportTab === "impact" ? (
                <SectionBlock
                  title="Estimated Traffic Impact"
                  content={report.estimatedTrafficImpact ?? ""}
                  tone="cyan"
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </Card>
  );
}

function SectionBlock({
  title,
  content,
  tone,
}: {
  title: string;
  content: string;
  tone: "sky" | "emerald" | "cyan";
}) {
  const toneClass = {
    sky: "border-sky-500/30 bg-sky-500/5",
    emerald: "border-emerald-500/30 bg-emerald-500/5",
    cyan: "border-cyan-500/30 bg-cyan-500/5",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 text-sm text-foreground/90">{content}</p>
    </div>
  );
}

function ListBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "violet" | "amber" | "rose" | "indigo";
}) {
  const toneClass = {
    violet: "border-violet-500/30 bg-violet-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    rose: "border-rose-500/30 bg-rose-500/5",
    indigo: "border-indigo-500/30 bg-indigo-500/5",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <ul className="mt-2 space-y-2">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="text-sm text-foreground/90">
            {index + 1}. {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
