export type ReviewStatus = "pending" | "approved" | "rejected";

export type PublicReview = {
  readonly id: number;
  readonly name: string;
  readonly roleCompany: string | null;
  readonly review: string;
  readonly createdAt: string;
};

export type AdminReview = PublicReview & {
  readonly email: string | null;
  readonly status: ReviewStatus;
  readonly userId: number | null;
  readonly reviewedAt: string | null;
};

export type Paginated<T> = {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

export type AdminReviewCounts = {
  readonly pending: number;
  readonly approved: number;
  readonly rejected: number;
};

export type AdminReviewList = Paginated<AdminReview> & {
  readonly counts: AdminReviewCounts;
};

export type ReviewSubmitBody = {
  readonly name: string;
  readonly roleCompany?: string;
  readonly email?: string;
  readonly review: string;
  readonly rating: number;
  readonly website: string;
};

export type ReviewSubmitResponse = {
  readonly success: true;
  readonly message: string;
};

export type ReviewStatusUpdate = {
  readonly id: number;
  readonly status: ReviewStatus;
  readonly reviewedAt: string | null;
};

export type ReviewDeleteResponse = {
  readonly success: true;
};
