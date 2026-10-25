import { formatRelativeDate, getInitials } from "@/lib/reviews/format";
import { cn } from "@/lib/utils";
import type { PublicReview } from "@/types/reviews";

type ReviewCardProps = {
  readonly review: PublicReview;
  readonly className?: string;
};

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col justify-between border border-border bg-background p-6",
        className
      )}
    >
      <p className="whitespace-pre-line text-sm leading-6 text-foreground">
        {review.review}
      </p>
      <footer className="mt-8 flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tracking-wide text-foreground"
        >
          {getInitials(review.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{review.name}</p>
          {review.roleCompany ? (
            <p className="truncate text-sm text-muted-foreground">{review.roleCompany}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">{formatRelativeDate(review.createdAt)}</p>
        </div>
      </footer>
    </article>
  );
}
