"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

import { isApiError } from "@/lib/api/client";
import { createScanRequest, fetchScanResult, getAuditPreview } from "@/lib/api/scan";
import { useAuth } from "@/components/providers/auth-provider";
import { usePaymentQuote } from "@/hooks/use-payment-quote";
import { usePdfDownload } from "@/hooks/use-pdf-download";
import { usePolling } from "@/hooks/use-polling";
import { useRazorpayPayment } from "@/hooks/use-razorpay-payment";
import { ShareExperienceCta } from "@/components/reviews/share-experience-cta";
import { AuditView } from "@/components/report/audit-view";
import { ShareReportButton } from "@/components/report/share-report-button";
import { UnlockEmailModal } from "@/components/report/unlock-modal";
import { UpgradeProCard } from "@/components/report/upgrade-pro-card";
import type { ScanRecord } from "@/types/api";

import { scanSteps } from "./scanner-constants";
import type { ScanState } from "./scanner-types";
import { getValidScanUrl } from "./scanner-utils";
import { Hero, ScanInput, ScanLoader } from "./scanner-website-components";
import { V1ReportView } from "./v1-report-view";

function stopPolling(scan: ScanRecord | undefined) {
  if (!scan) return false;
  if (!scan.auditComplete) return false;
  if (scan.processing && !scan.fullReport && scan.status !== "report_failed") {
    return false;
  }
  return true;
}

