import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import ServicesClient from './services-client';

export const metadata: Metadata = MetaHead(pageMetadata.services);

export default function ServicesPage() {
  return <ServicesClient />;
}
