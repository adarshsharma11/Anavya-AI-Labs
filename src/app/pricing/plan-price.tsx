import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/pricing";
import type { PaymentQuote, PaymentRegion, Plan } from "@/types/pricing";

type PlanPriceProps = {
  readonly plan: Plan;
  readonly region: PaymentRegion;
  readonly quote: PaymentQuote | null;
  readonly quoteLoading: boolean;
};

export function PlanPrice({ plan, region, quote, quoteLoading }: PlanPriceProps) {
  if (plan.type === "free") {
    return (
      <div className="min-h-[5.5rem]">
        <p className="text-3xl font-bold tracking-tight">Free</p>
      </div>
    );
  }

  if (plan.type === "one_time") {
    const showInr = region === "IN";
    return (
      <div className="min-h-[5.5rem]">
        {showInr && quoteLoading ? (
          <Skeleton className="h-9 w-40" />
        ) : showInr && quote ? (
          <p className="text-3xl font-bold tracking-tight">
            {formatPrice(quote.total, quote.currency)}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              incl. {quote.gstRatePercent}% GST
            </span>
          </p>
        ) : (
          <p className="text-3xl font-bold tracking-tight">{formatPrice(plan.price, "USD")}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">{plan.cadence ?? "per report"}</p>
        {plan.hasDiscount && plan.compareAtPrice !== null ? (
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="line-through">{formatPrice(plan.compareAtPrice, "USD")}</span>
            {plan.discountPercent !== null ? (
              <span className="ml-2 font-medium text-primary">Save {plan.discountPercent}%</span>
            ) : null}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-[5.5rem]">
      <p className="text-3xl font-bold tracking-tight">
        {formatPrice(plan.price, "USD")}
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          {plan.cadence ? `/ ${plan.cadence.replace(/^per\s+/i, "")}` : "/ month"}
        </span>
      </p>
      {region === "IN" ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Billed in INR at checkout, incl. 18% GST
        </p>
      ) : null}
      {plan.hasDiscount && plan.compareAtPrice !== null ? (
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="line-through">{formatPrice(plan.compareAtPrice, "USD")}</span>
          {plan.discountPercent !== null ? (
            <span className="ml-2 font-medium text-primary">Save {plan.discountPercent}%</span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
