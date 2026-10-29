import type { Metadata } from "next";
import { pageMetadata, siteConfig } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import LlmsTxtCheckerClient from "./llms-txt-client";

export const metadata: Metadata = MetaHead(pageMetadata.llmsTxtChecker);

export default function LlmsTxtCheckerPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free llms.txt Checker & Generator",
    url: `${siteConfig.url}/llms-txt-checker`,
    description: pageMetadata.llmsTxtChecker.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background glow effects matching theme */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-1/4 top-32 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <LlmsTxtCheckerClient />
    </div>
  );
}

