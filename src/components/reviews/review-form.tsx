"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { ReviewThankYou } from "@/components/reviews/review-thank-you";
import { StarRating } from "@/components/reviews/star-rating";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { isApiError } from "@/lib/api/client";
import { submitReview } from "@/lib/api/reviews";
import { mapReviewSubmitError } from "@/lib/reviews/errors";
import {
  REVIEW_FIELD_LIMITS,
  REVIEW_FORM_FIELDS,
  ratingLabel,
  reviewFormDefaults,
  reviewFormSchema,
  toReviewSubmitBody,
  type ReviewFormValues,
} from "@/lib/reviews/schema";

type ReviewFormProps = {
  readonly initialRating?: number;
  readonly onSuccess?: (message: string) => void;
};

export function ReviewForm({ initialRating = 0, onSuccess }: ReviewFormProps) {
  const { toast } = useToast();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      ...reviewFormDefaults,
      rating: initialRating,
    },
  });

  const { ref: nameFieldRef, ...nameField } = form.register("name");
  const reviewValue = form.watch("review") ?? "";
  const ratingValue = form.watch("rating");
  const isPending = form.formState.isSubmitting;
  const fieldErrors = form.formState.errors;
  const errorEntries = REVIEW_FORM_FIELDS.flatMap((field) => {
    const message = fieldErrors[field]?.message;
    return message ? [{ field, message }] : [];
  });

  const focusField = (field: string) => {
    if (field === "rating") {
      document.getElementById("review-rating")?.querySelector("button")?.focus();
      return;
    }
    if (field === "confirmed") {
      document.getElementById("review-confirmed")?.focus();
      return;
    }
    document.getElementById(`review-${field}`)?.focus();
  };

  const handleServerError = (error: Parameters<typeof mapReviewSubmitError>[0]) => {
    const mapped = mapReviewSubmitError(error);
    if (mapped.kind === "rate_limited") {
      setRateLimitMessage(mapped.message);
      return;
    }

    if (mapped.kind === "field" && mapped.field) {
      form.setError(mapped.field, { type: "server", message: mapped.message });
      focusField(mapped.field);
      return;
    }

    toast({
      variant: "destructive",
      title: "Could not send review",
      description: mapped.message || "Something went wrong. Please try again.",
    });
  };

  const onInvalid = () => {
    const first = REVIEW_FORM_FIELDS.find((field) => form.formState.errors[field]);
    if (first) focusField(first);
  };

  const onSubmit = async (values: ReviewFormValues) => {
    setRateLimitMessage(null);
    try {
      const res = await submitReview(toReviewSubmitBody(values));
      if (onSuccess) {
        onSuccess(res.message);
        return;
      }
      setSuccessMessage(res.message);
    } catch (error) {
      if (isApiError(error)) {
        handleServerError(error);
        return;
      }
      toast({
        variant: "destructive",
        title: "Could not send review",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  if (successMessage) {
    return (
      <ReviewThankYou
        message={successMessage}
        onWriteAnother={() => {
          form.reset({ ...reviewFormDefaults, rating: initialRating });
          setSuccessMessage(null);
          setRateLimitMessage(null);
        }}
      />
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      className="relative space-y-5"
      noValidate
    >
      {errorEntries.length > 0 ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <p className="font-medium">Please fix the following:</p>
          <ul className="mt-1 list-disc pl-5">
            {errorEntries.map((entry) => (
              <li key={entry.field}>{entry.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div id="review-rating" className="space-y-2">
        <p id="review-rating-label" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Your rating *
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Controller
            name="rating"
            control={form.control}
            render={({ field }) => (
              <StarRating
                value={field.value}
                onChange={field.onChange}
                labelledBy="review-rating-label"
              />
            )}
          />
          {ratingLabel(ratingValue) ? (
            <p className="text-sm text-muted-foreground">{ratingLabel(ratingValue)}</p>
          ) : null}
        </div>
        {fieldErrors.rating ? (
          <p className="text-sm text-destructive">{fieldErrors.rating.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="review-name">Your Name *</Label>
          <Input
            id="review-name"
            autoComplete="name"
            placeholder="e.g., Sarah Mitchell"
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? "review-name-error" : undefined}
            {...nameField}
            ref={(el) => {
              nameFieldRef(el);
              firstFieldRef.current = el;
            }}
          />
          {fieldErrors.name ? (
            <p id="review-name-error" className="text-sm text-destructive">
              {fieldErrors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-roleCompany">Role / Company (Optional)</Label>
          <Input
            id="review-roleCompany"
            autoComplete="organization-title"
            placeholder="e.g., SEO Specialist at Acme"
            maxLength={REVIEW_FIELD_LIMITS.roleCompany.max}
            aria-invalid={fieldErrors.roleCompany ? true : undefined}
            aria-describedby={
              fieldErrors.roleCompany ? "review-roleCompany-error" : undefined
            }
            {...form.register("roleCompany")}
          />
          {fieldErrors.roleCompany ? (
            <p id="review-roleCompany-error" className="text-sm text-destructive">
              {fieldErrors.roleCompany.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-email">Email (Optional - Never displayed publicly)</Label>
        <Input
          id="review-email"
          type="email"
          autoComplete="email"
          placeholder="your.email@example.com"
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={
            fieldErrors.email ? "review-email-error" : undefined
          }
          {...form.register("email")}
        />
        {fieldErrors.email ? (
          <p id="review-email-error" className="text-sm text-destructive">
            {fieldErrors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-review">Review *</Label>
        <Textarea
          id="review-review"
          rows={4}
          maxLength={REVIEW_FIELD_LIMITS.review.max}
          placeholder="What results or insights did you get using this tool?"
          aria-invalid={fieldErrors.review ? true : undefined}
          aria-describedby={
            fieldErrors.review ? "review-review-error review-review-count" : "review-review-count"
          }
          {...form.register("review")}
        />
        <p id="review-review-count" className="text-xs text-muted-foreground">
          {reviewValue.length} / {REVIEW_FIELD_LIMITS.review.max}
        </p>
        {fieldErrors.review ? (
          <p id="review-review-error" className="text-sm text-destructive">
            {fieldErrors.review.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2.5 text-sm leading-5 text-muted-foreground">
          <Controller
            name="confirmed"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                id="review-confirmed"
                className="mt-0"
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={fieldErrors.confirmed ? true : undefined}
              />
            )}
          />
          <span className="pt-px">I confirm this review is based on my genuine experience.</span>
        </label>
        {fieldErrors.confirmed ? (
          <p className="text-sm text-destructive">{fieldErrors.confirmed.message}</p>
        ) : null}
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="review-website">Website</label>
        <input
          id="review-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          {...form.register("website")}
        />
      </div>

      {rateLimitMessage ? (
        <p className="text-sm text-destructive" role="status">
          {rateLimitMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full rounded-full"
        disabled={isPending || Boolean(rateLimitMessage)}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Submit review"
        )}
      </Button>
    </form>
  );
}
