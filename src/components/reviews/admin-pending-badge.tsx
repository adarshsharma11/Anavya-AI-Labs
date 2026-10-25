"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { getAdminReviews } from "@/lib/api/reviews";
import { cn } from "@/lib/utils";

type AdminPendingReviewsBadgeProps = {
  className?: string;
  variant?: "badge" | "dot";
};

export function AdminPendingReviewsBadge({
  className,
  variant = "badge",
}: AdminPendingReviewsBadgeProps) {
  const query = useQuery({
    queryKey: ["admin-reviews-counts"],
    queryFn: () => getAdminReviews({ page: 1, limit: 1 }),
    staleTime: 30_000,
  });

  const pending = query.data?.counts.pending ?? 0;
  if (pending < 1) return null;

  if (variant === "dot") {
    return (
      <span
        aria-label={`${pending} pending reviews`}
        className={cn("size-1.5 rounded-full bg-primary", className)}
      />
    );
  }

  return (
    <Badge variant="secondary" className={cn("relative z-10 tabular-nums", className)}>
      {pending}
    </Badge>
  );
}
