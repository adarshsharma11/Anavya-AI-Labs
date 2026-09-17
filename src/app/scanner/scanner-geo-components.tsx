import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, ExternalLink } from "lucide-react";
import type { GeoCheckResponse } from "@/lib/api/scan";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreBar, SeverityBadge } from "./scanner-ui-primitives";

interface GeoReportProps {
  report: GeoCheckResponse;
  onReset: () => void;
}

export function GeoReportSection({ report, onReset }: GeoReportProps) {
  const getGrade = (val: number) => {
    if (val >= 90) return { char: "A", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    if (val >= 80) return { char: "B", color: "text-sky-500 bg-sky-500/10 border-sky-500/20" };
    if (val >= 70) return { char: "C", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    if (val >= 60) return { char: "D", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" };
    return { char: "F", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
  };

  const grade = getGrade(report.score.value);
  const angle = Math.round((report.score.value / 100) * 360);

  // Category percentage helper
  const catPercent = (score: number, max: number) => {
    return Math.round((score / max) * 100);
  };

  const checklistItems = [
    {
      key: "robotsAllowed",
      passed: report.checks.robotsAllowed,
      passedLabel: "robots.txt allows GPTBot & AI Crawlers",
      failedLabel: "robots.txt blocks GPTBot & AI Crawlers",
      passedDesc: "OpenAI, Anthropic, and other AI systems are allowed to scan your pages.",
      failedDesc: "AI crawlers are blocked in robots.txt, so GPTBot and similar bots cannot index this site.",
    },
    {
      key: "llmsTxt",
      passed: report.checks.llmsTxt,
      passedLabel: "llms.txt configuration file present",
      failedLabel: "llms.txt configuration file not present",
      passedDesc: "A clean LLM index file was found for your resources.",
      failedDesc: "No llms.txt file was found at the site root. Add one so LLMs can discover your content.",
    },
    {
      key: "sitemap",
      passed: report.checks.sitemap,
      passedLabel: "Valid XML Sitemap discovered",
      failedLabel: "Valid XML Sitemap not discovered",
      passedDesc: "A sitemap was found to help crawlers discover your URLs.",
      failedDesc: "No valid sitemap.xml was found. Add one so search and AI crawlers can index your pages.",
    },
    {
      key: "schema",
      passed: report.checks.schema,
      passedLabel: "Structured Schema metadata present",
      failedLabel: "Structured Schema metadata not present",
      passedDesc: "JSON-LD blocks such as Article, Product, or Organization were detected.",
      failedDesc: "No JSON-LD structured data was found. Add schema so AI systems can identify your entities.",
    },
    {
      key: "faqSchema",
      passed: report.checks.faqSchema,
      passedLabel: "FAQ / HowTo structural mapping present",
      failedLabel: "FAQ / HowTo structural mapping not present",
      passedDesc: "FAQ or HowTo schema is available for conversational AI answers.",
      failedDesc: "No FAQ or HowTo schema was found. Add it to help AI engines cite direct answers.",
    },
    {
      key: "metaDescription",
      passed: report.checks.metaDescription,
      passedLabel: "Meta description tags present",
      failedLabel: "Meta description tags not present",
      passedDesc: "A meta description is available for search and generative snippets.",
      failedDesc: "No meta description was found. Add one so AI and search engines can summarize the page.",
    },
    {
      key: "canonical",
      passed: report.checks.canonical,
      passedLabel: "Canonical link tags defined",
      failedLabel: "Canonical link tags not defined",
      passedDesc: "A canonical URL is defined to consolidate ranking authority.",
      failedDesc: "No canonical tag was found. Add one to avoid duplicate-content confusion for crawlers.",
    },
    {
      key: "author",
      passed: report.checks.author,
      passedLabel: "Author attribution metadata present",
      failedLabel: "Author attribution metadata not present",
      passedDesc: "Author identity metadata was found, which supports E-E-A-T signals.",
      failedDesc: "No author metadata was found. Add creator attribution to strengthen E-E-A-T credibility.",
    },
    {
      key: "publishedDate",
      passed: report.checks.publishedDate,
      passedLabel: "Publication or modification dates present",
      failedLabel: "Publication or modification dates not present",
      passedDesc: "Publish or modified dates were found so engines can judge freshness.",
      failedDesc: "No publication or modification date was found. Add dates so AI systems can verify freshness.",
    },
    {
      key: "openGraph",
      passed: report.checks.openGraph,
      passedLabel: "OpenGraph metadata tags complete",
      failedLabel: "OpenGraph metadata tags not complete",
      passedDesc: "Open Graph tags are in place for rich share previews.",
      failedDesc: "Open Graph tags are missing or incomplete. Add og:title, og:description, and og:image.",
    },
    {
      key: "twitterCards",
      passed: report.checks.twitterCards,
      passedLabel: "Twitter Cards meta configuration complete",
      failedLabel: "Twitter Cards meta configuration not complete",
      passedDesc: "Twitter Card tags are configured for social embeds.",
      failedDesc: "Twitter Card tags are missing. Add twitter:card and twitter:title for social previews.",
    },
    {
      key: "readability",
      passed: report.checks.readability,
      passedLabel: "Page readability standards met",
      failedLabel: "Page readability standards not met",
      passedDesc: "Paragraph length and heading outline meet readability standards.",
      failedDesc: "The page structure did not meet readability standards. Tighten headings and paragraph length.",
    },
    {
      key: "technical",
      passed: report.checks.technical,
      passedLabel: "Technical tags (Viewport & Charset) configured",
      failedLabel: "Technical tags (Viewport & Charset) not configured",
      passedDesc: "Viewport, charset, and indexability tags are configured.",
      failedDesc: "Viewport, charset, or indexability tags are missing or misconfigured.",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header details block */}
      <Card className="border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl font-bold font-headline text-foreground">
                GEO Analysis Report
              </h2>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-lg md:max-w-none">
              Analyzed URL: <span className="font-medium text-foreground underline">{report.url}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onReset}>
              Scan New Website
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Score overview layout */}
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Overall GEO Score
          </h3>
          
          <div className="relative h-44 w-44 mb-6">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#10b981 ${angle}deg, rgba(148,163,184,0.15) 0deg)`,
              }}
            />
            <div className="absolute inset-3.5 rounded-full bg-background/95 flex flex-col items-center justify-center" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black font-headline tracking-tight text-foreground">
                {report.score.value}
              </span>
              <span className="text-xs font-semibold text-muted-foreground uppercase mt-0.5">
                of 100
              </span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider ${grade.color}`}>
            Grade {grade.char}
          </div>
        </Card>

        {/* Category scores block */}
        <Card className="border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Category Score Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Deterministic technical criteria mapped to LLM crawling and discovery signals.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ScoreBar
              label={`AI Bot Crawlability (${report.categories.crawlability}/15)`}
              value={catPercent(report.categories.crawlability, 15)}
              tone="emerald"
            />
            <ScoreBar
              label={`Structured Schema (${report.categories.schema}/20)`}
              value={catPercent(report.categories.schema, 20)}
              tone="sky"
            />
            <ScoreBar
              label={`Content Readability (${report.categories.content}/20)`}
              value={catPercent(report.categories.content, 20)}
              tone="violet"
            />
            <ScoreBar
              label={`Metadata & Sitemaps (${report.categories.metadata}/15)`}
              value={catPercent(report.categories.metadata, 15)}
              tone="amber"
            />
            <ScoreBar
              label={`LLM Authority (${report.categories.authority}/20)`}
              value={catPercent(report.categories.authority, 20)}
              tone="emerald"
            />
            <ScoreBar
              label={`Technical Configurations (${report.categories.technical}/10)`}
              value={catPercent(report.categories.technical, 10)}
              tone="sky"
            />
          </div>
        </Card>
      </div>

      {/* Main Checklist / Details and Recommendations */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Checklist */}
        <Card className="border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur space-y-6">
          <div>
            <h3 className="text-base font-bold font-headline text-foreground">
              Technical Audit Checklist
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Detailed breakdown of signals evaluated for LLM search indexing optimization.
            </p>
          </div>

          <div className="space-y-4">
            {checklistItems.map((item) => (
              <div key={item.key} className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/40 p-3.5 transition-all hover:bg-background/80">
                <div className="mt-0.5 flex-shrink-0">
                  {item.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : item.key === "faqSchema" || item.key === "openGraph" || item.key === "twitterCards" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="text-sm font-semibold text-foreground">
                    {item.passed ? item.passedLabel : item.failedLabel}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.passed ? item.passedDesc : item.failedDesc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations list */}
        <Card className="border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-headline text-foreground">
                Actionable Recommendations
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Solve these warnings to boost indexability and RAG ranking context.
              </p>
            </div>
            {report.recommendations.length > 0 ? (
              <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500 border border-rose-500/20">
                {report.recommendations.length} issues
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                0 issues
              </span>
            )}
          </div>

          <div className="space-y-4">
            {report.recommendations.length > 0 ? (
              report.recommendations.map((rec, index) => (
                <div key={index} className="space-y-2 rounded-2xl border border-border/60 bg-background/50 p-4 transition-all hover:bg-background/80">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {rec.title}
                    </span>
                    <SeverityBadge severity={rec.severity} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500 border border-emerald-500/20">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    Perfect GEO setup!
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Your website has optimized technical configurations and is fully discoverable for AI-powered engines.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
