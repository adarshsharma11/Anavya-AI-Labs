import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function UpgradeProCard({
  title = "Daily free scan limit reached",
  description = "Upgrade to Pro for more daily scans, auto-unlocked AI reports, branded PDFs, and weekly monitoring.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-primary/30 bg-primary/5 p-6">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button asChild>
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
