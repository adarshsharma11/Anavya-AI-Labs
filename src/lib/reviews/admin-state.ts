import type {
  AdminReview,
  AdminReviewCounts,
  AdminReviewList,
  ReviewStatus,
} from "@/types/reviews";

export type ReviewTab = ReviewStatus | "all";

function clampCount(value: number): number {
  return value < 0 ? 0 : value;
}

function bumpCounts(
  counts: AdminReviewCounts,
  from: ReviewStatus | null,
  to: ReviewStatus | null
): AdminReviewCounts {
  return {
    pending: clampCount(counts.pending + (from === "pending" ? -1 : 0) + (to === "pending" ? 1 : 0)),
    approved: clampCount(counts.approved + (from === "approved" ? -1 : 0) + (to === "approved" ? 1 : 0)),
    rejected: clampCount(counts.rejected + (from === "rejected" ? -1 : 0) + (to === "rejected" ? 1 : 0)),
  };
}

export function applyStatusChange(
  list: AdminReviewList,
  id: number,
  nextStatus: ReviewStatus,
  currentTab: ReviewTab,
  reviewedAt: string | null
): AdminReviewList {
  const item = list.items.find((review) => review.id === id);
  if (!item || item.status === nextStatus) {
    return list;
  }

  const updated: AdminReview = {
    ...item,
    status: nextStatus,
    reviewedAt,
  };

  const staysVisible = currentTab === "all" || currentTab === nextStatus;

  return {
    ...list,
    items: staysVisible
      ? list.items.map((review) => (review.id === id ? updated : review))
      : list.items.filter((review) => review.id !== id),
    total: staysVisible ? list.total : Math.max(0, list.total - 1),
    counts: bumpCounts(list.counts, item.status, nextStatus),
  };
}

export function applyDelete(list: AdminReviewList, id: number): AdminReviewList {
  const item = list.items.find((review) => review.id === id);
  if (!item) return list;

  return {
    ...list,
    items: list.items.filter((review) => review.id !== id),
    total: Math.max(0, list.total - 1),
    counts: bumpCounts(list.counts, item.status, null),
  };
}

export function parseReviewTab(value: string | null | undefined): ReviewTab {
  if (value === "approved" || value === "rejected" || value === "all") {
    return value;
  }
  return "pending";
}

export function parsePage(value: string | null | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
