"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  createScanRequest,
  fetchScanResult,
  type ScanResultResponse,
} from "@/lib/api/scan";
import { downloadPdfApi } from "@/lib/api/dashboard";
import { usePaymentQuote } from "@/hooks/use-payment-quote";
import { useRazorpayPayment } from "@/hooks/use-razorpay-payment";
import { generateScanReportPdf } from "@/lib/pdf/scan-report-pdf";

import { scanSteps } from "./scanner-constants";
import { AiSuggestions, UnlockEmailCaptureDialog } from "./scanner-shared-components";
import { CompetitorScanner } from "./scanner-competitor-components";
import type { Issue, ScanState } from "./scanner-types";
import {
  clearReportUnlock,
  hasReportContent,
  hasReportUnlockEmail,
  normalizeUrl,
  readReportUnlockState,
  readReportUnlockEmail,
  setReportUnlock,
  setReportUnlockEmail,
} from "./scanner-utils";
import {
  Hero,
  IssuesList,
  MetricsCard,
  FullReportSection,
  ResultsHeader,
  ScanInput,
  ScanLoader,
  ScoreOverview,
} from "./scanner-website-components";

export default function ScannerClient() {
  const [activeStep, setActiveStep] = useState(0);
  const [urlValue, setUrlValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanId, setScanId] = useState<number | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState("website");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUrlStateReady, setIsUrlStateReady] = useState(false);
  const [hasInitialIdInUrl, setHasInitialIdInUrl] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState("");
  const [pendingUnlockScanId, setPendingUnlockScanId] = useState<number | null>(null);
  const [emailPromptShownBeforeUnlock, setEmailPromptShownBeforeUnlock] = useState(false);
  const { isPaying, isFinalizingReport, startPayment } = useRazorpayPayment();
  const { priceLabel: unlockPriceLabel } = usePaymentQuote();
  const { toast } = useToast();
  const unlockingLabel = isFinalizingReport
    ? "Finalizing unlocked report..."
    : "Processing payment...";
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsUnlocked(readReportUnlockState());
    setCapturedEmail(readReportUnlockEmail());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      const idParam = params.get("id") ?? params.get("scanId");
      const parsedId = idParam ? Number(idParam) : NaN;

      if (tab === "competitor") {
        setActiveTab("competitor");
      }

      if (Number.isFinite(parsedId) && parsedId > 0) {
        setHasInitialIdInUrl(true);
        setScanId(parsedId);
      }
    }
    setIsUrlStateReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isUrlStateReady) return;
    if (activeTab !== "website") return;

    const url = new URL(window.location.href);
    if (scanId && scanId > 0) {
      url.searchParams.set("id", String(scanId));
      url.searchParams.delete("tab");
    } else {
      url.searchParams.delete("id");
    }
    window.history.replaceState({}, "", url.toString());
  }, [scanId, activeTab, isUrlStateReady]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    if (value === "competitor") {
      setScanId(null);
      setHasInitialIdInUrl(false);
      url.searchParams.set("tab", "competitor");
      url.searchParams.delete("id");
      url.searchParams.delete("scanId");
      url.searchParams.delete("reportTab");
    } else {
      url.searchParams.delete("tab");
    }
    window.history.replaceState({}, "", url.toString());
  };

  const normalizedUrl = useMemo(() => normalizeUrl(urlValue), [urlValue]);

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
    if (hasInitialIdInUrl && !normalizedUrl) {
      setErrorMessage("Loaded saved report from URL. Enter a URL to start a new scan.");
      return;
    }

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

  const runUnlockPayment = (currentScanId: number) => {
    startPayment({
      scanId: currentScanId,
      onSuccess: (updatedScan) => {
        queryClient.setQueryData(["scan-result", currentScanId], updatedScan);
        void queryClient.invalidateQueries({
          queryKey: ["scan-result", currentScanId],
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
    const currentScanId = scanQuery.data?.data?.id ?? scanId;
    if (!currentScanId) return;

    setIsDownloading(true);
    try {
      if (reportData) {
        await generateScanReportPdf(reportData);
      } else {
        const blob = await downloadPdfApi(currentScanId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `audit-report-${currentScanId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch {
      setErrorMessage("Failed to download PDF report.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setScanId(null);
  };

  const reportData: ScanResultResponse["data"] | null =
    scanQuery.data?.data ?? null;
  const previewData = reportData?.preview ?? null;
  const fullReport =
    reportData?.fullReport ?? reportData?.aiReport ?? reportData?.report ?? null;
  const hasFullReportContent = hasReportContent(fullReport);

  const locked = reportData
    ? (reportData.locked || reportData.preview.locked) && !isUnlocked
    : true;

  useEffect(() => {
    if (!scanId || !isUnlocked || hasFullReportContent) return;
    let attempts = 0;
    const maxAttempts = 20;
    const interval = window.setInterval(() => {
      attempts += 1;
      void queryClient.invalidateQueries({ queryKey: ["scan-result", scanId] });
      if (attempts >= maxAttempts) {
        window.clearInterval(interval);
      }
    }, 1500);

    return () => window.clearInterval(interval);
  }, [scanId, isUnlocked, hasFullReportContent, queryClient]);

  const previewIssues = useMemo<Issue[]>(() => {
    if (!reportData) return [];

    if (!locked && fullReport?.issues) {
      return fullReport.issues.map((issue, index) => ({
        id: `full-issue-${index}`,
        title: issue.title,
        severity: (issue.severity as string) || "Medium",
        suggestion: issue.suggestion,
        codeSnippet: issue.codeSnippet,
      }));
    }

    return reportData.preview.topIssues.map((issue, index) => ({
      id: `preview-issue-${index}`,
      title: issue.title,
      severity: issue.severity,
    }));
  }, [reportData, fullReport, locked]);

  const aiSuggestions = useMemo(() => {
    if (locked) return [];
    if (fullReport?.suggestions?.length) return fullReport.suggestions;
    return previewData?.quickWins ?? [];
  }, [fullReport, previewData, locked]);

  const lockedIssuesCount = previewData?.lockedIssues ?? 0;

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
        <Hero />

        <div className="mx-auto mt-12 max-w-5xl">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
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

                    {scanState === "scanning" ? (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ScanLoader activeStep={scanSteps[activeStep]} />
                      </motion.div>
                    ) : null}

                    {scanState === "results" && reportData ? (
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
                          unlockPriceLabel={unlockPriceLabel}
                          unlocking={isPaying}
                          unlockingLabel={unlockingLabel}
                          downloading={isDownloading}
                        />
                        {!locked ? (
                          <FullReportSection
                            report={fullReport}
                            pending={!hasFullReportContent}
                          />
                        ) : null}
                        <div className="grid gap-6 lg:grid-cols-2">
                          <ScoreOverview
                            overall={reportData.preview.overall}
                            categories={reportData.preview.categories}
                            indexing={reportData.preview.indexing}
                            social={reportData.preview.social}
                          />
                          <MetricsCard
                            metrics={reportData.preview.metrics}
                            improvements={reportData.preview.improvements}
                            seoMeta={reportData.preview.seoMeta}
                          />
                        </div>
                        <IssuesList
                          issues={previewIssues}
                          totalIssues={reportData.preview.totalIssuesFound}
                          locked={locked}
                          lockedCount={lockedIssuesCount}
                          onUnlock={handleUnlock}
                          unlockPriceLabel={unlockPriceLabel}
                          unlocking={isPaying}
                          unlockingLabel={unlockingLabel}
                        />
                        <AiSuggestions
                          title="AI suggestions"
                          suggestions={aiSuggestions}
                          locked={locked}
                          onUnlock={handleUnlock}
                          unlockPriceLabel={unlockPriceLabel}
                          unlocking={isPaying}
                          unlockingLabel={unlockingLabel}
                          description="Paid report includes actionable AI recommendations."
                        />
                      </motion.div>
                    ) : null}
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
