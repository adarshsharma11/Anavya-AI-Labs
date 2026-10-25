import { apiFetch } from "./client";
import type {
  AdminReviewList,
  Paginated,
  PublicReview,
  ReviewDeleteResponse,
  ReviewStatus,
  ReviewStatusUpdate,
  ReviewSubmitBody,
  ReviewSubmitResponse,
} from "@/types/reviews";

type Envelope<T> = T | { readonly data?: T; readonly success?: boolean };

function unwrapData<T>(payload: Envelope<T>): T {
  if (payload && typeof payload === "object" && "data" in payload && payload.data !== undefined) {
    return payload.data;
  }
  return payload as T;
}

function clampLimit(limit: number, max: number): number {
  if (!Number.isFinite(limit) || limit < 1) return 1;
  return Math.min(Math.floor(limit), max);
}

export async function submitReview(body: ReviewSubmitBody): Promise<ReviewSubmitResponse> {
  return apiFetch<ReviewSubmitResponse>("/reviews", {
    method: "POST",
    body: JSON.stringify({
      name: body.name,
      review: body.review,
      rating: body.rating,
      website: body.website,
      ...(body.roleCompany ? { roleCompany: body.roleCompany } : {}),
      ...(body.email ? { email: body.email } : {}),
    }),
  });
}

export async function getPublicReviews(params?: {
  readonly page?: number;
  readonly limit?: number;
}): Promise<Paginated<PublicReview>> {
  const page = params?.page && params.page > 0 ? params.page : 1;
  const limit = clampLimit(params?.limit ?? 12, 50);
  const search = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const payload = unwrapData(
    await apiFetch<Envelope<Paginated<PublicReview>>>(`/reviews?${search.toString()}`, {
      method: "GET",
      next: { revalidate: 300 },
    })
  );

  return {
    items: payload.items ?? [],
    total: payload.total ?? 0,
    page: payload.page ?? page,
    limit: payload.limit ?? limit,
  };
}

export async function getAdminReviews(params?: {
  readonly status?: ReviewStatus | "all";
  readonly page?: number;
  readonly limit?: number;
}): Promise<AdminReviewList> {
  const page = params?.page && params.page > 0 ? params.page : 1;
  const limit = clampLimit(params?.limit ?? 20, 100);
  const search = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (params?.status && params.status !== "all") {
    search.set("status", params.status);
  }

  const payload = unwrapData(
    await apiFetch<Envelope<AdminReviewList>>(`/admin/reviews?${search.toString()}`, {
      method: "GET",
    })
  );

  return {
    items: payload.items ?? [],
    total: payload.total ?? 0,
    page: payload.page ?? page,
    limit: payload.limit ?? limit,
    counts: payload.counts ?? { pending: 0, approved: 0, rejected: 0 },
  };
}

export async function setReviewStatus(
  id: number,
  status: ReviewStatus
): Promise<ReviewStatusUpdate> {
  const payload = await apiFetch<Envelope<ReviewStatusUpdate>>(`/admin/reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return unwrapData(payload);
}

export async function deleteReview(id: number): Promise<ReviewDeleteResponse> {
  return apiFetch<ReviewDeleteResponse>(`/admin/reviews/${id}`, {
    method: "DELETE",
  });
}
