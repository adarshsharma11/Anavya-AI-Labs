"use client";

import { LineChart, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SuggestionList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function UnlockReportNotice({
  message,
  onUnlock,
  unlockPriceLabel,
  unlocking = false,
  unlockingLabel = "Processing...",
  compact = false,
}: {
  message: string;
  onUnlock: () => void;
  unlockPriceLabel: string;
  unlocking?: boolean;
  unlockingLabel?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-primary/30 bg-primary/10 text-foreground ${
        compact ? "p-3 text-xs" : "p-4 text-sm"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{message}</span>
        <Button size="sm" onClick={onUnlock} disabled={unlocking} aria-busy={unlocking}>
          {unlocking ? unlockingLabel : `Unlock full report (${unlockPriceLabel})`}
        </Button>
      </div>
    </div>
  );
}

export function AiSuggestions({
  title,
  suggestions,
  locked,
  onUnlock,
  description,
  unlockPriceLabel,
  unlocking = false,
  unlockingLabel,
}: {
  title: string;
  suggestions: string[];
  locked: boolean;
  onUnlock: () => void;
  description?: string;
  unlockPriceLabel: string;
  unlocking?: boolean;
  unlockingLabel?: string;
}) {
  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-emerald-600">
        <Zap className="h-4 w-4" />
        <span>{title}</span>
        {locked ? (
          <Badge variant="secondary" className="text-[10px] uppercase">
            Preview
          </Badge>
        ) : null}
      </div>
      {description ? (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      ) : null}
      {locked ? (
        <div className="mt-4">
          <UnlockReportNotice
            message="Unlock full report to view AI suggestions."
            onUnlock={onUnlock}
            unlockPriceLabel={unlockPriceLabel}
            unlocking={unlocking}
            unlockingLabel={unlockingLabel}
            compact
          />
        </div>
      ) : suggestions.length > 0 ? (
        <SuggestionList items={suggestions} />
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No AI suggestions are available for this report yet.
        </p>
      )}
    </Card>
  );
}

export function QuickWinsCard({
  title,
  wins,
  locked,
  onUnlock,
  unlockPriceLabel,
  unlocking = false,
  unlockingLabel,
}: {
  title: string;
  wins: string[];
  locked: boolean;
  onUnlock: () => void;
  unlockPriceLabel: string;
  unlocking?: boolean;
  unlockingLabel?: string;
}) {
  const visible = locked ? [] : wins;
  const hiddenCount = Math.max(0, wins.length - visible.length);

  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">{title}</h4>
        <Badge variant="secondary">{visible.length} shown</Badge>
      </div>
      {visible.length === 0 ? (
        <p className="mt-4 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
          {locked ? "Unlock to view quick wins." : "No quick wins available."}
        </p>
      ) : (
        <SuggestionList items={visible} />
      )}
      {locked && hiddenCount > 0 ? (
        <div className="mt-4">
          <UnlockReportNotice
            message={`Unlock ${hiddenCount} more recommendation${hiddenCount > 1 ? "s" : ""}.`}
            onUnlock={onUnlock}
            unlockPriceLabel={unlockPriceLabel}
            unlocking={unlocking}
            unlockingLabel={unlockingLabel}
            compact
          />
        </div>
      ) : null}
    </Card>
  );
}

export function CompetitorAnalysisCard({
  scoreGap,
  summary,
  actionItems,
  locked,
  onUnlock,
  unlockPriceLabel,
  unlocking = false,
  unlockingLabel,
}: {
  scoreGap: number;
  summary: string;
  actionItems: string[];
  locked: boolean;
  onUnlock: () => void;
  unlockPriceLabel: string;
  unlocking?: boolean;
  unlockingLabel?: string;
}) {
  const visible = locked ? [] : actionItems;
  const hidden = locked ? actionItems : [];

  return (
    <Card className="border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">Competitive analysis</h4>
        <Badge variant="secondary">Gap {scoreGap}</Badge>
      </div>
      {summary ? (
        <p className="mt-4 text-sm text-muted-foreground">{summary}</p>
      ) : null}

      <div className="mt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
          <LineChart className="h-4 w-4" />
          Opportunity actions
        </div>
        {visible.length > 0 ? (
          <SuggestionList items={visible} />
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            {locked ? "Unlock to view competitor action suggestions." : "No action suggestions found."}
          </p>
        )}

        {hidden.length > 0 ? (
          <div className="mt-5">
            <UnlockReportNotice
              message={`Unlock ${hidden.length} more action${hidden.length > 1 ? "s" : ""} in the full competitor report.`}
              onUnlock={onUnlock}
              unlockPriceLabel={unlockPriceLabel}
              unlocking={unlocking}
              unlockingLabel={unlockingLabel}
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
