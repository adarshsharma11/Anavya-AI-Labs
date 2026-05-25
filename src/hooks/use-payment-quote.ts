"use client";

import { useEffect, useState } from "react";

import {
  fetchPaymentQuote,
  formatPaymentPriceLabel,
  type PaymentQuote,
} from "@/lib/payments/razorpay";
import { detectClientRegion } from "@/lib/payments/payment-region";

export function usePaymentQuote() {
  const [quote, setQuote] = useState<PaymentQuote | null>(null);
  const [priceLabel, setPriceLabel] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const region = detectClientRegion();
        const nextQuote = await fetchPaymentQuote(region);
        if (cancelled) return;
        setQuote(nextQuote);
        setPriceLabel(formatPaymentPriceLabel(nextQuote));
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
