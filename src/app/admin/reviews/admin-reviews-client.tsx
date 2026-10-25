"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminReviewsBoard } from "@/components/reviews/admin-reviews-board";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { isApiError } from "@/lib/api/client";
import { deleteReview, getAdminReviews, setReviewStatus } from "@/lib/api/reviews";
import { parsePage, parseReviewTab } from "@/lib/reviews/admin-state";

export function AdminReviewsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();

  const tab = parseReviewTab(searchParams.get("status"));
  const page = parsePage(searchParams.get("page"));

  useEffect(() => {
    if (!isLoading && user?.role !== "admin") {
      router.replace("/login");
    }
  }, [isLoading, router, user?.role]);

  const query = useQuery({
    queryKey: ["admin-reviews", tab, page],
    queryFn: () => getAdminReviews({ status: tab, page, limit: 20 }),
    enabled: user?.role === "admin",
  });

  useEffect(() => {
    if (!query.error || !isApiError(query.error)) return;
    if (query.error.status === 401 || query.error.status === 403) {
      router.replace("/login");
    }
  }, [query.error, router]);

  const refreshLists = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-reviews-counts"] });
    router.refresh();
  };

  if (isLoading || !user || user.role !== "admin") {
    return <AdminReviewsSkeleton />;
  }

  if (query.isLoading) {
    return <AdminReviewsSkeleton />;
  }

  if (query.error) {
    return (
      <div role="alert" className="border border-destructive/30 bg-destructive/10 px-4 py-6 text-sm text-destructive">
        Could not load reviews. {isApiError(query.error) ? query.error.message : "Try again."}
      </div>
    );
  }

  if (!query.data) {
    return (
      <div className="border border-border px-4 py-10 text-center text-sm text-muted-foreground">
        No reviews found.
      </div>
    );
  }

  return (
    <AdminReviewsBoard
      key={`${tab}-${page}`}
      list={query.data}
      tab={tab}
      page={page}
      onSetStatus={setReviewStatus}
      onDelete={deleteReview}
      onMutated={refreshLists}
    />
  );
}

export function AdminReviewsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
