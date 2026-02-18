"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const scanSteps = [
  "Analyzing SEO structure...",
  "Checking performance bottlenecks...",
  "Reviewing accessibility signals...",
  "Generating AI report...",
];

const mockReport = {
  overall: 84,
  categories: {
    performance: 78,
    seo: 88,
    accessibility: 73,
    security: 92,
  },
  issues: [
    {
      id: "issue-1",
      title: "Largest Contentful Paint above 3s",
      severity: "High",
      suggestion: "Compress hero media and defer offscreen images.",
    },
    {
      id: "issue-2",
      title: "Missing meta description on 4 pages",
      severity: "Medium",
      suggestion: "Add unique meta descriptions targeting primary keywords.",
    },
    {
      id: "issue-3",
      title: "Low contrast CTA button",
      severity: "Low",
      suggestion: "Increase contrast ratio to meet WCAG 2.1 AA.",
    },
  ],
  suggestions: [
    "Reduce unused JavaScript and split critical bundles.",
    "Add structured data for product and FAQ pages.",
    "Optimize CLS by reserving space for images and banners.",
    "Improve above-the-fold messaging clarity and CTA placement.",
  ],
  history: [
    { id: "SCAN-2014", score: 84, date: "2026-02-18", verdict: "Good" },
    { id: "SCAN-2013", score: 76, date: "2026-02-16", verdict: "Needs Work" },
    { id: "SCAN-2012", score: 90, date: "2026-02-10", verdict: "Excellent" },
  ],
};

type ScanState = "idle" | "scanning" | "results";

type Issue = (typeof mockReport.issues)[number];

type HistoryItem = (typeof mockReport.history)[number];

export default function ScannerClient() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [urlValue, setUrlValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1" || params.get("unlock") === "1") {
      setIsUnlocked(true);
      window.localStorage.setItem("report_unlocked", "true");
      return;
    }
    if (window.localStorage.getItem("report_unlocked") === "true") {
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (scanState !== "scanning") return;

    setActiveStep(0);
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % scanSteps.length);
    }, 700);

    const finishTimer = setTimeout(() => {
      clearInterval(stepTimer);
      setScanState("results");
    }, 2200);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(finishTimer);
    };
  }, [scanState]);

  useEffect(() => {
    if (scanState !== "results") return;
    const node = document.getElementById("scan-report");
    if (!node) return;
    const headerOffset = 80;
    const top = node.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  }, [scanState]);

  const normalizedUrl = useMemo(() => {
    const trimmed = urlValue.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }, [urlValue]);

  const handleScan = () => {
    if (!normalizedUrl) {
      setErrorMessage("Please enter a website URL.");
      return;
    }
    setErrorMessage(null);
    setIsUnlocked(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("report_unlocked");
    }
    setScanState("scanning");
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
    const pdf = buildPdfReport({
      url: normalizedUrl,
      overall: mockReport.overall,
      categories: mockReport.categories,
      issues: mockReport.issues,
      suggestions: mockReport.suggestions,
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(pdf);
    link.download = "ai-website-audit-report.pdf";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleReset = () => {
    setScanState("idle");
  };

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
          <ScanInput
            urlValue={urlValue}
            onUrlChange={setUrlValue}
            onScan={handleScan}
            scanning={scanState === "scanning"}
            errorMessage={errorMessage}
          />
        </div>

        {scanState === "scanning" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ScanLoader activeStep={scanSteps[activeStep]} />
          </motion.div>
        )}

        {scanState === "results" && (
          <motion.div
            id="scan-report"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-14 space-y-10"
          >
            <ResultsHeader
              url={normalizedUrl}
              overall={mockReport.overall}
              onReset={handleReset}
              unlocked={isUnlocked}
              onDownload={handleDownload}
              onUnlock={handleUnlock}
            />
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <ScoreOverview
                overall={mockReport.overall}
                categories={mockReport.categories}
              />
              <LockedSection locked={!isUnlocked} onUnlock={handleUnlock}>
                <AiSuggestions suggestions={mockReport.suggestions} />
              </LockedSection>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <LockedSection locked={!isUnlocked} onUnlock={handleUnlock}>
                <IssuesList issues={mockReport.issues} />
              </LockedSection>
              <LockedSection locked={!isUnlocked} onUnlock={handleUnlock}>
                <MetricsCard />
              </LockedSection>
            </div>
            <LockedSection locked={!isUnlocked} onUnlock={handleUnlock}>
              <ScanHistory history={mockReport.history} />
            </LockedSection>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}

function Hero() {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
        <Sparkles className="h-4 w-4 text-emerald-500" />
        AI Website Scanner
      </div>
      <h1 className="mt-6 font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        AI Website Audit Tool
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        Scan your website in 60 seconds and get an AI-powered report covering
        performance, SEO, accessibility, and security.
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
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label className="text-sm font-semibold text-foreground">
            Website URL
          </label>
          <Input
            value={urlValue}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="example.com"
            className="mt-2 h-12 text-base"
          />
          {errorMessage && (
            <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
          )}
        </div>
        <Button
          size="lg"
          className="h-12 w-full shadow-lg shadow-primary/20 md:w-auto"
          onClick={onScan}
          disabled={scanning}
        >
          {scanning ? "Scanning..." : "Scan Now"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
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
  onReset,
  unlocked,
  onDownload,
  onUnlock,
}: {
  url: string;
  overall: number;
  onReset: () => void;
  unlocked: boolean;
  onDownload: () => void;
  onUnlock: () => void;
}) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Audit Report
          </div>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{url}</h2>
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
  categories: {
    performance: number;
    seo: number;
    accessibility: number;
    security: number;
  };
}) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <h3 className="text-lg font-semibold">Overall health</h3>
      <div className="mt-5 grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
        <CircularScore value={overall} />
        <div className="space-y-4 text-sm text-muted-foreground">
          <ScoreBar label="Performance" value={categories.performance} tone="emerald" />
          <ScoreBar label="SEO" value={categories.seo} tone="sky" />
          <ScoreBar label="Accessibility" value={categories.accessibility} tone="amber" />
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

function IssuesList({ issues }: { issues: Issue[] }) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Issues found</h3>
        <Badge variant="secondary">{issues.length} items</Badge>
      </div>
      <div className="mt-5 space-y-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="rounded-2xl border border-border/60 bg-background/60 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{issue.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {issue.suggestion}
                </p>
              </div>
              <SeverityBadge severity={issue.severity} />
            </div>
          </div>
        ))}
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

