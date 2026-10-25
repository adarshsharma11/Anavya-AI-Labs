"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPaymentQuote, formatQuoteLabel } from "@/lib/api/payment";
import { detectRegion } from "@/lib/pricing";
import type { PaymentRegion } from "@/types/pricing";

export function usePaymentQuote(region?: PaymentRegion) {
  const resolved = region ?? detectRegion();
  const query = useQuery({
    queryKey: ["payment-quote", resolved],
    queryFn: () => fetchPaymentQuote(resolved),
    staleTime: 10 * 60 * 1000,
  });

  const quote = query.data ?? null;

  return {
    quote,
    priceLabel: quote ? formatQuoteLabel(quote) : "",
    isLoading: query.isLoading,
  };
}
