"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isApiError } from "@/lib/api/client";
import { cancelSubscription, fetchSubscription } from "@/lib/api/subscription";
import { formatPeriodDate } from "@/lib/pricing";

export default function BillingPage() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ["payment-subscription"],
    queryFn: fetchSubscription,
  });

  const subscription = query.data;
  const period = formatPeriodDate(subscription?.currentPeriodEnd ?? null);
  const planName = subscription?.plan?.name ?? "Free";
  const cancelling = subscription?.status === "cancel_scheduled";

  const handleCancel = async () => {
    setBusy(true);
    try {
      const result = await cancelSubscription();
      await query.refetch();
      const ends = formatPeriodDate(result.currentPeriodEnd);
      toast({
        title: "Cancellation scheduled",
        description: ends ? `Cancels on ${ends}` : "Access lasts until the current period ends.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to cancel",
        description: isApiError(error) ? error.message : "Try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan and payment status.
        </p>
      </div>
      <Card className="space-y-4 p-6">
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading plan status…</p>
        ) : (
          <>
            <p className="text-sm">
              Plan: <span className="font-medium">{planName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Status: {subscription?.status ?? "none"}
              {subscription?.dailyScanLimit != null
                ? ` · ${subscription.dailyScanLimit} scans / day`
                : ""}
            </p>
            {cancelling && period ? (
              <p className="text-sm font-medium">Cancels on {period}</p>
            ) : period ? (
              <p className="text-sm text-muted-foreground">Current period ends {period}</p>
            ) : null}
            {subscription?.isPaid && subscription.status === "active" ? (
              <Button variant="outline" onClick={() => void handleCancel()} disabled={busy}>
                {busy ? "Working…" : `Cancel ${planName}`}
              </Button>
            ) : null}
            <Button asChild variant="ghost">
              <Link href="/pricing">View plans</Link>
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
