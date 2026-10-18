import { cn } from "@/lib/utils";

export type ReportStage = 0 | 1 | 2 | 3;

const ISSUES = [
  { id: "geo", label: "llms.txt missing", detail: "AI crawlers have no index of your pages." },
  { id: "inp", label: "INP 410ms", detail: "Interaction delay is losing taps and sales." },
  { id: "schema", label: "No FAQ schema", detail: "Google and ChatGPT cannot quote answers." },
] as const;

const FIXES = [
  "Allow GPTBot and other AI crawlers in robots.txt",
  "Publish an llms.txt with your key URLs",
  "Cut INP below 200ms on the checkout and scan flows",
  "Add FAQ JSON-LD only on pages that show FAQs",
] as const;

export function ScanReportFrame({
  stage,
  className,
}: {
  stage: ReportStage;
  className?: string;
}) {
  const score = stage === 0 ? 91 : stage === 1 ? 64 : stage === 2 ? 48 : 72;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-none",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
        <p className="ml-3 truncate font-mono text-[11px] text-muted-foreground">
          anavyaailabs.com/scanner
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border">
          <div className="text-center">
            <p className="font-headline text-2xl font-semibold leading-none">{score}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Score
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <ScoreRow label="SEO" value={stage === 0 ? 88 : 61} />
          <ScoreRow label="Performance" value={stage === 0 ? 84 : 54} />
          <ScoreRow label="GEO" value={stage === 0 ? 90 : stage === 3 ? 68 : 28} />
        </div>
      </div>

      <div className="border-t border-border px-5 py-4">
        {stage <= 1 ? (
          <ul className="space-y-3">
            {ISSUES.map((issue, index) => {
              const visible = stage === 0 ? index === 0 : true;
              return (
                <li
                  key={issue.id}
                  className={cn(
                    "flex items-start justify-between gap-4 text-sm transition-opacity duration-300",
                    visible ? "opacity-100" : "opacity-30"
                  )}
                >
                  <span>
                    <span className="font-medium">{issue.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {issue.detail}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {stage === 0 ? "Hidden" : "Open"}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : stage === 2 ? (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Traffic at risk
            </p>
            <p className="font-headline text-3xl font-semibold tracking-tight">
              Pages not cited
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Missing GEO files and slow INP keep the site out of AI answers and
              drop conversion on the pages that should sell.
            </p>
          </div>
        ) : (
          <ol className="space-y-2.5">
            {FIXES.map((fix, index) => (
              <li key={fix} className="flex gap-3 text-sm">
                <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{fix}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
      <div className="h-1 w-full bg-muted">
        <div className="h-1 bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
