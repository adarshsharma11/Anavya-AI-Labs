import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import PricingClient from './pricing-client';
import { fetchPricingPlans, type PricingPlan } from "@/lib/api/pricing";

export const metadata: Metadata = MetaHead(pageMetadata.pricing);
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  let initialPlans: PricingPlan[] = [];
  try {
    initialPlans = await fetchPricingPlans({ cache: "no-store" });
  } catch {
    initialPlans = [];
  }

  return <PricingClient initialPlans={initialPlans} />;
}
