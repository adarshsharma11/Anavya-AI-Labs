import { Suspense } from "react";

import { AdminReviewsClient, AdminReviewsSkeleton } from "./admin-reviews-client";

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve, reject, or remove submitted testimonials before they appear publicly.
        </p>
      </div>
      <Suspense fallback={<AdminReviewsSkeleton />}>
        <AdminReviewsClient />
      </Suspense>
    </div>
  );
}
