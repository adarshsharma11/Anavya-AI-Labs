"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useToast } from "@/hooks/use-toast";
import {
  createScanRequest,
  fetchScanResult,
  type ScanResultResponse,
  runGeoScanRequest,
  type GeoCheckResponse,
} from "@/lib/api/scan";
import { downloadPdfApi } from "@/lib/api/dashboard";
import { usePaymentQuote } from "@/hooks/use-payment-quote";
import { useRazorpayPayment } from "@/hooks/use-razorpay-payment";
import { generateScanReportPdf } from "@/lib/pdf/scan-report-pdf";

import { scanSteps } from "./scanner-constants";
import { AiSuggestions, UnlockEmailCaptureDialog } from "./scanner-shared-components";
import type { Issue, ScanState } from "./scanner-types";
import { GeoReportSection } from "./scanner-geo-components";
const geoScanSteps = [
  "Fetching website target HTML...",
  "Verifying robots.txt and AI crawlers configurations...",
  "Searching for llms.txt and XML sitemap records...",
  "Parsing JSON-LD schema objects...",
  "Calculating generative engine score..."
];
import {
  clearReportUnlock,
  getValidScanUrl,
  hasReportContent,
  hasReportUnlockEmail,
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
  const [mode, setMode] = useState<"seo" | "geo">("seo");
  const [geoScanData, setGeoScanData] = useState<GeoCheckResponse | null>(null);
  const [geoScanning, setGeoScanning] = useState<boolean>(false);

  const [activeStep, setActiveStep] = useState(0);
  const [urlValue, setUrlValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanId, setScanId] = useState<number | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isUrlStateReady, setIsUrlStateReady] = useState<boolean>(false);
  const [hasInitialIdInUrl, setHasInitialIdInUrl] = useState<boolean>(false);
  const [showEmailCapture, setShowEmailCapture] = useState<boolean>(false);
  const [capturedEmail, setCapturedEmail] = useState<string>("");
  const [pendingUnlockScanId, setPendingUnlockScanId] = useState<number | null>(null);
  const [emailPromptShownBeforeUnlock, setEmailPromptShownBeforeUnlock] = useState<boolean>(false);
  const { isPaying, isFinalizingReport, startPayment } = useRazorpayPayment();
  const { priceLabel: unlockPriceLabel } = usePaymentQuote();
  const { toast } = useToast();
  const unlockingLabel = isFinalizingReport
    ? "Finalizing unlocked report..."
    : "Processing payment...";
  const queryClient = useQueryClient();

  useEffect(() => {
    setErrorMessage(null);
  }, [mode]);

  useEffect(() => {
    setIsUnlocked(readReportUnlockState());
    setCapturedEmail(readReportUnlockEmail());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id") ?? params.get("scanId");
      const parsedId = idParam ? Number(idParam) : NaN;

      if (Number.isFinite(parsedId) && parsedId > 0) {
        setHasInitialIdInUrl(true);
        setScanId(parsedId);
      }
    }
    setIsUrlStateReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isUrlStateReady) return;

    const url = new URL(window.location.href);
    if (scanId && scanId > 0) {
      url.searchParams.set("id", String(scanId));
    } else {
      url.searchParams.delete("id");
    }
    url.searchParams.delete("tab");
    url.searchParams.delete("competitorReportTab");
    window.history.replaceState({}, "", url.toString());
  }, [scanId, isUrlStateReady]);

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
    enabled: typeof scanId === "number" && mode === "seo",
  });

  useEffect(() => {
    if (!scanQuery.error) return;
    setErrorMessage((scanQuery.error as Error).message ?? "Scan failed.");
  }, [scanQuery.error]);

  useEffect(() => {
    if (!scanQuery.data) return;
    setErrorMessage(null);
  }, [scanQuery.data]);

  const isScanning = mode === "seo"
    ? (createScan.isPending || scanQuery.isFetching)
    : geoScanning;

  const hasResults = mode === "seo"
    ? Boolean(scanQuery.data)
    : Boolean(geoScanData);

  const scanState: ScanState = hasResults
    ? "results"
    : isScanning
      ? "scanning"
      : "idle";

  useEffect(() => {
    if (scanState !== "scanning") return;
    setActiveStep(0);
    const stepsLength = mode === "seo" ? scanSteps.length : geoScanSteps.length;
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % stepsLength);
    }, 700);
    return () => clearInterval(stepTimer);
  }, [scanState, mode]);

  useEffect(() => {
    if (scanState !== "results") return;
    const node = document.getElementById("scan-report");
    if (!node) return;
    const headerOffset = 80;
    const top = node.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  }, [scanState]);

  const handleScan = () => {
    const validation = getValidScanUrl(urlValue);

    if (hasInitialIdInUrl && !urlValue.trim()) {
      setErrorMessage("Loaded saved report from URL. Enter a URL to start a new scan.");
      return;
    }

    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    setErrorMessage(null);
    if (mode === "seo") {
      setScanId(null);
      setIsUnlocked(false);
      clearReportUnlock();
      createScan.mutate(validation.normalized);
    } else {
      setGeoScanData(null);
      setGeoScanning(true);
      runGeoScanRequest(validation.normalized)
        .then((data) => {
          setGeoScanData(data);
          setGeoScanning(false);
        })
        .catch((err: any) => {
          setErrorMessage(err.message || "Failed to execute GEO analysis.");
          setGeoScanning(false);
        });
    }
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
    setGeoScanData(null);
    setErrorMessage(null);
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

        <div className="mx-auto mt-12 max-w-5xl space-y-6">
          <div className="flex justify-center">
            <Tabs value={mode} onValueChange={(val: string) => setMode(val as "seo" | "geo")} className="w-80">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="seo">SEO Checker</TabsTrigger>
                <TabsTrigger value="geo">GEO Checker</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

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
              className="mt-6"
            >
              <ScanLoader activeStep={mode === "seo" ? scanSteps[activeStep] : geoScanSteps[activeStep]} />
            </motion.div>
          ) : null}

          {scanState === "results" ? (
            <motion.div
              id="scan-report"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-14"
            >
              {mode === "seo" && reportData ? (
                <div className="space-y-10">
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
                </div>
              ) : mode === "geo" && geoScanData ? (
                <GeoReportSection
                  report={geoScanData}
                  onReset={handleReset}
                />
              ) : null}
            </motion.div>
          ) : null}
        </div>
      </section>
    </motion.div>
  );
}