export default function ScannerClient({
  initialUrl = "",
  initialPublicId = "",
}: {
  initialUrl?: string;
  initialMode?: "seo" | "geo";
  initialPublicId?: string;
}) {
  const [urlValue, setUrlValue] = useState(initialUrl);
  const [publicId, setPublicId] = useState(initialPublicId);
  const [cached, setCached] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const didAutoStart = useRef(false);
  const { user, isAuthenticated } = useAuth();
  const { isPaying, isFinalizingReport, startPayment } = useRazorpayPayment();
  const { priceLabel: unlockPriceLabel } = usePaymentQuote();
  const pdf = usePdfDownload();

  const pollingEnabled = Boolean(publicId);
  const fetchScan = useCallback(
    (signal: AbortSignal) => {
      return fetchScanResult(publicId).then((record) => {
        if (signal.aborted) return record;
        return record;
      });
    },
    [publicId]
  );

  const scanPoll = usePolling(fetchScan, {
    enabled: pollingEnabled,
    interval: 1500,
    maxInterval: 5000,
    backoffAfterMs: 30_000,
    stopWhen: stopPolling,
  });

  const scan = scanPoll.data ?? null;
  const audit = getAuditPreview(scan);
  const isScanning = Boolean(publicId) && !scan?.preview && (scanPoll.isLoading || !scan);
  const hasResults = Boolean(scan?.preview);
  const scanState: ScanState = hasResults
    ? "results"
    : isScanning
      ? "scanning"
      : "idle";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (publicId) url.searchParams.set("id", publicId);
    else url.searchParams.delete("id");
    url.searchParams.delete("mode");
    window.history.replaceState({}, "", url.toString());
  }, [publicId]);

  useEffect(() => {
    if (scanState !== "scanning") return;
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % scanSteps.length);
    }, 700);
    return () => window.clearInterval(timer);
  }, [scanState]);

  const startScan = async (url: string, forceNew = false) => {
    setErrorMessage(null);
    setDailyLimit(false);
    setCached(false);
    setPublicId("");
    try {
      const created = await createScanRequest({ url });
      setPublicId(created.publicId);
      setCached(created.cached && !forceNew);
    } catch (err) {
      if (isApiError(err) && err.status === 429 && err.code === "DAILY_LIMIT") {
        setDailyLimit(true);
        setErrorMessage(null);
        return;
      }
      if (isApiError(err) && err.status === 429) {
        setErrorMessage("Too many requests, wait a minute");
        return;
      }
      if (isApiError(err) && err.status === 400) {
        setErrorMessage(err.message);
        return;
      }
      setErrorMessage(err instanceof Error ? err.message : "Unable to start scan.");
    }
  };

  useEffect(() => {
    if (didAutoStart.current) return;
    if (initialPublicId) {
      didAutoStart.current = true;
      return;
    }
    if (!initialUrl.trim()) return;
    const validation = getValidScanUrl(initialUrl);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }
    didAutoStart.current = true;
    setUrlValue(validation.normalized);
    void startScan(validation.normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPublicId, initialUrl]);

  const handleScan = () => {
    const validation = getValidScanUrl(urlValue);
    if (publicId && !urlValue.trim()) {
      setErrorMessage("Loaded saved report from URL. Enter a URL to start a new scan.");
      return;
    }
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }
    void startScan(validation.normalized);
  };

  const handleUnlockSubmit = (email: string) => {
    if (!publicId) return;
    setEmailError(null);
    void startPayment({
      scanId: publicId,
      email,
      onSuccess: () => {
        setShowUnlock(false);
        void scanPoll.refetch();
      },
      onError: (error) => {
        if (isApiError(error) && error.code === "EMAIL_REQUIRED") {
          setEmailError("Email is required to unlock this report.");
          return;
        }
        if (isApiError(error) && error.status === 409 && error.code === "ALREADY_UNLOCKED") {
          setShowUnlock(false);
          void scanPoll.refetch();
          return;
        }
        if (isApiError(error) && error.status === 409) {
          setEmailError("The scan is still running. Wait a moment and try again.");
          return;
        }
        if (isApiError(error) && error.status === 404) {
          setEmailError("This scan could not be found.");
        }
      },
    });
  };

  const reportActions = useMemo(() => {
    const ready = Boolean(scan?.auditComplete && audit);
    const label = pdf.isPreparing
      ? "Preparing your report…"
      : pdf.exhausted
        ? "Retry PDF"
        : "Download PDF";
    return (
      <div className="flex flex-wrap gap-2">
        {publicId ? <ShareReportButton publicId={publicId} /> : null}
        <Button
          variant="outline"
          disabled={!ready || pdf.isDownloading}
          onClick={() => {
            if (publicId && scan) {
              void pdf.download(publicId, scan.url, audit);
            }
          }}
          aria-busy={pdf.isDownloading}
        >
          <Download className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </div>
    );
  }, [audit, pdf, publicId, scan]);

  const defaultEmail = user?.email ?? "";

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

      <UnlockEmailModal
        open={showUnlock}
        defaultEmail={defaultEmail}
        priceLabel={unlockPriceLabel}
        submitting={isPaying}
        emailError={emailError}
        onOpenChange={setShowUnlock}
        onSubmit={handleUnlockSubmit}
      />

      <section className="container py-16 md:py-24">
        <Hero />
        <div className="mx-auto mt-12 max-w-5xl space-y-6">
          <ScanInput
            urlValue={urlValue}
            onUrlChange={setUrlValue}
            onScan={handleScan}
            scanning={scanState === "scanning"}
            errorMessage={errorMessage}
          />

          {dailyLimit ? <UpgradeProCard /> : null}

          {scanState === "scanning" ? (
            <ScanLoader activeStep={scanSteps[activeStep]} />
          ) : null}

          {scanPoll.error && !scan ? (
            <p className="text-sm text-destructive">{scanPoll.error.message}</p>
          ) : null}

          {scanState === "results" ? (
            <div id="scan-report" className="mt-14 space-y-4">
              {cached ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm">
                  <p>Results from the last 24 hours. A rescan uses the same cache until it expires.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const validation = getValidScanUrl(urlValue || scan?.url || "");
                      if (validation.valid) void startScan(validation.normalized, true);
                    }}
                  >
                    Rescan
                  </Button>
                </div>
              ) : null}

              {scan && audit ? (
                <AuditView
                  report={audit}
                  scan={scan}
                  onUnlock={() => {
                    setEmailError(null);
                    if (isAuthenticated && user?.email) {
                      handleUnlockSubmit(user.email);
                      return;
                    }
                    setShowUnlock(true);
                  }}
                  unlockPriceLabel={unlockPriceLabel}
                  unlocking={isPaying || isFinalizingReport}
                  pdfButton={reportActions}
                  isAdmin={user?.role === "admin"}
                />
              ) : scan && scan.reportVersion === 1 ? (
                <V1ReportView
                  scan={scan}
                  onReset={() => {
                    setPublicId("");
                    setCached(false);
                  }}
                  onDownload={() => {
                    if (publicId) void pdf.download(publicId, scan.url, audit);
                  }}
                  onUnlock={() => {
                    if (isAuthenticated && user?.email) {
                      handleUnlockSubmit(user.email);
                      return;
                    }
                    setShowUnlock(true);
                  }}
                  unlockPriceLabel={unlockPriceLabel}
                  unlocking={isPaying}
                  unlockingLabel={
                    isFinalizingReport
                      ? "Writing your AI report…"
                      : "Processing payment..."
                  }
                  downloading={pdf.isDownloading}
                />
              ) : null}

              {scan && scan.reportVersion === 1 && publicId ? (
                <ShareReportButton publicId={publicId} />
              ) : null}

              {pdf.error ? (
                <p className="text-sm text-muted-foreground" role="status">
                  {pdf.error}
                </p>
              ) : null}

              <ShareExperienceCta />
            </div>
          ) : null}
        </div>
      </section>
    </motion.div>
  );
}
