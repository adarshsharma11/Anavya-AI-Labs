"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export function ScoreBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "sky" | "amber" | "violet";
}) {
  const toneMap = {
    emerald: "from-emerald-500 to-emerald-300",
    sky: "from-sky-500 to-sky-300",
    amber: "from-amber-500 to-amber-300",
    violet: "from-violet-500 to-violet-300",
  }[tone];

  return (
    <div>
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-xs text-muted-foreground">{value}/100</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-muted">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${toneMap}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function CircularScore({ value }: { value: number }) {
  const angle = Math.round((value / 100) * 360);
  return (
    <div className="relative h-40 w-40">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#22c55e ${angle}deg, rgba(148,163,184,0.2) 0deg)`,
        }}
      />
      <div className="absolute inset-3 rounded-full bg-background" />
      <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold">
        {value}
      </div>
    </div>
  );
}

export function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-2">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function StatusRow({
  label,
  value,
  positiveLabel,
  negativeLabel,
}: {
  label: string;
  value: boolean;
  positiveLabel: string;
  negativeLabel: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-2">
      <span>{label}</span>
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
        {value ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 text-rose-500" />
        )}
        {value ? positiveLabel : negativeLabel}
      </span>
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const s = (severity || "").toLowerCase();
  const map: Record<string, string> = {
    high: "border-red-500/40 bg-red-500/10 text-red-600",
    medium: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  };
  const className = map[s] || "border-sky-500/40 bg-sky-500/10 text-sky-600";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${className}`}
    >
      {severity}
    </span>
  );
}

export function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <button onClick={copy} className="text-[10px] font-medium transition hover:text-primary">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-border/50 bg-muted/30 p-3 text-xs font-mono text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function SkeletonCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-left">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-3 h-3 w-3/4 animate-pulse rounded-full bg-muted" />
      <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-muted" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-muted" />
    </div>
  );
}
