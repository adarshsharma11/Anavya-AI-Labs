import { siteConfig } from "@/config/site";
import type { Plan } from "@/types/pricing";

import { PRICING_FAQ } from "./pricing-faq";

type PricingJsonLdProps = {
  readonly plans: readonly Plan[];
};

export function PricingJsonLd({ plans }: PricingJsonLdProps) {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRICING_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const offers =
    plans.length === 0
      ? null
      : {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: plans.map((plan, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Offer",
              name: plan.name,
              description: plan.description ?? undefined,
              price: plan.price,
              priceCurrency: "USD",
              url: `${siteConfig.url}/pricing`,
            },
          })),
        };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      {offers ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offers) }} />
      ) : null}
    </>
  );
}
