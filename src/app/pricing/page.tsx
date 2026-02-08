import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import PricingClient from './pricing-client';

export const metadata: Metadata = MetaHead(pageMetadata.pricing);

export default function PricingPage() {
  return <PricingClient />;
}
