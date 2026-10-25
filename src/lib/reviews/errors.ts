import type { ApiError } from "@/lib/api/client";

import { isReviewFormField, type ReviewFormField } from "./schema";

export type ReviewSubmitErrorKind = "rate_limited" | "field" | "unknown";

export type MappedReviewSubmitError = {
  readonly kind: ReviewSubmitErrorKind;
  readonly field?: ReviewFormField;
  readonly message: string;
};

export function mapReviewSubmitError(error: ApiError): MappedReviewSubmitError {
  if (error.status === 429 || error.code === "RATE_LIMITED") {
    return { kind: "rate_limited", message: error.message };
  }

  if (error.code === "INVALID_REVIEW" && isReviewFormField(error.field)) {
    return { kind: "field", field: error.field, message: error.message };
  }

  return { kind: "unknown", message: error.message };
}