function AiSuggestions({ suggestions }: { suggestions: string[] }) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
        <Zap className="h-4 w-4" />
        AI Recommendations
      </div>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        {suggestions.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MetricsCard() {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold text-sky-600">
        <BarChart3 className="h-4 w-4" />
        Scan metrics
      </div>
      <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
        <MetricRow label="Response time" value="1.8s" />
        <MetricRow label="Total requests" value="96" />
        <MetricRow label="Page weight" value="1.2 MB" />
        <MetricRow label="Accessibility checks" value="42" />
      </div>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-2">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ScanHistory({ history }: { history: HistoryItem[] }) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <h3 className="text-lg font-semibold">Recent scans</h3>
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

function buildPdfReport(data: {
  url: string;
  overall: number;
  categories: {
    performance: number;
    seo: number;
    accessibility: number;
    security: number;
  };
  issues: Issue[];
  suggestions: string[];
}) {
  const lines = [
    "AI Website Audit Report",
    `URL: ${data.url}`,
    `Overall Score: ${data.overall}`,
    `Performance: ${data.categories.performance}`,
    `SEO: ${data.categories.seo}`,
    `Accessibility: ${data.categories.accessibility}`,
    `Security: ${data.categories.security}`,
    "",
    "Issues:",
    ...data.issues.map(
      (issue) => `- ${issue.title} (${issue.severity})`
    ),
    "",
    "Recommendations:",
    ...data.suggestions.map((item) => `- ${item}`),
  ];

  const text = lines.map((line, index) => {
    const y = 750 - index * 16;
    return `BT /F1 12 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
  }).join("\n");

  const encoder = new TextEncoder();
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
            Get the complete issue list, AI recommendations, and full scan
            history.
          </p>
          <Button className="mt-4 w-full" onClick={onUnlock}>
            Unlock full report
          </Button>
        </div>
      </div>
    </div>
  );
}
