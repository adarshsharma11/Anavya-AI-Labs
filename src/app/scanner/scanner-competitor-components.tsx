"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Crown, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  createScanRequest,
  fetchScanResult,
  type ScanResultResponse,
} from "@/lib/api/scan";
import { useRazorpayPayment } from "@/hooks/use-razorpay-payment";
import { generateCompetitorReportPdf } from "@/lib/pdf/scan-report-pdf";
import {
  competitorSteps,
  REPORT_UNLOCK_AMOUNT,
  REPORT_UNLOCK_PRICE_LABEL,
} from "./scanner-constants";
import {
  clearReportUnlock,
  formatDomain,
  getComparableSiteKey,
  hasReportContent,
  hasReportUnlockEmail,
  normalizeUrl,
  readReportUnlockEmail,
  readReportUnlockState,
  setReportUnlock,
  setReportUnlockEmail,
} from "./scanner-utils";
import type { ScanState } from "./scanner-types";
import {
  AiSuggestions,
  CompetitorAnalysisCard,
  QuickWinsCard,
  UnlockEmailCaptureDialog,
} from "./scanner-shared-components";
import {
  ComparisonCard,
  CompetitorLoader,
  CompetitorScoreCard,
} from "./scanner-competitor-cards";
import { FullReportSection } from "./scanner-website-components";

