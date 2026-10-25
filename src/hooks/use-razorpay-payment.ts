"use client";

/**
 * One-time report checkout is disabled. Subscriptions use startRazorpaySubscription.
 */
export function useRazorpayPayment() {
  return {
    isPaying: false,
    isFinalizingReport: false,
    startPayment: async () => {
      throw new Error("Report checkout is no longer available.");
    },
  };
}
