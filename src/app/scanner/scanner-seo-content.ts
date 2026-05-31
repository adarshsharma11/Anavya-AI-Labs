import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

export type ScannerSeoVariant = "website" | "competitor";

export type ScannerReason = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type ScannerFaq = {
  question: string;
  answer: string;
};

export const websiteReasons: readonly ScannerReason[] = [
  {
    title: "Prioritized audit results",
    description:
      "Get an overall score, issue severity, and practical next steps so you know what to fix first.",
    icon: Target,
  },
  {
    title: "SEO plus technical coverage",
    description:
      "Review performance, accessibility, security, indexing, and metadata in one place instead of stitching together multiple tools.",
    icon: Search,
  },
  {
    title: "Built for fast action",
    description:
      "Use the quick wins, AI suggestions, and downloadable report to turn scan results into real updates faster.",
    icon: Sparkles,
  },
] as const;

export const competitorReasons: readonly ScannerReason[] = [
  {
    title: "See the real performance gap",
    description:
      "Benchmark your site against a competitor to understand where you are losing on speed, SEO, and technical quality.",
    icon: Trophy,
  },
  {
    title: "Find actionable opportunities",
    description:
      "Turn side-by-side competitor data into priority actions your team can ship to catch up or pull ahead.",
    icon: BarChart3,
  },
  {
    title: "Use one report for strategy",
    description:
      "Combine technical signals and AI-generated recommendations into one comparison report for growth decisions.",
    icon: ShieldCheck,
  },
] as const;

export const websiteFaqs: readonly ScannerFaq[] = [
  {
    question: "What does the AI website scanner check?",
    answer:
      "The scanner reviews SEO, performance, accessibility, security, indexing signals, metadata quality, and key technical issues that affect discoverability and user experience.",
  },
  {
    question: "Who should use this scanner?",
    answer:
      "It is useful for founders, marketers, developers, agencies, and product teams that want a quick technical audit before making website improvements.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No. You can enter a public URL and run the scan directly without adding code, plugins, or setup steps.",
  },
] as const;

export const competitorFaqs: readonly ScannerFaq[] = [
  {
    question: "What does the competitor scanner compare?",
    answer:
      "It compares your website and a competitor across performance, SEO, accessibility, security, and AI-generated opportunity insights.",
  },
  {
    question: "When should I use the competitor scanner?",
    answer:
      "Use it when you want to understand why another site may be ranking better, converting better, or delivering a stronger technical experience.",
  },
  {
    question: "Can I still use the regular website scanner?",
    answer:
      "Yes. The regular scanner is best for auditing one website, while the competitor scanner is better for side-by-side benchmarking.",
  },
] as const;

export function getScannerSeoContent(variant: ScannerSeoVariant) {
  return {
    reasons: variant === "website" ? websiteReasons : competitorReasons,
    faqs: variant === "website" ? websiteFaqs : competitorFaqs,
  };
}
