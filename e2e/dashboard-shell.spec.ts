import { expect, test, type Page } from "@playwright/test";

async function mockAdminSession(page: Page) {
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
          name: "Admin User",
          role: "admin",
        },
      },
    });
  });

  await page.route("**/api/v1/admin/analytics", async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          totalUsers: 12,
          totalScans: 4,
          avgOverallScore: 80,
          avgPerformanceScore: 82,
          avgSeoScore: 78,
          totalIssuesFound: 9,
        },
      },
    });
  });

  await page.route("**/api/v1/admin/reviews**", async (route) => {
    await route.fulfill({
      json: {
        items: [],
        total: 0,
        page: 1,
        limit: 1,
        counts: { pending: 3, approved: 1, rejected: 0 },
      },
    });
  });
}

test("sidebar collapses and only the main pane scrolls", async ({ page }) => {
  await mockAdminSession(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/dashboard");

  await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to site" }).first()).toBeVisible();
  await expect(page.getByText("Welcome back, Admin")).toBeVisible();

  const wrapper = page.locator("[data-app-shell='true']");
  await expect(wrapper).toHaveCSS("overflow", "hidden");

  await page.getByRole("button", { name: "Toggle Sidebar" }).first().click();
  await expect(page.getByText("Welcome back, Admin")).toBeHidden();

  await page.goto("/admin/reviews");
  await expect(page.getByRole("link", { name: "Back to dashboard" }).first()).toBeVisible();
  await page.getByRole("link", { name: "Back to dashboard" }).first().click();
  await expect(page).toHaveURL(/\/dashboard$/);
});
