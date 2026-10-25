import { ReviewsJsonLd } from "@/components/reviews/reviews-json-ld";
import { ReviewsMarquee } from "@/components/reviews/reviews-marquee";
import { ShareExperienceCard } from "@/components/reviews/share-experience-card";
import { getPublicReviews } from "@/lib/api/reviews";
import type { PublicReview } from "@/types/reviews";

export async function HomeReviewsSection() {
  let reviews: readonly PublicReview[] = [];

  try {
    const data = await getPublicReviews({ page: 1, limit: 12 });
    reviews = data.items;
  } catch {
    reviews = [];
  }

  return (
    <section className="w-full border-t border-border">
      <ReviewsJsonLd reviews={reviews} />
      <div className="mx-auto max-w-[1400px] px-6 pt-20 lg:px-12">
        {reviews.length > 0 ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Reviews
            </p>
            <h2 className="mt-4 max-w-xl font-headline text-3xl font-semibold tracking-tight sm:text-4xl">
              What people say after a scan
            </h2>
          </>
        ) : null}
      </div>

      {reviews.length > 0 ? (
        <div className="mt-12">
          <ReviewsMarquee reviews={reviews} />
        </div>
      ) : null}

      <div className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-12">
        <div className={reviews.length > 0 ? "mt-16" : "pt-20"}>
          <ShareExperienceCard />
        </div>
      </div>
    </section>
  );
}
