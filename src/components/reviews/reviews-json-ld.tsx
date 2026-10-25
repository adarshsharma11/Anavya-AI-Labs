import type { PublicReview } from "@/types/reviews";

type ReviewsJsonLdProps = {
  readonly reviews: readonly PublicReview[];
};

export function ReviewsJsonLd({ reviews }: ReviewsJsonLdProps) {
  if (reviews.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: reviews.map((review, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Quotation",
        text: review.review,
        creator: {
          "@type": "Person",
          name: review.name,
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
