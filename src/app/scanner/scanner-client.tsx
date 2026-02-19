"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Crown,
  LineChart,
  ShieldCheck,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createScanRequest,
  fetchScanResult,
  type ScanPreview,
  type ScanResultResponse,
} from "@/lib/api/scan";

const scanSteps = [
  "Analyzing SEO structure...",
  "Checking performance bottlenecks...",
  "Reviewing accessibility signals...",
  "Generating AI report...",
];

const competitorSteps = [
  "Fetching competitor benchmarks...",
  "Comparing performance deltas...",
  "Modeling opportunity impact...",
  "Building comparison report...",
];

const REPORT_UNLOCK_STORAGE_KEY = "report_unlocked";
const SCAN_HISTORY_STORAGE_KEY = "scan_history";

type ScanState = "idle" | "scanning" | "results";

type Issue = {
  id: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  suggestion?: string;
};

type HistoryItem = {
  id: string;
  score: number;
  date: string;
  verdict: string;
};

export default function ScannerClient() {
  const [activeStep, setActiveStep] = useState(0);
  const [urlValue, setUrlValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanId, setScanId] = useState<number | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState("website");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setIsUnlocked(readReportUnlockState());
    setHistory(readScanHistory());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "competitor") {
        setActiveTab("competitor");
      }
    }
  }, []);

  const normalizedUrl = useMemo(() => {
    const trimmed = urlValue.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }, [urlValue]);

  const createScan = useMutation({
    mutationFn: (url: string) => createScanRequest(url),
    onSuccess: (data) => {
      setScanId(data.scanId);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message ?? "Unable to start scan.");
    },
  });

  const scanQuery = useQuery({
    queryKey: ["scan-result", scanId],
    queryFn: () => fetchScanResult(scanId as number),
    enabled: typeof scanId === "number",
  });

  useEffect(() => {
    if (!scanQuery.error) return;
    setErrorMessage((scanQuery.error as Error).message ?? "Scan failed.");
  }, [scanQuery.error]);

  useEffect(() => {
    if (!scanQuery.data) return;
    setErrorMessage(null);
  }, [scanQuery.data]);

  const scanState: ScanState = scanQuery.data
    ? "results"
    : createScan.isPending || scanQuery.isFetching
      ? "scanning"
      : "idle";

  useEffect(() => {
    if (scanState !== "scanning") return;
    setActiveStep(0);
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % scanSteps.length);
    }, 700);
    return () => clearInterval(stepTimer);
  }, [scanState]);

  useEffect(() => {
    if (scanState !== "results") return;
    if (activeTab !== "website") return;
    const node = document.getElementById("scan-report");
    if (!node) return;
    const headerOffset = 80;
    const top = node.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  }, [scanState, activeTab]);

  const handleScan = () => {
    if (!normalizedUrl) {
      setErrorMessage("Please enter a website URL.");
      return;
    }
    setErrorMessage(null);
    setScanId(null);
    setIsUnlocked(false);
    clearReportUnlock();
    createScan.mutate(normalizedUrl);
  };

  const handleUnlock = () => {
    const checkoutLink = process.env.NEXT_PUBLIC_STRIPE_REPORT_LINK;
    if (checkoutLink) {
      window.location.href = checkoutLink;
      return;
    }
    setErrorMessage("Stripe checkout link is not configured.");
  };

  const handleDownload = () => {
    if (!isUnlocked) return;
    const reportData = scanQuery.data?.data;
    if (!reportData) return;
    const previewIssues = reportData.preview.topIssues.map((issue, index) => ({
      id: `issue-${index + 1}`,
      title: issue.title,
      severity: issue.severity,
    }));
    const pdf = buildPdfReport({
      url: reportData.url,
      verdict: reportData.preview.verdict,
      totalIssuesFound: reportData.preview.totalIssuesFound,
      overall: reportData.preview.overall,
      categories: reportData.preview.categories,
      issues: previewIssues,
      suggestions: reportData.preview.quickWins,
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(pdf);
    link.download = "ai-website-audit-report.pdf";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleReset = () => {
    setScanId(null);
  };

  const reportData: ScanResultResponse["data"] | null =
    scanQuery.data?.data ?? null;
  const previewData = reportData?.preview ?? null;
  const locked = reportData
    ? (reportData.locked || reportData.preview.locked) && !isUnlocked
    : true;
  const previewIssues = previewData
    ? previewData.topIssues.map((issue, index) => ({
        id: `issue-${index + 1}`,
        title: issue.title,
        severity: issue.severity,
      }))
    : [];
  const previewSuggestions = previewData?.quickWins ?? [];
  const lockedIssuesCount = previewData?.lockedIssues ?? 0;

  const reportId = reportData?.id ?? null;
  const reportOverall = reportData?.preview.overall ?? null;
  const reportVerdict = reportData?.preview.verdict ?? null;

  const latestHistoryItem = useMemo<HistoryItem | null>(() => {
    if (reportId === null || reportOverall === null || !reportVerdict) return null;
    return {
      id: `SCAN-${reportId}`,
      score: reportOverall,
      verdict: reportVerdict,
      date: new Date().toISOString().slice(0, 10),
    };
  }, [reportId, reportOverall, reportVerdict]);

  useEffect(() => {
    if (scanState !== "results") return;
    if (!latestHistoryItem) return;

    setHistory((prev) => {
      const next = upsertScanHistory(prev, latestHistoryItem);
      writeScanHistory(next);
      return next;
    });
  }, [latestHistoryItem, scanState]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <section className="container py-16 md:py-24">
        <Hero />

        <div className="mx-auto mt-12 max-w-5xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid h-14 w-full grid-cols-2 items-stretch gap-2 rounded-2xl border border-border/60 bg-muted/40 p-1.5 shadow-lg backdrop-blur">
              <TabsTrigger
                value="website"
                className="relative h-full w-full overflow-hidden rounded-xl bg-transparent px-3 py-0 text-muted-foreground transition hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {activeTab === "website" ? (
                  <motion.span
                    layoutId="scanner-tab-pill"
                    className="absolute inset-0 z-0 rounded-xl border border-border/60 bg-gradient-to-r from-emerald-500/15 to-sky-500/15 shadow-[0_12px_30px_rgba(59,130,246,0.12)]"
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  />
                ) : null}
                <span className="relative z-10">Website scan</span>
              </TabsTrigger>
              <TabsTrigger
                value="competitor"
                className="relative h-full w-full overflow-hidden rounded-xl bg-transparent px-3 py-0 text-muted-foreground transition hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {activeTab === "competitor" ? (
                  <motion.span
                    layoutId="scanner-tab-pill"
                    className="absolute inset-0 z-0 rounded-xl border border-border/60 bg-gradient-to-r from-violet-500/15 to-sky-500/15 shadow-[0_12px_30px_rgba(59,130,246,0.12)]"
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  />
                ) : null}
                <span className="relative z-10">Competitor scan</span>
              </TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <AnimatePresence mode="wait">
                {activeTab === "website" ? (
                  <motion.div
                    key="website"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <ScanInput
                      urlValue={urlValue}
                      onUrlChange={setUrlValue}
                      onScan={handleScan}
                      scanning={scanState === "scanning"}
                      errorMessage={errorMessage}
                    />

                    {scanState === "scanning" && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ScanLoader activeStep={scanSteps[activeStep]} />
                      </motion.div>
                    )}

                    {scanState === "results" && reportData && (
                      <motion.div
                        id="scan-report"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-14 space-y-10"
                      >
                        <ResultsHeader
                          url={reportData.url}
                          overall={reportData.preview.overall}
                          verdict={reportData.preview.verdict}
                          totalIssues={reportData.preview.totalIssuesFound}
                          onReset={handleReset}
                          unlocked={!locked}
                          onDownload={handleDownload}
                          onUnlock={handleUnlock}
                        />
                        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                          <ScoreOverview
                            overall={reportData.preview.overall}
                            categories={reportData.preview.categories}
                          />
                          <AiSuggestions
                            title="AI quick wins"
                            suggestions={previewSuggestions}
                            locked={locked}
                            lockedCount={Math.max(0, previewSuggestions.length - 2)}
                            onUnlock={handleUnlock}
                            description="Actionable improvements generated from the scan."
                          />
                        </div>
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                          <IssuesList
                            issues={previewIssues}
                            totalIssues={reportData.preview.totalIssuesFound}
                            locked={locked}
                            lockedCount={lockedIssuesCount}
                            onUnlock={handleUnlock}
                          />
                          <MetricsCard
                            metrics={reportData.preview.metrics}
                            social={reportData.preview.social}
                            indexing={reportData.preview.indexing}
                          />
                        </div>
                        <LockedSection locked={locked} onUnlock={handleUnlock}>
                          <ScanHistory history={history} />
                        </LockedSection>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="competitor"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <CompetitorScanner />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </section>
    </motion.div>
  );
}

function Hero() {
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

function ScanInput({
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

function ScanLoader({ activeStep }: { activeStep: string }) {
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

function ResultsHeader({
  url,
  overall,
  verdict,
  totalIssues,
  onReset,
  unlocked,
  onDownload,
  onUnlock,
}: {
  url: string;
  overall: number;
  verdict: string;
  totalIssues: number;
  onReset: () => void;
  unlocked: boolean;
  onDownload: () => void;
  onUnlock: () => void;
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
            <Button variant="outline" onClick={onDownload}>
              Download PDF
            </Button>
          ) : (
            <Button onClick={onUnlock}>Unlock full report</Button>
          )}
          <Button variant="outline" onClick={onReset}>
            Scan another
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ScoreOverview({
  overall,
  categories,
}: {
  overall: number;
  categories: ScanPreview["categories"];
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
    </Card>
  );
}

function ScoreBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "sky" | "amber" | "violet";
}) {
  const toneMap = {
    emerald: "from-emerald-500 to-emerald-300",
    sky: "from-sky-500 to-sky-300",
    amber: "from-amber-500 to-amber-300",
    violet: "from-violet-500 to-violet-300",
  }[tone];

  return (
    <div>
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-xs text-muted-foreground">{value}/100</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-muted">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${toneMap}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CircularScore({ value }: { value: number }) {
  const angle = Math.round((value / 100) * 360);
  return (
    <div className="relative h-40 w-40">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#22c55e ${angle}deg, rgba(148,163,184,0.2) 0deg)`,
        }}
      />
      <div className="absolute inset-3 rounded-full bg-background" />
      <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold">
        {value}
      </div>
    </div>
  );
}

function IssuesList({
  issues,
  totalIssues,
  locked,
  lockedCount,
  onUnlock,
}: {
  issues: Issue[];
  totalIssues: number;
  locked: boolean;
  lockedCount: number;
  onUnlock: () => void;
}) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Issues found</h3>
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
            <div
              key={issue.id}
              className="rounded-2xl border border-border/60 bg-background/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{issue.title}</p>
                  {issue.suggestion ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {issue.suggestion}
                    </p>
                  ) : null}
                </div>
                <SeverityBadge severity={issue.severity} />
              </div>
            </div>
          ))
        )}
        {locked && lockedCount > 0 ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p>
                Unlock the full report to see {lockedCount} more issue
                {lockedCount > 1 ? "s" : ""}.
              </p>
              <Button size="sm" onClick={onUnlock}>
                Unlock full report
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function SeverityBadge({ severity }: { severity: Issue["severity"] }) {
  const map = {
    High: "border-red-500/40 bg-red-500/10 text-red-600",
    Medium: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    Low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  }[severity];

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${map}`}
    >
      {severity}
    </span>
  );
}

function AiSuggestions({
  title,
  suggestions,
  locked,
  lockedCount = 0,
  onUnlock,
  description,
}: {
  title: string;
  suggestions: string[];
  locked: boolean;
  lockedCount?: number;
  onUnlock?: () => void;
  description?: string;
}) {
  const visibleSuggestions = locked ? suggestions.slice(0, 2) : suggestions;
  const hiddenSuggestions = locked ? suggestions.slice(2) : [];
  const computedLockedCount = lockedCount > 0 ? lockedCount : hiddenSuggestions.length;

  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-emerald-600">
        <Zap className="h-4 w-4" />
        <span>{title}</span>
        {locked ? (
          <Badge variant="secondary" className="text-[10px] uppercase">
            Preview
          </Badge>
        ) : null}
      </div>
      {description ? (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      ) : null}
      {suggestions.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Unlock the report to view AI-generated recommendations.
        </p>
      ) : (
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          {visibleSuggestions.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      )}
      {locked && hiddenSuggestions.length > 0 && onUnlock ? (
        <div className="mt-4">
          <LockedSection locked={true} onUnlock={onUnlock}>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {hiddenSuggestions.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </LockedSection>
        </div>
      ) : null}
      {locked && computedLockedCount > 0 ? (
        <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 p-3 text-xs text-foreground">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Unlock {computedLockedCount} more recommendation
              {computedLockedCount > 1 ? "s" : ""}.
            </span>
            {onUnlock ? (
              <Button size="sm" onClick={onUnlock}>
                Unlock full report
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function MetricsCard({
  metrics,
  social,
  indexing,
}: {
  metrics: ScanPreview["metrics"];
  social: ScanPreview["social"];
  indexing: ScanPreview["indexing"];
}) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold text-sky-600">
        <BarChart3 className="h-4 w-4" />
        Scan metrics
      </div>
      <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
        <MetricRow label="Load time" value={metrics.loadTime} />
        <MetricRow label="Page size" value={metrics.pageSize} />
        <MetricRow label="Images" value={`${metrics.images}`} />
        <MetricRow label="Scripts" value={`${metrics.scripts}`} />
        <MetricRow label="Links" value={`${metrics.links}`} />
      </div>
      <div className="mt-6 border-t border-border/60 pt-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Indexing & Social
        </div>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <StatusRow
            label="Robots.txt"
            value={indexing.robots}
            positiveLabel="Detected"
            negativeLabel="Missing"
          />
          <StatusRow
            label="Sitemap"
            value={indexing.sitemap}
            positiveLabel="Detected"
            negativeLabel="Missing"
          />
          <StatusRow
            label="OpenGraph tags"
            value={social.ogTags}
            positiveLabel="Configured"
            negativeLabel="Missing"
          />
          <StatusRow
            label="Twitter cards"
            value={social.twitterTags}
            positiveLabel="Configured"
            negativeLabel="Missing"
          />
        </div>
      </div>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-2">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function StatusRow({
  label,
  value,
  positiveLabel,
  negativeLabel,
}: {
  label: string;
  value: boolean;
  positiveLabel: string;
  negativeLabel: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-2">
      <span>{label}</span>
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
        {value ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 text-rose-500" />
        )}
        {value ? positiveLabel : negativeLabel}
      </span>
    </div>
  );
}

function ScanHistory({ history }: { history: HistoryItem[] }) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <h3 className="text-lg font-semibold">Recent scans</h3>
      {history.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
          No scan history yet.
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/60">
          <div className="grid grid-cols-4 gap-4 bg-background/60 px-4 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>Scan ID</span>
            <span>Verdict</span>
            <span>Score</span>
            <span>Date</span>
          </div>
          {history.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-4 gap-4 border-t border-border/60 px-4 py-3 text-sm text-foreground"
            >
              <span>{item.id}</span>
              <span>{item.verdict}</span>
              <span>{item.score}</span>
              <span>{item.date}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SkeletonCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-left">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-3 h-3 w-3/4 animate-pulse rounded-full bg-muted" />
      <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-muted" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

function LockedSection({
  locked,
  onUnlock,
  children,
}: {
  locked: boolean;
  onUnlock: () => void;
  children: React.ReactNode;
}) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-md opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-primary/30 bg-background/95 p-6 text-center shadow-lg backdrop-blur">
        <div className="max-w-xs">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Locked
          </div>
          <h3 className="mt-2 text-lg font-semibold">
            Unlock full report for $2.99
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Save $2.01 off the $5 list price. Get the complete issue list, AI
            recommendations, and PDF download.
          </p>
          <Button className="mt-4 w-full" onClick={onUnlock}>
            Unlock full report
          </Button>
        </div>
      </div>
    </div>
  );
}

function CompetitorScanner() {
  const [primaryUrl, setPrimaryUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [scanId, setScanId] = useState<number | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const normalizedPrimary = useMemo(() => normalizeUrl(primaryUrl), [primaryUrl]);
  const normalizedCompetitor = useMemo(
    () => normalizeUrl(competitorUrl),
    [competitorUrl]
  );

  useEffect(() => {
    setIsUnlocked(readReportUnlockState());
  }, []);

  const createScan = useMutation({
    mutationFn: (input: { url: string; competitorUrl: string }) =>
      createScanRequest(input.url, input.competitorUrl),
    onSuccess: (data) => {
      setScanId(data.scanId);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message ?? "Unable to start competitor scan.");
    },
  });

  const scanQuery = useQuery({
    queryKey: ["competitor-scan-result", scanId],
    queryFn: () => fetchScanResult(scanId as number),
    enabled: typeof scanId === "number",
    retry: 12,
    retryDelay: 1200,
  });

  useEffect(() => {
    if (!scanQuery.error) return;
    setErrorMessage((scanQuery.error as Error).message ?? "Competitor scan failed.");
  }, [scanQuery.error]);

  useEffect(() => {
    if (!scanQuery.data) return;
    setErrorMessage(null);
  }, [scanQuery.data]);

  const scanState: ScanState = scanQuery.data
    ? "results"
    : createScan.isPending || scanQuery.isFetching
      ? "scanning"
      : "idle";

  useEffect(() => {
    if (scanState !== "scanning") return;
    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % competitorSteps.length);
    }, 700);
    return () => clearInterval(interval);
  }, [scanState]);

  const handleCompare = () => {
    if (!normalizedPrimary || !normalizedCompetitor) {
      setErrorMessage("Enter both websites to compare.");
      return;
    }
    setErrorMessage(null);
    setScanId(null);
    setIsUnlocked(false);
    clearReportUnlock();
    createScan.mutate({ url: normalizedPrimary, competitorUrl: normalizedCompetitor });
  };

  const handleUnlock = () => {
    const checkoutLink = process.env.NEXT_PUBLIC_STRIPE_REPORT_LINK;
    if (checkoutLink) {
      window.location.href = checkoutLink;
      return;
    }
    setErrorMessage("Stripe checkout link is not configured.");
  };

  const primaryLabel = normalizedPrimary
    ? formatDomain(normalizedPrimary)
    : "your-site.com";
  const competitorLabel = normalizedCompetitor
    ? formatDomain(normalizedCompetitor)
    : "competitor.com";

  const reportData: ScanResultResponse["data"] | null = scanQuery.data?.data ?? null;
  const competitorPreview = reportData?.competitorPreview ?? null;
  const competitorAnalysis = reportData?.competitorAnalysis ?? null;

  const locked = reportData
    ? (reportData.locked ||
        reportData.preview.locked ||
        (competitorPreview?.locked ?? true)) &&
      !isUnlocked
    : true;

  const winner =
    reportData && competitorPreview
      ? reportData.preview.overall >= competitorPreview.overall
        ? "primary"
        : "competitor"
      : "competitor";

  return (
    <div className="space-y-10">
      <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Competitive scan
            </div>
            <h3 className="mt-2 text-2xl font-semibold">
              Compare your site against a top competitor
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Benchmark performance, SEO, and conversion gaps with an AI-powered
              comparison report.
            </p>
          </div>
          <Badge className="rounded-full px-4 py-2">Competitor scan</Badge>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
          <Input
            value={primaryUrl}
            onChange={(event) => setPrimaryUrl(event.target.value)}
            placeholder="yourwebsite.com"
            className="h-12 text-base"
          />
          <Input
            value={competitorUrl}
            onChange={(event) => setCompetitorUrl(event.target.value)}
            placeholder="competitor.com"
            className="h-12 text-base"
          />
          <Button
            size="lg"
            className="h-12 w-full min-w-[160px] justify-center whitespace-nowrap shadow-lg shadow-primary/20 md:w-44"
            onClick={handleCompare}
            disabled={scanState === "scanning"}
            aria-busy={scanState === "scanning"}
          >
            {scanState === "scanning" ? "Comparing..." : "Compare now"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 min-h-[20px] text-sm">
          {errorMessage ? (
            <p className="text-destructive">{errorMessage}</p>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 px-3 py-1 text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure comparison
          </span>
          <span className="rounded-full border border-sky-400/30 px-3 py-1 text-sky-600">
            Live benchmarks
          </span>
          <span className="rounded-full border border-amber-400/30 px-3 py-1 text-amber-600">
            Growth insights
          </span>
        </div>
      </Card>

      {scanState === "scanning" ? (
        <CompetitorLoader activeStep={competitorSteps[activeStep]} />
      ) : null}

      {scanState === "results" && reportData && competitorPreview ? (
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
                  AI benchmark report highlighting performance, SEO, and growth
                  gaps.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <Crown className="h-4 w-4" />
                {winner === "primary" ? primaryLabel : competitorLabel} leads
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <CompetitorScoreCard
              title="Your site"
              highlight={winner === "primary"}
              overall={reportData.preview.overall}
              categories={reportData.preview.categories}
              metrics={reportData.preview.metrics}
            />
            <CompetitorScoreCard
              title="Competitor"
              highlight={winner === "competitor"}
              overall={competitorPreview.overall}
              categories={competitorPreview.categories}
              metrics={competitorPreview.metrics}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <ComparisonCard
              title="Category comparison"
              primaryLabel={primaryLabel}
              competitorLabel={competitorLabel}
              rows={[
                {
                  label: "Performance",
                  primary: reportData.preview.categories.performance,
                  competitor: competitorPreview.categories.performance,
                },
                {
                  label: "SEO",
                  primary: reportData.preview.categories.seo,
                  competitor: competitorPreview.categories.seo,
                },
                {
                  label: "Accessibility",
                  primary: reportData.preview.categories.accessibility,
                  competitor: competitorPreview.categories.accessibility,
                },
                {
                  label: "Security",
                  primary: reportData.preview.categories.security,
                  competitor: competitorPreview.categories.security,
                },
              ]}
            />
            <CompetitorAnalysisCard
              scoreGap={competitorAnalysis?.scoreGap ?? 0}
              summary={competitorAnalysis?.summary ?? ""}
              actionItems={competitorAnalysis?.actionItems ?? []}
              locked={locked}
              onUnlock={handleUnlock}
            />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

function CompetitorScoreCard({
  title,
  highlight,
  overall,
  categories,
  metrics,
}: {
  title: string;
  highlight: boolean;
  overall: number;
  categories: ScanPreview["categories"];
  metrics: {
    loadTime: string;
    pageSize: string;
    images: number;
    scripts: number;
    links: number;
  };
}) {
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
      <div className="mt-5 grid gap-6 md:grid-cols-[160px_1fr] md:items-center">
        <CircularScore value={overall} />
        <div className="space-y-4 text-sm text-muted-foreground">
          <ScoreBar label="Performance" value={categories.performance} tone="emerald" />
          <ScoreBar label="SEO" value={categories.seo} tone="sky" />
          <ScoreBar label="Accessibility" value={categories.accessibility} tone="amber" />
          <ScoreBar label="Security" value={categories.security} tone="violet" />
        </div>
      </div>
      <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
        <MetricRow label="Load time" value={metrics.loadTime} />
        <MetricRow label="Page size" value={metrics.pageSize} />
        <MetricRow label="Images" value={metrics.images} />
        <MetricRow label="Scripts" value={metrics.scripts} />
        <MetricRow label="Links" value={metrics.links} />
      </div>
    </Card>
  );
}

function ComparisonCard({
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
            <ComparisonBar
              label={primaryLabel}
              value={row.primary}
              tone="emerald"
            />
            <ComparisonBar
              label={competitorLabel}
              value={row.competitor}
              tone="violet"
            />
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

function CompetitorAnalysisCard({
  scoreGap,
  summary,
  actionItems,
  locked,
  onUnlock,
}: {
  scoreGap: number;
  summary: string;
  actionItems: string[];
  locked: boolean;
  onUnlock: () => void;
}) {
  const visible = actionItems.slice(0, 2);
  const hidden = actionItems.slice(2);

  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">Competitive analysis</h4>
        <Badge variant="secondary">Gap {scoreGap}</Badge>
      </div>
      {summary ? (
        <p className="mt-4 text-sm text-muted-foreground">{summary}</p>
      ) : null}

      <div className="mt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
          <LineChart className="h-4 w-4" />
          Opportunity actions
        </div>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          {visible.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>

        {hidden.length > 0 ? (
          locked ? (
            <div className="mt-5">
              <LockedSection locked={true} onUnlock={onUnlock}>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {hidden.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </LockedSection>
            </div>
          ) : (
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {hidden.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>
    </Card>
  );
}

function CompetitorLoader({ activeStep }: { activeStep: string }) {
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

function normalizeUrl(value: string) {
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

function formatDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

function readReportUnlockState() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("success") === "1" || params.get("unlock") === "1") {
    window.localStorage.setItem(REPORT_UNLOCK_STORAGE_KEY, "true");
    return true;
  }
  return window.localStorage.getItem(REPORT_UNLOCK_STORAGE_KEY) === "true";
}

function clearReportUnlock() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REPORT_UNLOCK_STORAGE_KEY);
}

function readScanHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(SCAN_HISTORY_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is HistoryItem => {
        if (!item || typeof item !== "object") return false;
        const record = item as Record<string, unknown>;
        return (
          typeof record.id === "string" &&
          typeof record.score === "number" &&
          typeof record.date === "string" &&
          typeof record.verdict === "string"
        );
      })
      .slice(0, 10);
  } catch {
    return [];
  }
}

function writeScanHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    SCAN_HISTORY_STORAGE_KEY,
    JSON.stringify(items.slice(0, 10))
  );
}

function upsertScanHistory(existing: HistoryItem[], item: HistoryItem): HistoryItem[] {
  const without = existing.filter((entry) => entry.id !== item.id);
  return [item, ...without].slice(0, 10);
}

function buildPdfReport(data: {
  url: string;
  verdict: string;
  totalIssuesFound: number;
  overall: number;
  categories: ScanPreview["categories"];
  issues: Issue[];
  suggestions: string[];
}) {
  const lines = [
    "AI Website Audit Report",
    `URL: ${data.url}`,
    `Verdict: ${data.verdict}`,
    `Total Issues Found: ${data.totalIssuesFound}`,
    `Overall Score: ${data.overall}`,
    `Performance: ${data.categories.performance}`,
    `SEO: ${data.categories.seo}`,
    `Accessibility: ${data.categories.accessibility}`,
    `Security: ${data.categories.security}`,
    "",
    "Issues:",
    ...data.issues.map((issue) => `- ${issue.title} (${issue.severity})`),
    "",
    "Recommendations:",
    ...(data.suggestions.length > 0
      ? data.suggestions.map((item) => `- ${item}`)
      : ["- No recommendations available."]),
  ];

  const encoder = new TextEncoder();
  const text = lines
    .map((line, index) => {
      const y = 750 - index * 16;
      return `BT /F1 12 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join("\n");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${encoder.encode(text).length} >>\nstream\n${text}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  let offset = encoder.encode(pdf).length;
  let xref = "xref\n0 6\n0000000000 65535 f \n";

  objects.forEach((obj) => {
    xref += `${offset.toString().padStart(10, "0")} 00000 n \n`;
    pdf += obj;
    offset += encoder.encode(obj).length;
  });

  const xrefOffset = offset;
  pdf += `${xref}trailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
