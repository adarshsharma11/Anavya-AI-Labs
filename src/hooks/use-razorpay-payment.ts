"use client";

import { useCallback, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { fetchPublicScanResult, type ScanResultResponse } from "@/lib/api/scan";
import { startRazorpayPayment } from "@/lib/payments/razorpay";

type StartPaymentOptions = {
  scanId: number;
  amount: number;
  onSuccess?: (scan: ScanResultResponse) => void;
  onError?: (message: string) => void;
};

const POST_PAYMENT_SCAN_RETRIES = 6;
const POST_PAYMENT_SCAN_RETRY_DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasUnlockedReportContent(scan: ScanResultResponse) {
  const report =
    scan.data.fullReport ?? scan.data.aiReport ?? scan.data.report ?? null;
  if (!report) return false;

  return Boolean(
    report.summary ||
      report.executiveSummary ||
      report.technicalAnalysis ||
      report.estimatedTrafficImpact ||
      (report.issues?.length ?? 0) > 0 ||
      (report.suggestions?.length ?? 0) > 0 ||
      (report.seoImprovements?.length ?? 0) > 0 ||
      (report.performanceImprovements?.length ?? 0) > 0 ||
      (report.businessGrowthSuggestions?.length ?? 0) > 0
  );
}

async function fetchPostPaymentScan(scanId: number): Promise<ScanResultResponse> {
  let latest = await fetchPublicScanResult(scanId);
  if (hasUnlockedReportContent(latest)) return latest;

  for (let attempt = 0; attempt < POST_PAYMENT_SCAN_RETRIES; attempt += 1) {
    await sleep(POST_PAYMENT_SCAN_RETRY_DELAY_MS);
    try {
      latest = await fetchPublicScanResult(scanId);
      if (hasUnlockedReportContent(latest)) {
        return latest;
      }
    } catch {
      // Keep retrying; return best known state if retries are exhausted.
    }
  }

  return latest;
}

export function useRazorpayPayment() {
  const { toast } = useToast();
  const [isPaying, setIsPaying] = useState(false);
  const [isFinalizingReport, setIsFinalizingReport] = useState(false);

  const startPayment = useCallback(
    async ({ scanId, amount, onSuccess, onError }: StartPaymentOptions) => {
      if (isPaying) return;

      setIsPaying(true);
      setIsFinalizingReport(false);
      try {
        await startRazorpayPayment(scanId, amount);
        setIsFinalizingReport(true);
        const updatedScan = await fetchPostPaymentScan(scanId);
        onSuccess?.(updatedScan);
        toast({
          title: "Payment successful",
          description: "Full report unlocked successfully.",
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to complete payment.";
        onError?.(message);
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: message,
        });
      } finally {
        setIsFinalizingReport(false);
        setIsPaying(false);
      }
    },
    [isPaying, toast]
  );

  return { isPaying, isFinalizingReport, startPayment };
}
