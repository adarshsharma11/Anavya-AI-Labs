import { planPriceView } from "@/lib/pricing";
import type { PaymentRegion, Plan } from "@/types/pricing";

type PlanPriceProps = {
  readonly plan: Plan;
  readonly region: PaymentRegion;
};

export function PlanPrice({ plan, region }: PlanPriceProps) {
  const price = planPriceView(plan, region);

  return (
    <div className="min-h-[5.5rem]">
      <p className="text-3xl font-bold tracking-tight">{price.headline}</p>
      {price.taxLine ? (
        <p className="mt-1 text-sm text-muted-foreground">{price.taxLine}</p>
      ) : null}
    </div>
  );
}
