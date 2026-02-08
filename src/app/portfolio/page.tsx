import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import PortfolioClient from './portfolio-client';

export const metadata: Metadata = MetaHead(pageMetadata.portfolio);

export default function PortfolioPage() {
  return <PortfolioClient />;
}
