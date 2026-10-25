"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleSlash,
  FileText,
  MinusCircle,
  XCircle,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type AuditReport,
  type CategoryId,
  type CheckResult,
  type CheckStatus,
  type CompetitorAnalysis,
  type Recommendation,
} from "@/types/audit";
import type { AiReport } from "@/types/audit";
import {
  formatScore,
  pagePath,
  scoreBarClass,
  scoreLabel,
  scoreToneClass,
  statusLabel,
} from "./score-utils";

function StatusIcon({ status }: { status: CheckStatus }) {
  const className = "h-4 w-4 shrink-0";
  if (status === "pass") {
    return <CheckCircle2 className={`${className} text-emerald-600`} aria-hidden />;
  }
  if (status === "partial") {
    return <AlertTriangle className={`${className} text-amber-600`} aria-hidden />;
  }
  if (status === "fail") {
    return <XCircle className={`${className} text-rose-600`} aria-hidden />;
  }
  return <MinusCircle className={`${className} text-muted-foreground`} aria-hidden />;
}

function ScoreRing({
  overall,
  verdict,
}: {
  overall: number;
  verdict: string;
}) {
  const angle = Math.round((Math.max(0, Math.min(100, overall)) / 100) * 360);
  return (
    <div className="flex items-center gap-5">
      <div
        className="relative h-28 w-28 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--primary)) ${angle}deg, hsl(var(--muted)) 0deg)`,
        }}
        role="img"
        aria-label={`Overall score ${overall} out of 100, ${verdict}`}
      >
        <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-background">
          <span className="text-3xl font-bold">{overall}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            / 100
          </span>
        </div>
      </div>
      <div>
        <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${scoreToneClass(overall)}`}>
          {verdict}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{scoreLabel(overall)}</p>
      </div>
    </div>
  );
}

export function ReportHeader({
  report,
  actions,
}: {
  report: AuditReport;
  actions?: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <ScoreRing overall={report.overall} verdict={report.verdict} />
        <div className="flex-1 space-y-3">
          <p className="text-sm leading-relaxed text-foreground">{report.summary}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className="gap-1.5">
              <Bot className="h-3.5 w-3.5" aria-hidden />
              AI crawler access: {report.crawlerAccess.allowed} of {report.crawlerAccess.total}
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              {report.pages.length} pages analysed
            </Badge>
          </div>
          {report.structuredDataTypes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {report.structuredDataTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {type}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {actions}
      </div>
    </Card>
  );
}

export function CategoryCards({ report }: { report: AuditReport }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CATEGORY_ORDER.map((id) => {
        const value = report.categories[id];
        const width = value === null ? 0 : Math.max(0, Math.min(100, value));
        return (
          <Card key={id} className="border-border/60 bg-background/80 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{CATEGORY_LABELS[id]}</h3>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${scoreToneClass(value)}`}>
                {formatScore(value)}
                <span className="sr-only">, {scoreLabel(value)}</span>
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${scoreBarClass(value)}`}
                style={{ width: `${width}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{scoreLabel(value)}</p>
          </Card>
        );
      })}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Recommendation["priority"] }) {
  const styles = {
    critical: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    important: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    minor: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[priority]}`}>
      {priority}
    </span>
  );
}

export function RecommendationsList({
  recommendations,
}: {
  recommendations: readonly Recommendation[];
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? recommendations : recommendations.slice(0, 10);

  if (recommendations.length === 0) {
    return (
      <Card className="border-border/60 p-6 text-sm text-muted-foreground">
        No recommendations yet. Extra pages will fill this in as the audit completes.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((item) => (
        <Card key={item.id} className="border-border/60 bg-background/80 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={item.priority} />
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              +{item.gain} pts
            </span>
            <h3 className="text-sm font-semibold">{item.label}</h3>
          </div>
          <p className="mt-2 text-sm text-foreground">{item.fix}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.evidence}
            {item.affectedPages.length > 0
              ? ` · affects ${item.affectedPages.length} page${item.affectedPages.length === 1 ? "" : "s"}`
              : null}
          </p>
          <Collapsible>
            <CollapsibleTrigger className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              Why AI cares
              <ChevronDown className="h-3 w-3" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 text-xs text-muted-foreground">
              {item.why}
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
      {recommendations.length > 10 ? (
        <Button variant="outline" size="sm" onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Show fewer" : "Show all"}
        </Button>
      ) : null}
    </div>
  );
}

export function PagesTable({ report }: { report: AuditReport }) {
  if (report.pages.length === 0) {
    return (
      <Card className="h-32 border-border/60 p-6 text-sm text-muted-foreground">
        {report.progress.pages === "running"
          ? "Analysing additional pages…"
          : "No extra pages were found."}
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <div className="flex items-center bg-muted/40 px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">
        <div className="grid min-w-0 flex-1 grid-cols-4 gap-2 font-semibold">
          <span>Path</span>
          <span>Type</span>
          <span>Score</span>
          <span>Words</span>
        </div>
        <span className="ml-2 h-4 w-4 shrink-0" aria-hidden />
      </div>
      <Accordion type="single" collapsible>
        {report.pages.map((page) => {
          const issues = page.checks.filter(
            (check) => check.status === "fail" || check.status === "partial"
          );
          return (
            <AccordionItem key={page.url} value={page.url} className="border-border/50">
              <AccordionTrigger className="gap-2 px-4 py-3 text-sm hover:bg-muted/30 hover:no-underline [&>svg]:text-muted-foreground">
                <span className="grid min-w-0 flex-1 grid-cols-4 gap-2 text-left font-normal">
                  <span className="truncate font-medium">{pagePath(page.url)}</span>
                  <span className="capitalize text-muted-foreground">{page.pageType}</span>
                  <span>{page.overall}</span>
                  <span>{page.stats.wordCount}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="bg-muted/20 px-4">
                <ul className="space-y-2">
                  {issues.length === 0 ? (
                    <li className="text-xs text-muted-foreground">No failing checks on this page.</li>
                  ) : (
                    issues.map((check) => (
                      <li key={check.id} className="rounded-lg border border-border/50 bg-background p-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <StatusIcon status={check.status} />
                          <span>{check.label}</span>
                          <span className="sr-only">{statusLabel(check.status)}</span>
                        </div>
                        {check.fix ? (
                          <p className="mt-1 text-xs text-foreground">{check.fix}</p>
                        ) : null}
                      </li>
                    ))
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function CheckRow({ check }: { check: CheckResult }) {
  return (
    <div className="flex gap-3 rounded-lg border border-border/50 p-3">
      <StatusIcon status={check.status} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{check.label}</p>
          <span className="text-xs text-muted-foreground">
            {statusLabel(check.status)} · {check.points}/{check.maxPoints}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{check.evidence}</p>
        {check.status !== "pass" && check.fix ? (
          <p className="mt-1 text-sm">{check.fix}</p>
        ) : null}
      </div>
    </div>
  );
}

export function ChecksTabs({ report }: { report: AuditReport }) {
  const homepage = report.pages.find((page) => page.isHomepage) ?? report.pages[0];
  const [showNa, setShowNa] = useState(false);

  const byCategory = useMemo(() => {
    const map = new Map<CategoryId, CheckResult[]>();
    for (const id of CATEGORY_ORDER) map.set(id, []);
    const source = [...report.siteChecks, ...(homepage?.checks ?? [])];
    for (const check of source) {
      map.get(check.category)?.push(check);
    }
    return map;
  }, [homepage, report.siteChecks]);

  return (
    <Tabs defaultValue="aeo">
      <TabsList className="h-auto flex-wrap justify-start">
        {CATEGORY_ORDER.map((id) => (
          <TabsTrigger key={id} value={id}>
            {CATEGORY_LABELS[id]}
          </TabsTrigger>
        ))}
      </TabsList>
      {CATEGORY_ORDER.map((id) => {
        const checks = byCategory.get(id) ?? [];
        const visible = showNa ? checks : checks.filter((check) => check.status !== "na");
        const hiddenNa = checks.filter((check) => check.status === "na").length;
        return (
          <TabsContent key={id} value={id} className="space-y-2">
            {visible.length === 0 ? (
              <p className="text-sm text-muted-foreground">No checks in this category yet.</p>
            ) : (
              visible.map((check) => <CheckRow key={check.id} check={check} />)
            )}
            {hiddenNa > 0 || showNa ? (
              <Button variant="ghost" size="sm" onClick={() => setShowNa((value) => !value)}>
                {showNa ? "Hide not applicable" : `Show not applicable (${hiddenNa})`}
              </Button>
            ) : null}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

export function CompetitorSection({ analysis }: { analysis: CompetitorAnalysis }) {
  return (
    <Card className="space-y-4 border-border/60 p-6">
      <div>
        <h3 className="text-lg font-semibold">
          Score gap: {analysis.scoreGap > 0 ? "+" : ""}
          {analysis.scoreGap}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{analysis.summary}</p>
      </div>
      <div className="space-y-3">
        {analysis.categoryGaps.map((gap) => (
          <div key={gap.category}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{gap.label}</span>
              <span>
                You {formatScore(gap.yours)} · Them {formatScore(gap.competitor)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${scoreBarClass(gap.yours)}`}
                  style={{ width: `${gap.yours ?? 0}%` }}
                />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${scoreBarClass(gap.competitor)}`}
                  style={{ width: `${gap.competitor ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {analysis.actionItems.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {analysis.actionItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

export function AiReportSkeleton() {
  return (
    <Card className="space-y-3 border-border/60 p-6" aria-busy="true" aria-label="Writing your AI report">
      <p className="text-sm font-medium">Writing your AI report…</p>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-24 w-full" />
    </Card>
  );
}

export function AiReportBody({ report }: { report: AiReport }) {
  const sections = [
    { title: "Executive summary", body: report.executiveSummary },
    { title: "Technical analysis", body: report.technicalAnalysis },
    { title: "SEO improvements", items: report.seoImprovements },
    { title: "Performance improvements", items: report.performanceImprovements },
    { title: "Business growth", items: report.businessGrowthSuggestions },
    { title: "GEO improvements", items: report.geoImprovements },
    { title: "Competitor strategy", body: report.competitorStrategy ?? undefined },
    { title: "Estimated traffic impact", body: report.estimatedTrafficImpact },
  ];

  return (
    <div className="space-y-4">
      {report.error ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
          This is a partial report. Some sections may be incomplete.
        </p>
      ) : null}
      {sections.map((section) => {
        if (section.body) {
          return (
            <Card key={section.title} className="border-border/60 p-5">
              <h4 className="text-sm font-semibold">{section.title}</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {section.body}
              </p>
            </Card>
          );
        }
        if (section.items && section.items.length > 0) {
          return (
            <Card key={section.title} className="border-border/60 p-5">
              <h4 className="text-sm font-semibold">{section.title}</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          );
        }
        return null;
      })}
    </div>
  );
}

export function AiDeepReportSection({
  locked,
  processing,
  failed,
  report,
  onUnlock,
  unlockPriceLabel,
  unlocking,
  isAdmin,
  onRegenerate,
}: {
  locked: boolean;
  processing: boolean;
  failed: boolean;
  report: AiReport | null;
  onUnlock: () => void;
  unlockPriceLabel: string;
  unlocking?: boolean;
  isAdmin?: boolean;
  onRegenerate?: () => void;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">AI Deep Report</h3>
      {locked ? (
        <Card className="border-primary/30 bg-primary/5 p-6">
          <div className="flex items-start gap-3">
            <CircleSlash className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
            <div className="space-y-3">
              <p className="text-sm">
                AI-written action plan tailored to your site, competitor strategy, traffic impact.
              </p>
              <Button onClick={onUnlock} disabled={unlocking} aria-busy={unlocking}>
                {unlocking ? "Opening checkout…" : `Unlock${unlockPriceLabel ? ` · ${unlockPriceLabel}` : ""}`}
              </Button>
            </div>
          </div>
        </Card>
      ) : failed ? (
        <Card className="border-amber-500/30 bg-amber-500/10 p-6 text-sm">
          We&apos;re regenerating your report. Check back shortly.
          {isAdmin && onRegenerate ? (
            <Button className="ml-3" size="sm" variant="outline" onClick={onRegenerate}>
              Regenerate
            </Button>
          ) : null}
        </Card>
      ) : processing && !report ? (
        <AiReportSkeleton />
      ) : report ? (
        <AiReportBody report={report} />
      ) : (
        <AiReportSkeleton />
      )}
    </section>
  );
}

export function AuditProgressBanner({ report }: { report: AuditReport }) {
  const pagesRunning = report.progress.pages === "running";
  const speedRunning = report.progress.speed === "running";
  if (!pagesRunning && !speedRunning) return null;
  return (
    <p className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs text-sky-800">
      {pagesRunning ? "Extra pages are still being analysed. " : null}
      {speedRunning ? "Page speed is still being measured." : null}
    </p>
  );
}
