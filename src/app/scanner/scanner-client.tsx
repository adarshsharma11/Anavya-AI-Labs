"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";

type ScanIssue = {
  id: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  suggestion: string;
};

type ScanReport = {
  url: string;
  scores: {
    overall: number;
    seo: number;
    performance: number;
    security: number;
  };
  issues: ScanIssue[];
  suggestions: {
    improvements: string[];
    growth: string[];
    conversion: string[];
  };
};

const steps = [
  "Analyzing SEO...",
  "Checking performance...",
  "AI generating report...",
  "Preparing insights...",
];

const exampleUrls = [
  "https://stripe.com",
  "https://vercel.com",
  "https://shopify.com",
];

export default function ScannerClient() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const [scanState, setScanState] = useState<
    "idle" | "scanning" | "lead" | "report" | "error"
  >("idle");
  const [urlInput, setUrlInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    company: "",
  });
  const [leadEmail, setLeadEmail] = useState<string | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);

  useEffect(() => {
    if (scanState !== "scanning") return;

    setStepIndex(0);
    setProgress(10);
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1800);
    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 5));
    }, 350);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, [scanState]);

  const normalizedUrl = useMemo(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }, [urlInput]);

  const validateUrl = (value: string) => {
    try {
      // eslint-disable-next-line no-new
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleScan = async () => {
    setErrorMessage(null);
    const url = normalizedUrl;
    if (!url) {
      setErrorMessage("Please enter a website URL.");
      return;
    }
    if (!validateUrl(url)) {
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    setScanState("scanning");
    try {
      const response = await fetch(buildApiUrl(apiBase, "/api/scan/start"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, email: leadEmail ?? undefined }),
      });

      if (!response.ok) {
        throw new Error("Scan failed. Please try again.");
      }

      const data = (await response.json()) as ScanReport;
      setReport(data);
      setProgress(100);
      setScanState("lead");
      setLeadModalOpen(true);
    } catch (error) {
      setScanState("error");
      setProgress(0);
      setErrorMessage(
        error instanceof Error ? error.message : "Scan failed. Please try again."
      );
    }
  };

  const handleLeadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLeadError(null);
    if (!leadForm.name.trim() || !leadForm.email.trim()) {
      setLeadError("Please enter your name and email.");
      return;
    }

    try {
      const response = await fetch(buildApiUrl(apiBase, "/api/lead"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...leadForm,
          url: report?.url ?? normalizedUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save lead. Please try again.");
      }

      setLeadEmail(leadForm.email);
      setLeadModalOpen(false);
      setScanState("report");
    } catch (error) {
      setLeadError(
        error instanceof Error ? error.message : "Unable to save lead."
      );
    }
  };

  const handleUpgrade = async () => {
    if (!leadEmail) {
      setLeadModalOpen(true);
      setLeadError("Enter your email to continue.");
      return;
    }

    const response = await fetch(buildApiUrl(apiBase, "/api/billing/checkout"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: leadEmail }),
    });

    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      setLeadModalOpen(true);
      setLeadError(data.error ?? "Unable to start checkout.");
      return;
    }

    window.location.href = data.url;
  };

  const scores = report?.scores ?? {
    overall: 0,
    seo: 0,
    performance: 0,
    security: 0,
  };

  const issues = report?.issues ?? [];
  const suggestions = report?.suggestions ?? {
    improvements: [],
    growth: [],
    conversion: [],
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
        {scanState !== "report" && (
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              AI Website Audit Tool
            </div>
            <h1 className="mt-6 font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              AI Website Audit Tool
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Scan your website in 60 seconds to uncover performance, SEO, and
              security issues.
            </p>
          </div>
        )}

        {scanState === "idle" && (
          <div className="mx-auto mt-10 max-w-4xl">
            <Card className="border-border/60 bg-background/80 p-6 shadow-lg md:p-8">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <label className="text-sm font-semibold text-foreground">
                    Website URL
                  </label>
                  <Input
                    value={urlInput}
                    onChange={(event) => setUrlInput(event.target.value)}
                    placeholder="example.com"
                    className="mt-2 h-12 text-base"
                  />
                  {errorMessage && (
                    <p className="mt-2 text-sm text-destructive">
                      {errorMessage}
                    </p>
                  )}
                </div>
                <Button
                  size="lg"
                  className="h-12 w-full md:w-auto"
                  onClick={handleScan}
                >
                  Scan now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Secure & private
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
                  AI powered
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
                  Free scan
                </span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>Try:</span>
                {exampleUrls.map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
                    onClick={() => setUrlInput(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {scanState === "scanning" && (
          <div className="mx-auto mt-12 max-w-4xl">
            <Card className="border-border/60 bg-background/80 p-10 text-center shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">
                {steps[stepIndex]}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                AI is scanning {normalizedUrl}
              </p>
              <Progress value={progress} className="mt-6" />
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                {steps.map((step, index) => (
                  <span
                    key={step}
                    className={`rounded-full border px-3 py-1 ${
                      index === stepIndex
                        ? "border-primary text-primary"
                        : "border-border/60"
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        )}

        {scanState === "lead" && report && (
          <div className="mx-auto mt-12 max-w-3xl">
            <Card className="border-border/60 bg-background/80 p-8 text-center shadow-lg">
              <h2 className="text-2xl font-semibold">Your report is ready</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email to view the full AI audit report.
              </p>
              <Button className="mt-6" onClick={() => setLeadModalOpen(true)}>
                Unlock report
              </Button>
            </Card>
          </div>
        )}

        {scanState === "error" && (
          <div className="mx-auto mt-12 max-w-3xl">
            <Card className="border-border/60 bg-background/80 p-8 text-center shadow-lg">
              <h2 className="text-xl font-semibold">Scan failed</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {errorMessage ?? "We couldn't scan that URL. Please try again."}
              </p>
              <Button
                className="mt-6"
                variant="outline"
                onClick={() => setScanState("idle")}
              >
                Try again
              </Button>
            </Card>
          </div>
        )}

        {scanState === "report" && report && (
          <div className="mx-auto mt-6 max-w-6xl space-y-10">
            <div className="rounded-3xl border border-border/60 bg-background/80 p-8 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Audit Report
                  </div>
                  <h2 className="mt-2 text-3xl font-bold">
                    {report.url}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="rounded-full px-4 py-2">
                    Overall score {scores.overall}
                  </Badge>
                  <Button variant="outline" onClick={() => setScanState("idle")}>
                    Scan another
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {[
                  { label: "Overall", value: scores.overall },
                  { label: "SEO", value: scores.seo },
                  { label: "Performance", value: scores.performance },
                  { label: "Security", value: scores.security },
                ].map((item) => (
                  <Card
                    key={item.label}
                    className="border-border/60 bg-background/70 p-5 text-center shadow-sm"
                  >
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="mt-3 text-3xl font-semibold tabular-nums">
                      {item.value}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Priority issues</h3>
                <div className="grid gap-4">
                  {issues.map((issue) => (
                    <Card
                      key={issue.id}
                      className="border-border/60 bg-background/80 p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">
                            {issue.title}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {issue.suggestion}
                          </p>
                        </div>
                        <Badge variant="secondary">{issue.severity}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Card className="border-border/60 bg-background/80 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Wand2 className="h-4 w-4 text-primary" />
                    AI Suggestions
                  </div>
                  <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em]">
                        Improvements
                      </div>
                      <ul className="mt-2 space-y-2">
                        {suggestions.improvements.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em]">
                        Growth
                      </div>
                      <ul className="mt-2 space-y-2">
                        {suggestions.growth.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em]">
                        Conversion
                      </div>
                      <ul className="mt-2 space-y-2">
                        {suggestions.conversion.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="border-border/60 bg-background/80 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold">
                    Want us to fix these issues?
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Get a tailored action plan from our performance and growth
                    team.
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    <Button asChild size="lg">
                      <Link href="/services">Book free consultation</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="https://wa.me/">WhatsApp us</Link>
                    </Button>
                    <Button asChild variant="ghost" size="lg">
                      <Link href="/portfolio">Hire Anavya AI Labs</Link>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 p-8 shadow-lg">
              <div className="absolute inset-0 backdrop-blur-md" />
              <div className="relative">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Upgrade to Pro
                </div>
                <h3 className="mt-2 text-2xl font-semibold">
                  Unlock the full report
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Competitor analysis</li>
                  <li>• Full SEO fix guide</li>
                  <li>• Downloadable PDF</li>
                </ul>
                <Button className="mt-6" onClick={handleUpgrade}>
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      <Dialog open={leadModalOpen} onOpenChange={setLeadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View your report</DialogTitle>
            <DialogDescription>
              Enter your details to unlock the full AI audit report.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Name</label>
              <Input
                value={leadForm.name}
                onChange={(event) =>
                  setLeadForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Your name"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Email</label>
              <Input
                value={leadForm.email}
                onChange={(event) =>
                  setLeadForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="you@company.com"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Company (optional)</label>
              <Input
                value={leadForm.company}
                onChange={(event) =>
                  setLeadForm((prev) => ({
                    ...prev,
                    company: event.target.value,
                  }))
                }
                placeholder="Company name"
                className="mt-2"
              />
            </div>
            {leadError && (
              <p className="text-sm text-destructive">{leadError}</p>
            )}
            <Button type="submit" className="w-full">
              View report
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function buildApiUrl(base: string, path: string) {
  if (!base) return path;
  return `${base}${path}`;
}
