import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import { CompetitorScanner } from "@/app/scanner/scanner-competitor-components";
import { ScannerSeoSections } from "@/app/scanner/scanner-seo-sections";
import { ScannerStructuredData } from "@/app/scanner/scanner-structured-data";

export const metadata: Metadata = MetaHead(pageMetadata.competitorScanner);

export default function CompetitorScannerPage() {
  return (
    <div className="relative overflow-hidden">
      <ScannerStructuredData variant="competitor" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
            Competitor Scanner
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Competitor Website Scanner & SEO Comparison Tool
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Compare your website against a competitor and uncover SEO,
            performance, accessibility, and conversion opportunities in one
            AI-powered comparison report.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          <CompetitorScanner standalone />
          <ScannerSeoSections variant="competitor" />
        </div>
      </section>
    </div>
  );
}
