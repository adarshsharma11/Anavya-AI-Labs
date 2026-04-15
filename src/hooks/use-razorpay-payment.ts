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

export function useRazorpayPayment() {
  const { toast } = useToast();
  const [isPaying, setIsPaying] = useState(false);

  const startPayment = useCallback(
    async ({ scanId, amount, onSuccess, onError }: StartPaymentOptions) => {
      if (isPaying) return;

      setIsPaying(true);
      try {
        await startRazorpayPayment(scanId, amount);
        const updatedScan = await fetchPublicScanResult(scanId);
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
        setIsPaying(false);
      }
    },
    [isPaying, toast]
  );

  return { isPaying, startPayment };
}
