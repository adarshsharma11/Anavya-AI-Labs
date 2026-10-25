import type { CSSProperties } from "react";

import { ReviewCard } from "@/components/reviews/review-card";
import type { PublicReview } from "@/types/reviews";

type ReviewsMarqueeProps = {
  readonly reviews: readonly PublicReview[];
};

function marqueeDuration(count: number) {
  return `${Math.max(24, count * 7)}s`;
}

function EdgeBlur({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";

  return (
    <div
      aria-hidden="true"
      className={
        isLeft
          ? "pointer-events-none absolute inset-y-0 left-0 z-10 w-20 sm:w-36"
          : "pointer-events-none absolute inset-y-0 right-0 z-10 w-20 sm:w-36"
      }
    >
      <div
        className={
          isLeft
            ? "absolute inset-0 backdrop-blur-lg [mask-image:linear-gradient(to_right,black_35%,transparent)]"
            : "absolute inset-0 backdrop-blur-lg [mask-image:linear-gradient(to_left,black_35%,transparent)]"
        }
      />
      <div
        className={
          isLeft
            ? "absolute inset-0 bg-gradient-to-r from-background from-10% via-background/80 to-transparent"
            : "absolute inset-0 bg-gradient-to-l from-background from-10% via-background/80 to-transparent"
        }
      />
    </div>
  );
}

export function ReviewsMarquee({ reviews }: ReviewsMarqueeProps) {
  if (reviews.length === 0) return null;

  return (
    <div
      className="group/marquee relative overflow-hidden outline-none"
      aria-label="Customer reviews"
      style={{ "--marquee-duration": marqueeDuration(reviews.length) } as CSSProperties}
    >
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            className="flex items-stretch gap-4 px-2 py-1"
          >
            {reviews.map((review) => (
              <li key={`${copy}-${review.id}`} className="w-[min(20rem,82vw)] shrink-0">
                <ReviewCard
                  review={review}
                  className="h-full min-h-[16rem] rounded-2xl border-border/70 bg-card shadow-sm [&>p]:line-clamp-6"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
      <EdgeBlur side="left" />
      <EdgeBlur side="right" />
    </div>
  );
}
