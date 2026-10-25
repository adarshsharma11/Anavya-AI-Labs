import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ApiError } from "../api/client";
import { mapReviewSubmitError } from "./errors";
import {
  REVIEW_FIELD_LIMITS,
  reviewFormSchema,
  toReviewSubmitBody,
} from "./schema";

describe("reviewFormSchema", () => {
  it("accepts a valid review and trims values", () => {
    const parsed = reviewFormSchema.parse({
      rating: 5,
      name: "  Ada Lovelace  ",
      roleCompany: "  Founder, Analytical Engines  ",
      email: " ada@example.com ",
      review: "  This scan found issues we had missed.  ",
      confirmed: true,
      website: "https://spam.example",
    });

    assert.equal(parsed.name, "Ada Lovelace");
    assert.equal(parsed.roleCompany, "Founder, Analytical Engines");
    assert.equal(parsed.email, "ada@example.com");
    assert.equal(parsed.review, "This scan found issues we had missed.");
  });

  it("enforces name length", () => {
    assert.throws(() =>
      reviewFormSchema.parse({
        rating: 5,
        name: "A",
        review: "This scan found issues we had missed.",
        confirmed: true,
        website: "",
      })
    );
    assert.throws(() =>
      reviewFormSchema.parse({
        rating: 5,
        name: "A".repeat(REVIEW_FIELD_LIMITS.name.max + 1),
        review: "This scan found issues we had missed.",
        confirmed: true,
        website: "",
      })
    );
  });

  it("enforces review length", () => {
    assert.throws(() =>
      reviewFormSchema.parse({
        rating: 5,
        name: "Ada",
        review: "Too short",
        confirmed: true,
        website: "",
      })
    );
    assert.throws(() =>
      reviewFormSchema.parse({
        rating: 5,
        name: "Ada",
        review: "x".repeat(REVIEW_FIELD_LIMITS.review.max + 1),
        confirmed: true,
        website: "",
      })
    );
  });

  it("enforces role/company max length", () => {
    assert.throws(() =>
      reviewFormSchema.parse({
        rating: 5,
        name: "Ada",
        roleCompany: "x".repeat(REVIEW_FIELD_LIMITS.roleCompany.max + 1),
        review: "This scan found issues we had missed.",
        confirmed: true,
        website: "",
      })
    );
  });

  it("requires a 1-5 star rating", () => {
    assert.throws(() =>
      reviewFormSchema.parse({
        rating: 0,
        name: "Ada",
        review: "This scan found issues we had missed.",
        confirmed: true,
        website: "",
      })
    );
  });

  it("allows a blank optional email and rejects an invalid one", () => {
    assert.equal(
      reviewFormSchema.parse({
        rating: 5,
        name: "Ada",
        email: "",
        review: "This scan found issues we had missed.",
        confirmed: true,
        website: "",
      }).email,
      ""
    );
    assert.throws(() =>
      reviewFormSchema.parse({
        rating: 5,
        name: "Ada",
        email: "not-an-email",
        review: "This scan found issues we had missed.",
        confirmed: true,
        website: "",
      })
    );
  });
});

describe("toReviewSubmitBody", () => {
  it("omits blank email and always sends an empty honeypot", () => {
    assert.deepEqual(
      toReviewSubmitBody({
        rating: 5,
        name: "Ada",
        roleCompany: "",
        email: "   ",
        review: "This scan found issues we had missed.",
        confirmed: true,
        website: "https://bot.example",
      }),
      {
        name: "Ada",
        review: "This scan found issues we had missed.",
        rating: 5,
        website: "",
      }
    );
  });
});

describe("mapReviewSubmitError", () => {
  it("maps INVALID_REVIEW onto the matching field", () => {
    assert.deepEqual(
      mapReviewSubmitError(
        new ApiError(400, "Name looks incomplete.", "INVALID_REVIEW", "name")
      ),
      { kind: "field", field: "name", message: "Name looks incomplete." }
    );
  });

  it("maps rate limits separately", () => {
    assert.deepEqual(
      mapReviewSubmitError(new ApiError(429, "Try again later.", "RATE_LIMITED")),
      { kind: "rate_limited", message: "Try again later." }
    );
  });
});
