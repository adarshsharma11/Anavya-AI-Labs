import type { CheckStatus } from "@/types/audit";

export function scoreTone(value: number | null): "green" | "amber" | "red" | "grey" {
  if (value === null) return "grey";
  if (value >= 70) return "green";
  if (value >= 50) return "amber";
  return "red";
}

export function scoreToneClass(value: number | null): string {
  switch (scoreTone(value)) {
    case "green":
      return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
    case "amber":
      return "text-amber-600 bg-amber-500/10 border-amber-500/20";
    case "red":
      return "text-rose-600 bg-rose-500/10 border-rose-500/20";
    default:
      return "text-muted-foreground bg-muted/50 border-border/60";
  }
}

export function scoreBarClass(value: number | null): string {
  switch (scoreTone(value)) {
    case "green":
      return "bg-emerald-500";
    case "amber":
      return "bg-amber-500";
    case "red":
      return "bg-rose-500";
    default:
      return "bg-muted-foreground/30";
  }
}

export function formatScore(value: number | null): string {
  return value === null ? "—" : String(value);
}

export function scoreLabel(value: number | null): string {
  return value === null ? "Not measured" : `${value} of 100`;
}

export function statusLabel(status: CheckStatus): string {
  switch (status) {
    case "pass":
      return "Pass";
    case "partial":
      return "Partial";
    case "fail":
      return "Fail";
    case "na":
      return "Not applicable";
  }
}

export function pagePath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname || "/";
  } catch {
    return url;
  }
}

export function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "report";
  }
}
