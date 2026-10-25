"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, Trash2, X } from "lucide-react";

import { revalidatePublicReviewPages } from "@/app/admin/reviews/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { isApiError } from "@/lib/api/client";
import { applyDelete, applyStatusChange, type ReviewTab } from "@/lib/reviews/admin-state";
import { formatAbsoluteDate } from "@/lib/reviews/format";
import type { AdminReview, AdminReviewList, ReviewStatus } from "@/types/reviews";

type AdminReviewsBoardProps = {
  readonly list: AdminReviewList;
  readonly tab: ReviewTab;
  readonly page: number;
  readonly onSetStatus: (id: number, status: ReviewStatus) => Promise<{
    readonly id: number;
    readonly status: ReviewStatus;
    readonly reviewedAt: string | null;
  }>;
  readonly onDelete: (id: number) => Promise<{ readonly success: true }>;
  readonly onMutated?: () => void;
};

const TABS: ReadonlyArray<{ readonly id: ReviewTab; readonly label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

function tabCount(list: AdminReviewList, tab: ReviewTab): number {
  if (tab === "all") {
    return list.counts.pending + list.counts.approved + list.counts.rejected;
  }
  return list.counts[tab];
}

export function AdminReviewsBoard({
  list,
  tab,
  page,
  onSetStatus,
  onDelete,
  onMutated,
}: AdminReviewsBoardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState(list);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [expanded, setExpanded] = useState<readonly number[]>([]);
  const [busyIds, setBusyIds] = useState<readonly number[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allVisibleSelected =
    view.items.length > 0 && view.items.every((item) => selectedSet.has(item.id));

  const goToTab = (next: ReviewTab, nextPage = 1) => {
    const params = new URLSearchParams();
    if (next !== "pending") params.set("status", next);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    router.push(query ? `/admin/reviews?${query}` : "/admin/reviews");
  };

  const markBusy = (ids: readonly number[], busy: boolean) => {
    setBusyIds((prev) =>
      busy ? Array.from(new Set([...prev, ...ids])) : prev.filter((id) => !ids.includes(id))
    );
  };

  const changeStatus = async (ids: readonly number[], nextStatus: ReviewStatus) => {
    const snapshot = view;
    const now = new Date().toISOString();
    let nextView = view;
    for (const id of ids) {
      nextView = applyStatusChange(nextView, id, nextStatus, tab, now);
    }
    setView(nextView);
    setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    markBusy(ids, true);

    const results = await Promise.allSettled(ids.map((id) => onSetStatus(id, nextStatus)));
    const failures = results.filter((result) => result.status === "rejected");

    if (failures.length > 0) {
      setView(snapshot);
      toast({
        variant: "destructive",
        title: "Could not update reviews",
        description:
          failures.length === ids.length
            ? "The status change failed. Try again."
            : `${failures.length} of ${ids.length} updates failed.`,
      });
    } else if (nextStatus === "approved" || snapshot.items.some((item) => ids.includes(item.id) && item.status === "approved")) {
      try {
        await revalidatePublicReviewPages();
      } catch {
        // Public pages will refresh on the next ISR window.
      }
    }

    markBusy(ids, false);
    onMutated?.();
  };

  const removeReview = async (review: AdminReview) => {
    const snapshot = view;
    setView(applyDelete(view, review.id));
    setDeleteTarget(null);
    markBusy([review.id], true);
    try {
      await onDelete(review.id);
      if (review.status === "approved") {
        await revalidatePublicReviewPages();
      }
      onMutated?.();
    } catch (error) {
      setView(snapshot);
      toast({
        variant: "destructive",
        title: "Could not delete review",
        description: isApiError(error) ? error.message : "Try again.",
      });
    } finally {
      markBusy([review.id], false);
    }
  };

  const handleBulk = async (nextStatus: ReviewStatus) => {
    if (selected.length === 0) return;
    setBulkBusy(true);
    await changeStatus(selected, nextStatus);
    setBulkBusy(false);
  };

  const totalPages = Math.max(1, Math.ceil(view.total / view.limit));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Review status">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => goToTab(item.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              <Badge variant={active ? "default" : "secondary"}>{tabCount(view, item.id)}</Badge>
            </button>
          );
        })}
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">{selected.length} selected</p>
          <Button size="sm" disabled={bulkBusy} onClick={() => void handleBulk("approved")}>
            Approve selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={bulkBusy}
            onClick={() => void handleBulk("rejected")}
          >
            Reject selected
          </Button>
        </div>
      ) : null}

      {view.items.length === 0 ? (
        <div className="border border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No reviews in this tab.
        </div>
      ) : (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={(checked) => {
                setSelected(checked ? view.items.map((item) => item.id) : []);
              }}
              aria-label="Select all reviews on this page"
            />
            Select all on this page
          </label>

          <ul className="space-y-3">
            {view.items.map((review) => {
              const isExpanded = expanded.includes(review.id);
              const isBusy = busyIds.includes(review.id);
              return (
                <li key={review.id} className="border border-border bg-background p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedSet.has(review.id)}
                      onCheckedChange={(checked) => {
                        setSelected((prev) =>
                          checked
                            ? [...prev, review.id]
                            : prev.filter((id) => id !== review.id)
                        );
                      }}
                      aria-label={`Select review from ${review.name}`}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{review.name}</p>
                          {review.roleCompany ? (
                            <p className="text-sm text-muted-foreground">{review.roleCompany}</p>
                          ) : null}
                          {review.email ? (
                            <a
                              href={`mailto:${review.email}`}
                              className="text-sm text-primary underline-offset-4 hover:underline"
                            >
                              {review.email}
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground">No email</p>
                          )}
                        </div>
                        <Badge variant="outline">{review.status}</Badge>
                      </div>

                      <p className={`whitespace-pre-line text-sm leading-6 ${isExpanded ? "" : "line-clamp-3"}`}>
                        {review.review}
                      </p>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                        onClick={() =>
                          setExpanded((prev) =>
                            prev.includes(review.id)
                              ? prev.filter((id) => id !== review.id)
                              : [...prev, review.id]
                          )
                        }
                      >
                        {isExpanded ? "Show less" : "Expand"}
                      </button>

                      <dl className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                        <div>
                          <dt className="inline">Submitted: </dt>
                          <dd className="inline">{formatAbsoluteDate(review.createdAt)}</dd>
                        </div>
                        <div>
                          <dt className="inline">Reviewed: </dt>
                          <dd className="inline">{formatAbsoluteDate(review.reviewedAt)}</dd>
                        </div>
                      </dl>

                      <div className="flex flex-wrap gap-2">
                        {review.status !== "approved" ? (
                          <Button
                            size="sm"
                            disabled={isBusy}
                            onClick={() => void changeStatus([review.id], "approved")}
                          >
                            {isBusy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-2 h-3.5 w-3.5" />}
                            Approve
                          </Button>
                        ) : null}
                        {review.status !== "rejected" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => void changeStatus([review.id], "rejected")}
                          >
                            <X className="mr-2 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        ) : null}
                        {review.status !== "pending" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isBusy}
                            onClick={() => void changeStatus([review.id], "pending")}
                          >
                            <RotateCcw className="mr-2 h-3.5 w-3.5" />
                            Move back to pending
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={isBusy}
                          onClick={() => setDeleteTarget(review)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between gap-3 text-sm" aria-label="Pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToTab(tab, page - 1)}
          >
            Previous
          </Button>
          <p className="text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToTab(tab, page + 1)}
          >
            Next
          </Button>
        </nav>
      ) : null}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The review from {deleteTarget?.name ?? "this person"} will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) void removeReview(deleteTarget);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
