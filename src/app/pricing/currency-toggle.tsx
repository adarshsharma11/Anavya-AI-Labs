"use client";

import { cn } from "@/lib/utils";
import type { PaymentRegion } from "@/types/pricing";

type CurrencyToggleProps = {
  readonly region: PaymentRegion;
  readonly onChange: (region: PaymentRegion) => void;
};

const OPTIONS = [
  { region: "IN" as const, label: "₹ INR" },
  { region: "INTL" as const, label: "$ USD" },
];

export function CurrencyToggle({ region, onChange }: CurrencyToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Currency"
      className="inline-flex rounded-full border border-border/70 bg-muted/40 p-1"
    >
      {OPTIONS.map((option) => {
        const selected = region === option.region;
        return (
          <button
            key={option.region}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.region)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              selected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
