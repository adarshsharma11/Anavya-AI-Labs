import { expect, test, type Page } from "@playwright/test";

const VALID_REVIEW = "This scan found issues we had missed on the homepage.";

const pendingReview = {
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

async function openShareForm(page: Page) {
  await page.route("**/api/v1/reviews**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        json: { items: [], total: 0, page: 1, limit: 12 },
      });
      return;
    }
    await route.fallback();
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Write a Review" }).click();
  await expect(page.getByLabel("Your Name *")).toBeVisible();
}

test("sends an empty honeypot and shows a server field error", async ({ page }) => {
  let posted: Record<string, unknown> | null = null;

  await openShareForm(page);

  await page.route("**/api/v1/reviews", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    posted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 400,
      json: {
        code: "INVALID_REVIEW",
        field: "name",
        message: "Name looks incomplete.",
      },
    });
  });

  await page.getByRole("radio", { name: "5 stars" }).click();
  await page.getByLabel("Your Name *").fill("Ada Lovelace");
  await page.getByLabel("Review *").fill(VALID_REVIEW);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit review" }).click();

  await expect(page.getByRole("alert")).toContainText("Name looks incomplete.");
  await expect(page.getByLabel("Your Name *")).toHaveAttribute("aria-invalid", "true");
  expect(posted).toMatchObject({
    name: "Ada Lovelace",
    review: VALID_REVIEW,
    rating: 5,
    website: "",
  });
  expect(posted).not.toHaveProperty("email");
});

test("admin approve moves the row and updates counts", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("accessToken", "test-access");
    localStorage.setItem("refreshToken", "test-refresh");
  });

  await page.route("**/api/v1/dashboard/me", async (route) => {
    await route.fulfill({
      json: {
        success: true,
        profile: {
          id: 1,
          email: "admin@anavyaailabs.com",
          name: "Admin",
          role: "admin",
        },
      },
    });
  });

  await page.route("**/api/v1/admin/reviews**", async (route) => {
    const request = route.request();
    if (request.method() === "PATCH") {
      await route.fulfill({
        json: {
          id: 12,
          status: "approved",
          reviewedAt: "2026-10-02T10:00:00.000Z",
        },
      });
      return;
    }

    await route.fulfill({
      json: {
        items: [pendingReview],
        total: 1,
        page: 1,
        limit: 20,
        counts: { pending: 1, approved: 0, rejected: 0 },
      },
    });
  });

  await page.goto("/admin/reviews");
  await expect(page.getByText("Ada Lovelace")).toBeVisible();
  await expect(page.getByRole("tab", { name: /Pending/ })).toContainText("1");

  await page.getByRole("button", { name: "Approve" }).click();

  await expect(page.getByText("Ada Lovelace")).toHaveCount(0);
  await expect(page.getByRole("tab", { name: /Pending/ })).toContainText("0");
  await expect(page.getByRole("tab", { name: /Approved/ })).toContainText("1");
});
