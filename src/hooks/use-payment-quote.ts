"use client";

import { useEffect, useState } from "react";

import { fetchPaymentQuote, formatQuoteLabel } from "@/lib/api/payment";
import { detectClientRegion } from "@/lib/payments/payment-region";
import type { PaymentQuote } from "@/types/api";

export function usePaymentQuote() {
  const [quote, setQuote] = useState<PaymentQuote | null>(null);
  const [priceLabel, setPriceLabel] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextQuote = await fetchPaymentQuote(detectClientRegion());
        if (cancelled) return;
        setQuote(nextQuote);
        setPriceLabel(formatQuoteLabel(nextQuote));
      } catch {
        if (cancelled) return;
        setPriceLabel("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { quote, priceLabel };
}
