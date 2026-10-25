import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { AdminReview, AdminReviewList } from "../../types/reviews";
import { applyDelete, applyStatusChange } from "./admin-state";

const pendingReview: AdminReview = {
  id: 12,
  name: "Ada Lovelace",
  roleCompany: "Founder",
  review: "Clear report and useful next steps.",
  createdAt: "2026-10-01T10:00:00.000Z",
  email: "ada@example.com",
  status: "pending",
  userId: 4,
  reviewedAt: null,
};

function makeList(item: AdminReview): AdminReviewList {
  return {
    items: [item],
    total: 1,
    page: 1,
    limit: 20,
    counts: { pending: 1, approved: 0, rejected: 0 },
  };
}

describe("applyStatusChange", () => {
  it("moves an approved row out of the pending tab and updates counts", () => {
    const source = makeList(pendingReview);
    const next = applyStatusChange(
      source,
      pendingReview.id,
      "approved",
      "pending",
      "2026-10-02T10:00:00.000Z"
    );

    assert.equal(next.items.length, 0);
    assert.equal(next.total, 0);
    assert.deepEqual(next.counts, { pending: 0, approved: 1, rejected: 0 });
    assert.equal(source.items[0]?.status, "pending");
  });

  it("keeps the row when viewing all and stamps reviewedAt", () => {
    const next = applyStatusChange(
      makeList(pendingReview),
      pendingReview.id,
      "approved",
      "all",
      "2026-10-02T10:00:00.000Z"
    );

    assert.equal(next.items[0]?.status, "approved");
    assert.equal(next.items[0]?.reviewedAt, "2026-10-02T10:00:00.000Z");
    assert.equal(next.counts.approved, 1);
  });
});

describe("applyDelete", () => {
  it("removes the row and decrements the matching count", () => {
    const next = applyDelete(makeList(pendingReview), pendingReview.id);
    assert.equal(next.items.length, 0);
    assert.equal(next.counts.pending, 0);
    assert.equal(next.total, 0);
  });
});
