import { z } from "zod";

export const REVIEW_FIELD_LIMITS = {
  name: { min: 2, max: 80 },
  roleCompany: { max: 120 },
  review: { min: 10, max: 2000 },
} as const;

export const REVIEW_RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
} as const;

export const REVIEW_FORM_FIELDS = [
  "rating",
  "name",
  "roleCompany",
  "email",
  "review",
  "confirmed",
] as const;

export type ReviewFormField = (typeof REVIEW_FORM_FIELDS)[number];
export type ReviewRating = keyof typeof REVIEW_RATING_LABELS;

export const reviewFormSchema = z.object({
  rating: z
    .number({ required_error: "Select a star rating" })
    .int()
    .min(1, "Select a star rating")
    .max(5, "Select a star rating"),
  name: z
    .string()
    .trim()
    .min(
      REVIEW_FIELD_LIMITS.name.min,
      `Name must be at least ${REVIEW_FIELD_LIMITS.name.min} characters`
    )
    .max(
      REVIEW_FIELD_LIMITS.name.max,
      `Name must be at most ${REVIEW_FIELD_LIMITS.name.max} characters`
    ),
  roleCompany: z
    .string()
    .trim()
    .max(
      REVIEW_FIELD_LIMITS.roleCompany.max,
      `Role / Company must be at most ${REVIEW_FIELD_LIMITS.roleCompany.max} characters`
    )
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  review: z
    .string()
    .trim()
    .min(
      REVIEW_FIELD_LIMITS.review.min,
      `Review must be at least ${REVIEW_FIELD_LIMITS.review.min} characters`
    )
    .max(
      REVIEW_FIELD_LIMITS.review.max,
      `Review must be at most ${REVIEW_FIELD_LIMITS.review.max} characters`
    ),
  confirmed: z.literal(true, {
    errorMap: () => ({
      message: "Confirm this review is based on your genuine experience.",
    }),
  }),
  website: z.string(),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export const reviewFormDefaults: ReviewFormValues = {
  rating: 0,
  name: "",
  roleCompany: "",
  email: "",
  review: "",
  confirmed: false as unknown as true,
  website: "",
};

export function ratingLabel(rating: number): string | null {
  if (rating < 1 || rating > 5) return null;
  return `${rating.toFixed(1)} - ${REVIEW_RATING_LABELS[rating as ReviewRating]}`;
}

export function toReviewSubmitBody(values: ReviewFormValues) {
  const roleCompany = values.roleCompany?.trim() ?? "";
  const email = values.email?.trim() ?? "";

  return {
    name: values.name.trim(),
    review: values.review.trim(),
    rating: values.rating,
    website: "",
    ...(roleCompany ? { roleCompany } : {}),
    ...(email ? { email } : {}),
  } as const;
}

export function isReviewFormField(value: string | undefined): value is ReviewFormField {
  return Boolean(value && REVIEW_FORM_FIELDS.includes(value as ReviewFormField));
}
