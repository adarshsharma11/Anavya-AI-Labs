import type { Metadata } from "next";
import { Suspense } from "react";

import { MetaHead } from "@/components/seo/meta-head";
import { pageMetadata } from "@/config/site";
import { fetchPricingPlans } from "@/lib/api/pricing";
import type { Plan } from "@/types/pricing";

import { PricingFaq } from "./pricing-faq";
import { PricingJsonLd } from "./pricing-json-ld";
import { PricingPlans } from "./pricing-plans";
import { PricingRetry } from "./pricing-retry";

export const metadata: Metadata = MetaHead(pageMetadata.pricing);

export default async function PricingPage() {
  let plans: readonly Plan[] = [];
  let loadError = false;

  try {
    plans = await fetchPricingPlans();
  } catch {
    loadError = true;
  }

  return (
    <section className="container py-16 md:py-24">
      <PricingJsonLd plans={plans} />
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
          Free AI &amp; search readiness audits. Upgrade when you need more.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every scan includes the full AEO, GEO, technical and content audit plus a free PDF.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-6xl">
        {loadError ? (
          <div className="mb-8 rounded-2xl border border-border/70 bg-card px-6 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Paid plans could not be loaded right now. You can still start with the free audit.
            </p>
            <div className="mt-4">
              <PricingRetry />
            </div>
          </div>
        ) : null}

        <Suspense fallback={null}>
          <PricingPlans plans={plans} />
        </Suspense>
        <PricingFaq />
      </div>
    </section>
  );
}