export function CompetitorScanner() {
  const [primaryUrl, setPrimaryUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [scanId, setScanId] = useState<number | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUrlStateReady, setIsUrlStateReady] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState("");
  const [pendingUnlockScanId, setPendingUnlockScanId] = useState<number | null>(null);
  const [emailPromptShownBeforeUnlock, setEmailPromptShownBeforeUnlock] = useState(false);
  const { isPaying, isFinalizingReport, startPayment } = useRazorpayPayment();
  const { toast } = useToast();
  const unlockingLabel = isFinalizingReport
    ? "Finalizing unlocked report..."
    : "Processing payment...";
  const queryClient = useQueryClient();

  const normalizedPrimary = useMemo(() => normalizeUrl(primaryUrl), [primaryUrl]);
  const normalizedCompetitor = useMemo(
    () => normalizeUrl(competitorUrl),
    [competitorUrl]
  );

  useEffect(() => {
    setIsUnlocked(readReportUnlockState());
    setCapturedEmail(readReportUnlockEmail());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "competitor") {
        const idParam = params.get("id") ?? params.get("scanId");
        const parsedId = idParam ? Number(idParam) : NaN;
        if (Number.isFinite(parsedId) && parsedId > 0) {
          setScanId(parsedId);
        }
      }
    }
    setIsUrlStateReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isUrlStateReady) return;

    const url = new URL(window.location.href);
    url.searchParams.set("tab", "competitor");
    if (scanId && scanId > 0) {
      url.searchParams.set("id", String(scanId));
    } else {
      url.searchParams.delete("id");
    }
    window.history.replaceState({}, "", url.toString());
  }, [scanId, isUrlStateReady]);

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

    const primaryKey = getComparableSiteKey(normalizedPrimary);
    const competitorKey = getComparableSiteKey(normalizedCompetitor);
    if (primaryKey && competitorKey && primaryKey === competitorKey) {
      setErrorMessage("Please enter a different competitor website.");
      return;
    }

    setErrorMessage(null);
    setScanId(null);
    setIsUnlocked(false);
    clearReportUnlock();
    createScan.mutate({ url: normalizedPrimary, competitorUrl: normalizedCompetitor });
  };

  const runUnlockPayment = (currentScanId: number) => {
    startPayment({
      scanId: currentScanId,
      amount: REPORT_UNLOCK_AMOUNT,
      onSuccess: (updatedScan) => {
        queryClient.setQueryData(
          ["competitor-scan-result", currentScanId],
          updatedScan
        );
        void queryClient.invalidateQueries({
          queryKey: ["competitor-scan-result", currentScanId],
        });
        setReportUnlock();
        setIsUnlocked(true);
        if (!hasReportUnlockEmail() && !emailPromptShownBeforeUnlock) {
          setShowEmailCapture(true);
        }
        setEmailPromptShownBeforeUnlock(false);
        setErrorMessage(null);
      },
      onError: (message) => {
        setEmailPromptShownBeforeUnlock(false);
        setErrorMessage(message);
      },
    });
  };

  const handleUnlock = () => {
    const currentScanId = scanQuery.data?.data?.id ?? scanId;
    if (!currentScanId) {
      setErrorMessage("Run a scan before unlocking the full report.");
      return;
    }

    setErrorMessage(null);
    if (!hasReportUnlockEmail()) {
      setEmailPromptShownBeforeUnlock(true);
      setPendingUnlockScanId(currentScanId);
      setShowEmailCapture(true);
      return;
    }

    runUnlockPayment(currentScanId);
  };

  const continuePendingUnlock = () => {
    if (!pendingUnlockScanId) return;
    const nextScanId = pendingUnlockScanId;
    setPendingUnlockScanId(null);
    runUnlockPayment(nextScanId);
  };

  const handleDownload = async () => {
    if (!reportData || locked) return;
    setIsDownloading(true);
    try {
      await generateCompetitorReportPdf(reportData);
    } catch {
      setErrorMessage("Failed to download competitor PDF report.");
    } finally {
      setIsDownloading(false);
    }
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
  const fullReport =
    reportData?.fullReport ?? reportData?.aiReport ?? reportData?.report ?? null;
  const hasFullReportContent = hasReportContent(fullReport);
  const aiSuggestions = competitorAnalysis?.actionItems ?? [];
  const otherSuggestions = Array.from(
    new Set([...(reportData?.preview.quickWins ?? []), ...(competitorPreview?.quickWins ?? [])])
  );

  const locked = reportData
    ? (reportData.locked ||
        reportData.preview.locked ||
        (competitorPreview?.locked ?? true)) &&
      !isUnlocked
    : true;

  useEffect(() => {
    if (!scanId || !isUnlocked || hasFullReportContent) return;
    let attempts = 0;
    const maxAttempts = 20;
    const interval = window.setInterval(() => {
      attempts += 1;
      void queryClient.invalidateQueries({
        queryKey: ["competitor-scan-result", scanId],
      });
      if (attempts >= maxAttempts) {
        window.clearInterval(interval);
      }
    }, 1500);

    return () => window.clearInterval(interval);
  }, [scanId, isUnlocked, hasFullReportContent, queryClient]);

  const winner =
    reportData && competitorPreview
      ? reportData.preview.overall >= competitorPreview.overall
        ? "primary"
        : "competitor"
      : "competitor";

  return (
    <div className="space-y-10">
      <UnlockEmailCaptureDialog
        open={showEmailCapture}
        defaultEmail={capturedEmail}
        title={
          pendingUnlockScanId
            ? "Unlock full report"
            : "✅ Report unlocked"
        }
        description="Enter email to access anytime"
        saveLabel={pendingUnlockScanId ? "Save & continue" : "Save email"}
        onOpenChange={(open) => {
          setShowEmailCapture(open);
          if (!open) {
            continuePendingUnlock();
          }
        }}
        onSkip={() => {
          continuePendingUnlock();
          setShowEmailCapture(false);
        }}
        onSave={(email) => {
          setReportUnlockEmail(email);
          setCapturedEmail(email);
          continuePendingUnlock();
          setShowEmailCapture(false);
          toast({
            title: "Email saved",
            description: "You can use this email to access your unlocked report anytime.",
          });
        }}
      />
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
              {!locked ? (
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? "Generating..." : "Download PDF"}
                </Button>
              ) : null}
            </div>
          </Card>

          {!locked ? (
            <FullReportSection report={fullReport} pending={!hasFullReportContent} />
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <CompetitorScoreCard
              title="Your site"
              highlight={winner === "primary"}
              preview={reportData.preview}
              locked={locked}
              onUnlock={handleUnlock}
              unlocking={isPaying}
              unlockingLabel={unlockingLabel}
            />
            <CompetitorScoreCard
              title="Competitor"
              highlight={winner === "competitor"}
              preview={competitorPreview}
              locked={locked}
              onUnlock={handleUnlock}
              unlocking={isPaying}
              unlockingLabel={unlockingLabel}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <QuickWinsCard
              title="Your quick wins"
              wins={reportData.preview.quickWins}
              locked={locked}
              onUnlock={handleUnlock}
              unlockPriceLabel={REPORT_UNLOCK_PRICE_LABEL}
              unlocking={isPaying}
              unlockingLabel={unlockingLabel}
            />
            <QuickWinsCard
              title="Competitor quick wins"
              wins={competitorPreview.quickWins}
              locked={locked}
              onUnlock={handleUnlock}
              unlockPriceLabel={REPORT_UNLOCK_PRICE_LABEL}
              unlocking={isPaying}
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
              unlockPriceLabel={REPORT_UNLOCK_PRICE_LABEL}
              unlocking={isPaying}
              unlockingLabel={unlockingLabel}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AiSuggestions
              title="AI suggestions"
              suggestions={aiSuggestions}
              locked={locked}
              onUnlock={handleUnlock}
              unlockPriceLabel={REPORT_UNLOCK_PRICE_LABEL}
              unlocking={isPaying}
              unlockingLabel={unlockingLabel}
              description="AI-generated opportunities from your competitor comparison report."
            />
            <AiSuggestions
              title="Other suggestions"
              suggestions={otherSuggestions}
              locked={locked}
              onUnlock={handleUnlock}
              unlockPriceLabel={REPORT_UNLOCK_PRICE_LABEL}
              unlocking={isPaying}
              unlockingLabel={unlockingLabel}
              description="Combined improvement suggestions from both websites."
            />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
