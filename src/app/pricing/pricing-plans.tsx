"use client";

import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import Script from "next/script";

import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { fetchSubscription } from "@/lib/api/subscription";
import { cn } from "@/lib/utils";
import { normalizeSubscription, scanLimitLabel } from "@/lib/pricing";
import type { Plan } from "@/types/pricing";

import { PlanCta } from "./plan-cta";
import { PlanPrice } from "./plan-price";
import { ComparePlans } from "./compare-plans";

type PricingPlansProps = {
  readonly plans: readonly Plan[];
};

export function PricingPlans({ plans }: PricingPlansProps) {
  const { isAuthenticated } = useAuth();
  const region = "INTL" as const;
  const subscriptionQuery = useQuery({
    queryKey: ["payment-subscription"],
    queryFn: fetchSubscription,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const subscription = subscriptionQuery.data
    ? normalizeSubscription(subscriptionQuery.data)
    : null;

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div
        className={cn(
          "grid gap-6",
          plans.length <= 1 && "mx-auto max-w-md",
          plans.length === 2 && "mx-auto max-w-3xl md:grid-cols-2",
          plans.length === 3 && "md:grid-cols-2 xl:grid-cols-3",
          plans.length >= 4 && "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        )}
      >
        {plans.map((plan) => {
          const highlighted = plan.isHighlighted === true;
          return (
            <article key={String(plan.id)} className="h-full">
              <Card
                className={cn(
                  "flex h-full flex-col border-border/60 p-6",
                  highlighted && "border-primary ring-2 ring-primary"
                )}
              >
                {plan.badge ? (
                  <p className="mb-3 inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {plan.badge}
                  </p>
                ) : null}
                <h2 className="text-xl font-semibold tracking-tight">{plan.name}</h2>
                {plan.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                ) : null}
                <div className="mt-5">
                  <PlanPrice plan={plan} region={region} />
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {scanLimitLabel(plan)}
                </p>
                {plan.features && plan.features.length > 0 ? (
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex-1" />
                )}
                <div className="mt-6">
                  <PlanCta
                    plan={plan}
                    region={region}
                    isAuthenticated={isAuthenticated}
                    subscription={subscription}
                    subscriptionReady={!isAuthenticated || !subscriptionQuery.isLoading}
                  />
                </div>
              </Card>
            </article>
          );
        })}
      </div>
      <ComparePlans plans={plans} />
    </div>
  );
}
