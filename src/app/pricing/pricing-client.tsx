"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { isApiError } from "@/lib/api/client";
import { cancelSubscription, fetchSubscription } from "@/lib/api/subscription";
import { usePaymentQuote } from "@/hooks/use-payment-quote";
import { startRazorpaySubscription } from "@/lib/payments/razorpay";
import type { SubscriptionState } from "@/types/api";

function formatPeriodEnd(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

export default function PricingClient() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { priceLabel } = usePaymentQuote();
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    void fetchSubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login?next=/pricing";
      return;
    }
    setBusy(true);
    try {
      const result = await startRazorpaySubscription();
      setSubscription((current) => ({
        isPro: true,
        dailyScanLimit: current?.dailyScanLimit ?? null,
        status: result.status,
        currentPeriodEnd: result.currentPeriodEnd,
      }));
      toast({ title: "Pro is active", description: "New scans will include the AI report." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Subscription failed",
        description: isApiError(error) ? error.message : error instanceof Error ? error.message : "Unable to subscribe.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      const result = await cancelSubscription();
      setSubscription((current) => ({
        isPro: current?.isPro ?? true,
        dailyScanLimit: current?.dailyScanLimit ?? null,
        status: result.status,
        currentPeriodEnd: result.currentPeriodEnd,
      }));
      toast({
        title: "Cancellation scheduled",
        description: result.currentPeriodEnd
          ? `Pro until ${formatPeriodEnd(result.currentPeriodEnd)}`
          : "Pro remains active until the period ends.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to cancel",
        description: isApiError(error) ? error.message : error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
          Free full audit + PDF. Pay when you want the AI plan.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Free full audit + PDF; one-time AI report; or Pro monthly.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
        <Card className="flex flex-col border-border/60 p-6">
          <h2 className="text-xl font-semibold">Free audit</h2>
          <p className="mt-2 text-3xl font-bold">$0</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Multi-page AEO/GEO audit</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Recommendations and checks</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Free PDF download</li>
          </ul>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/scanner">Run a free scan</Link>
          </Button>
        </Card>

        <Card className="flex flex-col border-border/60 p-6">
          <h2 className="text-xl font-semibold">AI report</h2>
          <p className="mt-2 text-3xl font-bold">{priceLabel || "One-time"}</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> AI-written action plan</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Competitor strategy</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Traffic impact notes</li>
          </ul>
          <Button asChild className="mt-6">
            <Link href="/scanner">Unlock from a scan</Link>
          </Button>
        </Card>

        <Card className="flex flex-col border-primary p-6 ring-2 ring-primary">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="mt-2 text-3xl font-bold">Monthly</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Higher or unlimited daily scans</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Every new scan auto-unlocked</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> PDF branding from your profile</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Weekly monitoring</li>
          </ul>
          {loading ? (
            <div className="mt-6 flex h-10 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : subscription?.status === "cancel_scheduled" ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Pro until {formatPeriodEnd(subscription.currentPeriodEnd)}
            </p>
          ) : subscription?.isPro ? (
            <Button className="mt-6" variant="outline" onClick={handleCancel} disabled={busy}>
              {busy ? "Working…" : "Cancel Pro"}
            </Button>
          ) : (
            <Button className="mt-6" onClick={handleSubscribe} disabled={busy} aria-busy={busy}>
              {busy ? "Opening checkout…" : isAuthenticated ? "Subscribe to Pro" : "Sign in to subscribe"}
            </Button>
          )}
        </Card>
      </div>
    </section>
  );
}
