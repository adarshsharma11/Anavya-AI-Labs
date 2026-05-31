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
      ? "Free AI Website Scanner & SEO Audit Tool"
      : "Competitor Website Scanner & SEO Comparison Tool";

  const pageDescription =
    variant === "website"
      ? "Scan your website for SEO, performance, accessibility, and security issues. Get a free AI-powered website audit with instant fixes and competitor insights."
      : "Compare your website against a competitor to uncover SEO, performance, accessibility, and conversion gaps with an AI-powered competitor website scanner.";

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
    "@type": variant === "website" ? "SoftwareApplication" : "WebPage",
    name: pageTitle,
    url: pageUrl,
    description: pageDescription,
    applicationCategory:
      variant === "website" ? "BusinessApplication" : undefined,
    operatingSystem: variant === "website" ? "Web" : undefined,
    offers:
      variant === "website"
        ? {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          }
        : undefined,
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
