import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import AboutClient from './about-client';

export const metadata: Metadata = MetaHead(pageMetadata.about);

export default function AboutPage() {
  return <AboutClient />;
}
