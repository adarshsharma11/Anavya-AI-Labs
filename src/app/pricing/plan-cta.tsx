"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isApiError } from "@/lib/api/client";
import { startRazorpaySubscription } from "@/lib/payments/razorpay";
import { selectPlanCta, subscribeLoginHref } from "@/lib/pricing";
import type { PaymentRegion, Plan, SubscriptionState } from "@/types/pricing";

type PlanCtaProps = {
  readonly plan: Plan;
  readonly region: PaymentRegion;
  readonly isAuthenticated: boolean;
  readonly subscription: SubscriptionState | null;
  readonly subscriptionReady: boolean;
};

export function PlanCta({
  plan,
  region,
  isAuthenticated,
  subscription,
  subscriptionReady,
}: PlanCtaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const startedRef = useRef(false);

  const view = selectPlanCta({ plan, isAuthenticated, subscription });

  const startCheckout = async () => {
    if (plan.type === "free") return;
    setBusy(true);
    try {
      const result = await startRazorpaySubscription({
        plan: plan.slug,
        region,
      });
      toast({
        title: `You're on ${result.plan.name}`,
        description: result.replaces
          ? "Your previous plan will be cancelled."
          : "Your subscription is active.",
      });
      await queryClient.invalidateQueries({ queryKey: ["payment-subscription"] });
      router.refresh();
      router.replace("/pricing");
    } catch (error) {
      const cancelled = error instanceof Error && error.message === "Payment cancelled.";
      if (cancelled) return;
      if (isApiError(error) && error.status === 401) {
        router.push(subscribeLoginHref(plan.slug));
        return;
      }
      if (
        isApiError(error) &&
        (error.code === "INVALID_PLAN" || error.code === "ALREADY_SUBSCRIBED")
      ) {
        toast({
          title: error.code === "ALREADY_SUBSCRIBED" ? "Already subscribed" : "Unable to subscribe",
          description: error.message,
        });
        return;
      }
      toast({
        variant: "destructive",
        title: "Subscription failed",
        description: isApiError(error)
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to subscribe.",
      });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (plan.type !== "subscription") return;
    if (searchParams.get("intent") !== "subscribe") return;
    if (searchParams.get("plan") !== plan.slug) return;
    if (!isAuthenticated || !subscriptionReady || startedRef.current) return;
    if (view.kind !== "subscribe") return;
    startedRef.current = true;
    void startCheckout();
  }, [isAuthenticated, plan.slug, plan.type, searchParams, subscriptionReady, view.kind]);

  if (view.kind === "disabled") {
    return (
      <div className="mt-auto space-y-2">
        <Button className="w-full" variant="outline" disabled>
          {view.label}
        </Button>
        {view.hint ? <p className="text-center text-xs text-muted-foreground">{view.hint}</p> : null}
        {view.manageHref ? (
          <p className="text-center text-xs">
            <Link href={view.manageHref} className="font-medium text-primary underline-offset-4 hover:underline">
              Manage
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  if (view.kind === "past_due") {
    return (
      <Button asChild className="mt-auto w-full">
        <Link href={view.href}>{view.label}</Link>
      </Button>
    );
  }

  if (view.kind === "subscribe") {
    return (
      <Button
        className="mt-auto w-full"
        onClick={() => void startCheckout()}
        disabled={busy}
        aria-busy={busy}
      >
        {busy ? "Opening checkout…" : view.label}
      </Button>
    );
  }

  return (
    <Button asChild className="mt-auto w-full" variant={plan.isHighlighted ? "default" : "outline"}>
      <Link href={view.href}>{view.label}</Link>
    </Button>
  );
}
