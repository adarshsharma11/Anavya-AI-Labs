"use client";

import { useCallback, useEffect, useState } from "react";

import { detectRegion, persistRegion } from "@/lib/pricing";
import type { PaymentRegion } from "@/types/pricing";

export function usePricingRegion() {
  const [region, setRegionState] = useState<PaymentRegion>("INTL");

  useEffect(() => {
    setRegionState(detectRegion());
  }, []);

  const setRegion = useCallback((next: PaymentRegion) => {
    persistRegion(next);
    setRegionState(next);
  }, []);

  return { region, setRegion };
}
