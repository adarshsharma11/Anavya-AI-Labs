"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { usePolling } from "@/hooks/use-polling";
import {
  createScanRequest,
  fetchScanResult,
  getAuditPreview,
  getCompetitorAuditPreview,
  getLegacyCompetitorPreview,
  getLegacyPreview,
} from "@/lib/api/scan";
import { shouldStopScanPolling } from "@/lib/scan/polling";
import { isApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";
import { usePaymentQuote } from "@/hooks/use-payment-quote";
import { usePdfDownload } from "@/hooks/use-pdf-download";
import { useRazorpayPayment } from "@/hooks/use-razorpay-payment";
import { competitorSteps } from "./scanner-constants";
import {
  clearReportUnlock,
  formatDomain,
  getValidScanUrl,
  getComparableSiteKey,
  hasReportContent,
  readReportUnlockEmail,
  readReportUnlockState,
  setReportUnlockEmail,
} from "./scanner-utils";
import type { ScanState } from "./scanner-types";
import { UnlockEmailCaptureDialog } from "./scanner-shared-components";
import { CompetitorLoader } from "./scanner-competitor-cards";
import {
  CompetitorLegacyResults,
  CompetitorV2Results,
} from "./scanner-competitor-results";

export function CompetitorScanner({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const [primaryUrl, setPrimaryUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [scanId, setScanId] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUrlStateReady, setIsUrlStateReady] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState("");
  const [pendingUnlockScanId, setPendingUnlockScanId] = useState<string | null>(null);
  const { user } = useAuth();
  const [emailPromptShownBeforeUnlock, setEmailPromptShownBeforeUnlock] = useState(false);
  const { isPaying, isFinalizingReport, startPayment } = useRazorpayPayment();
  const { priceLabel: unlockPriceLabel } = usePaymentQuote();
  const pdf = usePdfDownload();
  const { toast } = useToast();
  const unlockingLabel = isFinalizingReport
    ? "Finalizing unlocked report..."
    : "Processing payment...";

  const primaryValidation = useMemo(() => getValidScanUrl(primaryUrl), [primaryUrl]);
  const competitorValidation = useMemo(
    () => getValidScanUrl(competitorUrl),
    [competitorUrl]
  );
  const normalizedPrimary = primaryValidation.valid ? primaryValidation.normalized : "";
  const normalizedCompetitor = competitorValidation.valid
    ? competitorValidation.normalized
    : "";

  useEffect(() => {
    setIsUnlocked(readReportUnlockState());
    setCapturedEmail(readReportUnlockEmail());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (standalone || tab === "competitor") {
        const idParam = params.get("id") ?? params.get("scanId");
        if (idParam) {
          setScanId(idParam);
        }
      }
    }
    setIsUrlStateReady(true);
  }, [standalone]);

  useEffect(() => {
    if (typeof window === "undefined" || !isUrlStateReady) return;

    const url = new URL(window.location.href);
    if (!standalone) {
      url.searchParams.set("tab", "competitor");
    }
    if (scanId) {
      url.searchParams.set("id", scanId);
    } else {
      url.searchParams.delete("id");
    }
    if (standalone) {
      url.searchParams.delete("tab");
      url.searchParams.delete("reportTab");
      url.searchParams.delete("competitorReportTab");
    }
    window.history.replaceState({}, "", url.toString());
  }, [scanId, isUrlStateReady, standalone]);

  const createScan = useMutation({
    mutationFn: (input: { url: string; competitorUrl: string }) =>
      createScanRequest(input.url, input.competitorUrl),
    onSuccess: (data) => {
      setScanId(data.publicId);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message ?? "Unable to start competitor scan.");
    },
  });

  const fetchScan = useCallback(
    (signal: AbortSignal) => fetchScanResult(scanId as string, { signal }),
    [scanId]
  );

  const scanPoll = usePolling(fetchScan, {
    enabled: Boolean(scanId),
    interval: 1500,
    maxInterval: 5000,
    backoffAfterMs: 30_000,
    stopWhen: shouldStopScanPolling,
  });

  useEffect(() => {
    if (!scanPoll.error) return;
    setErrorMessage(scanPoll.error.message ?? "Competitor scan failed.");
  }, [scanPoll.error]);

  useEffect(() => {
    if (!scanPoll.data) return;
    setErrorMessage(null);
  }, [scanPoll.data]);

  const reportData = scanPoll.data ?? null;
  const primaryAudit = getAuditPreview(reportData);
  const competitorAudit = getCompetitorAuditPreview(reportData);
  const preview = getLegacyPreview(reportData);
  const competitorPreview = getLegacyCompetitorPreview(reportData);
  const hasResults = Boolean(primaryAudit || competitorAudit || preview);
  const scanState: ScanState = hasResults
    ? "results"
    : createScan.isPending || Boolean(scanId)
      ? "scanning"
      : "idle";
  const stillUpdating = Boolean(reportData) && !shouldStopScanPolling(reportData ?? undefined);

  useEffect(() => {
    if (!reportData) return;
    if (!primaryUrl && reportData.url) setPrimaryUrl(reportData.url);
    if (!competitorUrl && reportData.competitorUrl) {
      setCompetitorUrl(reportData.competitorUrl);
    }
  }, [competitorUrl, primaryUrl, reportData]);

  useEffect(() => {
    if (scanState !== "scanning") return;
    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % competitorSteps.length);
    }, 700);
    return () => clearInterval(interval);
  }, [scanState]);

  const handleCompare = () => {
    if (!primaryUrl.trim() || !competitorUrl.trim()) {
      setErrorMessage("Enter both websites to compare.");
      return;
    }

    if (!primaryValidation.valid) {
      setErrorMessage(primaryValidation.error);
      return;
    }

    if (!competitorValidation.valid) {
      setErrorMessage(competitorValidation.error);
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

  const runUnlockPayment = (currentScanId: string, email: string) => {
    startPayment({
      scanId: currentScanId,
      email,
      onSuccess: () => {
        void scanPoll.refetch();
        setIsUnlocked(true);
        setEmailPromptShownBeforeUnlock(false);
        setErrorMessage(null);
      },
      onError: (error) => {
        setEmailPromptShownBeforeUnlock(false);
        setErrorMessage(isApiError(error) ? error.message : "Payment failed.");
      },
    });
  };

  const handleUnlock = () => {
    const currentScanId = reportData?.publicId ?? scanId;
    if (!currentScanId) {
      setErrorMessage("Run a scan before unlocking the full report.");
      return;
    }

    setErrorMessage(null);
    const email = capturedEmail || user?.email || "";
    if (!email) {
      setEmailPromptShownBeforeUnlock(true);
      setPendingUnlockScanId(currentScanId);
      setShowEmailCapture(true);
      return;
    }

    runUnlockPayment(currentScanId, email);
  };

  const continuePendingUnlock = () => {
    if (!pendingUnlockScanId) return;
    const nextScanId = pendingUnlockScanId;
    setPendingUnlockScanId(null);
    runUnlockPayment(nextScanId, capturedEmail || user?.email || "");
  };

  const handleDownload = () => {
    if (!reportData || !scanId) return;
    void pdf.download(scanId, reportData.url, primaryAudit);
  };

  const primaryLabel = formatDomain(
    reportData?.url || normalizedPrimary || "your-site.com"
  );
  const competitorLabel = formatDomain(
    reportData?.competitorUrl || normalizedCompetitor || "competitor.com"
  );
  const fullReport = reportData?.fullReport ?? null;
  const hasFullReportContent = hasReportContent(fullReport);
  const locked = reportData
    ? (reportData.locked || !reportData.isUnlocked) && !isUnlocked
    : true;

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

      {scanState === "results" && reportData && primaryAudit ? (
        <CompetitorV2Results
          scan={reportData}
          primary={primaryAudit}
          competitor={competitorAudit}
          primaryLabel={primaryLabel}
          competitorLabel={competitorLabel}
          stillUpdating={stillUpdating}
          locked={locked}
          onUnlock={handleUnlock}
          unlockPriceLabel={unlockPriceLabel}
          unlocking={isPaying}
          unlockingLabel={unlockingLabel}
          onDownload={handleDownload}
          isDownloading={pdf.isDownloading || pdf.isPreparing}
        />
      ) : null}

      {pdf.error && scanState === "results" ? (
        <p className="text-sm text-muted-foreground" role="status">
          {pdf.error}
        </p>
      ) : null}

      {scanState === "results" && reportData && preview && competitorPreview ? (
        <CompetitorLegacyResults
          reportData={reportData}
          preview={preview}
          competitorPreview={competitorPreview}
          primaryLabel={primaryLabel}
          competitorLabel={competitorLabel}
          locked={locked}
          onUnlock={handleUnlock}
          unlockPriceLabel={unlockPriceLabel}
          unlocking={isPaying}
          unlockingLabel={unlockingLabel}
          onDownload={handleDownload}
          isDownloading={pdf.isDownloading || pdf.isPreparing}
          hasFullReportContent={hasFullReportContent}
        />
      ) : null}

      {scanState === "results" && reportData && !primaryAudit && !competitorPreview ? (
        <CompetitorLoader activeStep="Finalizing competitor preview..." />
      ) : null}
    </div>
  );
}
