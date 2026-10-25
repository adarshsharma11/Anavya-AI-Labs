import { expect, test } from "@playwright/test";

const plans = [
  {
    id: 1,
    name: "Free",
    description: "Daily audits",
    price: 0,
    compareAtPrice: null,
    discountPercent: null,
    hasDiscount: false,
    cadence: null,
    type: "free",
    features: ["Full audit", "PDF"],
    cta: "Start free",
    scanLimit: null,
    badge: null,
    isHighlighted: false,
  },
  {
    id: 2,
    name: "AI report",
    description: "One scan unlock",
    price: 29,
    compareAtPrice: 49,
    discountPercent: 41,
    hasDiscount: true,
    cadence: "per report",
    type: "one_time",
    features: ["AI action plan"],
    cta: null,
    scanLimit: 1,
    badge: null,
    isHighlighted: false,
  },
  {
    id: 3,
    name: "Pro",
    description: "Monthly",
    price: 19,
    compareAtPrice: null,
    discountPercent: null,
    hasDiscount: false,
    cadence: "per month",
    type: "subscription",
    features: ["Auto unlock", "Monitoring"],
    cta: "Go Pro",
    scanLimit: -1,
    badge: "Most popular",
    isHighlighted: true,
  },
  {
    id: "agency",
    name: "Agency",
    description: "For teams",
    price: 99,
    compareAtPrice: null,
    discountPercent: null,
    hasDiscount: false,
    cadence: "per month",
    type: "subscription",
    features: ["Seats"],
    cta: "Talk to us",
    scanLimit: -1,
    badge: null,
    isHighlighted: false,
  },
];

test("subscribes with a mocked Razorpay checkout", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("accessToken", "test-access");
    localStorage.setItem("refreshToken", "test-refresh");
  });

  await page.route("**/api/v1/dashboard/me", async (route) => {
    await route.fulfill({
      json: {
        success: true,
        profile: { id: 1, email: "ada@example.com", name: "Ada Lovelace", role: "user" },
      },
    });
  });

  await page.route("**/api/v1/pricing", async (route) => {
    await route.fulfill({ json: { success: true, data: plans } });
  });

  await page.route("**/api/v1/payment/razorpay/quote**", async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          region: "INTL",
          currency: "USD",
          total: 29,
          amountSubunits: 2900,
          gstInclusive: true,
          gstRatePercent: 18,
        },
      },
    });
  });

  await page.route("**/api/v1/payment/subscription", async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: { isPro: false, dailyScanLimit: 15, status: "none", currentPeriodEnd: null },
      },
    });
  });

  let verified = false;
  await page.route("**/api/v1/payment/razorpay/subscribe", async (route) => {
    if (route.request().url().includes("/verify")) {
      verified = true;
      await route.fulfill({
        json: {
          success: true,
          data: { status: "active", currentPeriodEnd: "2026-11-20T00:00:00.000Z" },
        },
      });
      return;
    }
    await route.fulfill({
      json: {
        success: true,
        data: {
          subscriptionId: "sub_test",
          keyId: "rzp_test_key",
          plan: { id: "pro", name: "Pro", price: 19, cadence: "per month" },
          prefill: { email: "ada@example.com", name: "Ada Lovelace" },
        },
      },
    });
  });

  await page.addInitScript(() => {
    class MockRazorpay {
      options: { handler?: (payload: Record<string, string>) => void };
      constructor(options: { handler?: (payload: Record<string, string>) => void }) {
        this.options = options;
      }
      open() {
        this.options.handler?.({
          razorpay_payment_id: "pay_test",
          razorpay_subscription_id: "sub_test",
          razorpay_signature: "sig_test",
        });
      }
      on() {}
    }
    (window as unknown as { Razorpay: typeof MockRazorpay }).Razorpay = MockRazorpay;
  });

  await page.goto("/pricing", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Agency" })).toBeVisible();
  await page.getByRole("button", { name: "Go Pro" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  expect(verified).toBeTruthy();
});
