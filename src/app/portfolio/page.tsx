import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import PortfolioClient from './portfolio-client';
import { getPortfolioApi, type PortfolioItem } from "@/lib/api/portfolio";

export const metadata: Metadata = MetaHead(pageMetadata.portfolio);

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  let portfolioItems: PortfolioItem[] = [];
  try {
    const res = await getPortfolioApi();
    if (res.success) {
      portfolioItems = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch portfolio items:", error);
    portfolioItems = [];
  }

  return <PortfolioClient initialItems={portfolioItems} />;
}
