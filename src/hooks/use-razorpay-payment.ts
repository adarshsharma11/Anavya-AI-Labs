"use client";

import { useCallback, useState } from "react";

import { isApiError } from "@/lib/api/client";
import { startRazorpayPayment } from "@/lib/payments/razorpay";
import { useToast } from "@/hooks/use-toast";

type StartPaymentOptions = {
  scanId: string;
  email: string;
  onSuccess?: (publicId: string) => void;
  onError?: (error: unknown) => void;
};

export function useRazorpayPayment() {
  const { toast } = useToast();
  const [isPaying, setIsPaying] = useState(false);
  const [isFinalizingReport, setIsFinalizingReport] = useState(false);

  const startPayment = useCallback(
    async ({ scanId, email, onSuccess, onError }: StartPaymentOptions) => {
      if (isPaying) return;

      setIsPaying(true);
      setIsFinalizingReport(false);
      try {
        const result = await startRazorpayPayment({ scanId, email });
        setIsFinalizingReport(true);
        onSuccess?.(result.publicId || scanId);
        toast({
          title: "Payment successful",
          description: "We'll also email you when the AI report is ready.",
        });
      } catch (error) {
        onError?.(error);
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: isApiError(error)
            ? error.message
            : error instanceof Error
              ? error.message
              : "Unable to complete payment.",
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
