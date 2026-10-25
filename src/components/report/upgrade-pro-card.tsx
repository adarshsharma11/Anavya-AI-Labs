import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function UpgradeProCard({
  title = "Daily scan limit reached",
  description = "Choose a plan with a higher daily scan allowance.",
  plan,
  limit,
  showPricingLink,
}: {
  title?: string;
  description?: string;
  plan?: string;
  limit?: number;
  showPricingLink?: boolean;
}) {
  const heading =
    typeof limit === "number" && plan
      ? `You've used all ${limit} scans on the ${plan} plan today`
      : title;
  const onPro = plan?.toLowerCase() === "pro";
  const showLink = showPricingLink ?? !onPro;

  return (
    <Card className="border-primary/30 bg-primary/5 p-6">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-semibold">{heading}</h3>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {showLink ? (
            <Button asChild>
              <Link href="/pricing">View plans</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
