"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isApiError } from "@/lib/api/client";
import { cancelSubscription, fetchSubscription } from "@/lib/api/subscription";
import { formatPeriodDate } from "@/lib/pricing";
import { useState } from "react";

export default function BillingPage() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ["payment-subscription"],
    queryFn: fetchSubscription,
  });

  const subscription = query.data;
  const period = formatPeriodDate(subscription?.currentPeriodEnd ?? null);

  const handleCancel = async () => {
    setBusy(true);
    try {
      const result = await cancelSubscription();
      await query.refetch();
      toast({
        title: "Cancellation scheduled",
        description: result.currentPeriodEnd
          ? `Pro until ${formatPeriodDate(result.currentPeriodEnd)}`
          : "Pro remains active until the period ends.",
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
          Manage your Pro subscription and payment status.
        </p>
      </div>
      <Card className="space-y-4 p-6">
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading plan status…</p>
        ) : (
          <>
            <p className="text-sm">
              Status: <span className="font-medium">{subscription?.status ?? "none"}</span>
            </p>
            {period ? (
              <p className="text-sm text-muted-foreground">
                {subscription?.status === "cancel_scheduled" ? `Pro until ${period}` : `Current period ends ${period}`}
              </p>
            ) : null}
            {subscription?.status === "active" ? (
              <Button variant="outline" onClick={() => void handleCancel()} disabled={busy}>
                {busy ? "Working…" : "Cancel Pro"}
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
