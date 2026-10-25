"use client";

import { Check, Minus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { comparisonFeatureRows, planHasFeature } from "@/lib/pricing";
import type { Plan } from "@/types/pricing";

type ComparePlansProps = {
  readonly plans: readonly Plan[];
};

function ComparisonTable({ plans }: { readonly plans: readonly Plan[] }) {
  const rows = comparisonFeatureRows(plans);
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <caption className="sr-only">Plan feature comparison</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="py-3 pr-4 text-left font-medium text-muted-foreground">
              Feature
            </th>
            {plans.map((plan) => (
              <th key={String(plan.id)} scope="col" className="px-3 py-3 text-center font-semibold">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((feature) => (
            <tr key={feature} className="border-b border-border/60">
              <th scope="row" className="py-3 pr-4 text-left font-normal text-muted-foreground">
                {feature}
              </th>
              {plans.map((plan) => {
                const included = planHasFeature(plan, feature);
                return (
                  <td key={`${plan.id}-${feature}`} className="px-3 py-3 text-center">
                    {included ? (
                      <Check className="mx-auto h-4 w-4 text-primary" aria-label="Included" />
                    ) : (
                      <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" aria-label="Not included" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ComparePlans({ plans }: ComparePlansProps) {
  const [open, setOpen] = useState(false);
  const rows = comparisonFeatureRows(plans);
  if (rows.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="md:hidden">
        <Button variant="outline" className="w-full" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide comparison" : "Compare plans"}
        </Button>
        {open ? (
          <div className="mt-6">
            <ComparisonTable plans={plans} />
          </div>
        ) : null}
      </div>
      <div className="hidden md:block">
        <h2 className="text-2xl font-semibold tracking-tight">Compare plans</h2>
        <div className="mt-6">
          <ComparisonTable plans={plans} />
        </div>
      </div>
    </section>
  );
}
