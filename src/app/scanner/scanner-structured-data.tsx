import { siteConfig } from "@/config/site";
import { getScannerSeoContent, type ScannerSeoVariant } from "./scanner-seo-content";

type ScannerStructuredDataProps = {
  variant: ScannerSeoVariant;
};

export function ScannerStructuredData({
  variant,
}: ScannerStructuredDataProps) {
  const { faqs } = getScannerSeoContent(variant);
  const pageUrl =
    variant === "website"
      ? `${siteConfig.url}/scanner`
      : `${siteConfig.url}/competitor-scanner`;

  const pageTitle =
    variant === "website"
      ? "See if ChatGPT can recommend your website"
      : "Competitor Website Scanner & SEO Comparison Tool";

  const pageDescription =
    variant === "website"
      ? "Free AEO and GEO scores in seconds. We show how ChatGPT, Perplexity, Gemini, Claude, and Bing read your pages — and the first fixes that help them cite you."
      : "Compare your website against a competitor and uncover SEO, performance, accessibility, and conversion opportunities in one AI-powered comparison report.";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: pageTitle,
    url: pageUrl,
    description: pageDescription,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
