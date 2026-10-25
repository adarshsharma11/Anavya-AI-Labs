import { expect, test } from "@playwright/test";

const prices = (usd: number, inr: number, gst: number) => ({
  USD: {
    region: "INTL",
    currency: "USD",
    base: usd,
    gstAmount: 0,
    gstRatePercent: 0,
    total: usd,
    amountSubunits: usd * 100,
  },
  INR: {
    region: "IN",
    currency: "INR",
    base: inr - gst,
    gstAmount: gst,
    gstRatePercent: 18,
    total: inr,
    amountSubunits: inr * 100,
  },
});

const plans = [
  {
    id: 3,
    slug: "free",
    name: "Free",
    description: "Full audits",
    price: 0,
    cadence: "forever",
    type: "free",
    features: ["5 scans per day"],
    cta: "Start Free",
    scanLimit: 5,
    whiteLabel: false,
    monitoring: false,
    badge: null,
    isHighlighted: false,
    prices: prices(0, 0, 0),
  },
  {
    id: 1,
    slug: "starter",
    name: "Starter",
    description: "More daily audits",
    price: 9,
    cadence: "per month",
    type: "subscription",
    features: ["15 scans per day"],
    cta: "Get Starter",
    scanLimit: 15,
    whiteLabel: false,
    monitoring: false,
    badge: null,
    isHighlighted: false,
    prices: prices(9, 1009, 154),
  },
  {
    id: 2,
    slug: "pro",
    name: "Pro",
    description: "Agencies",
    price: 29,
    cadence: "per month",
    type: "subscription",
    features: ["50 scans per day", "White-label PDF reports"],
    cta: "Go Pro",
    scanLimit: 50,
    whiteLabel: true,
    monitoring: true,
    badge: "Most popular",
    isHighlighted: true,
    prices: prices(29, 3251, 496),
  },
];

test("subscribes to the plan slug with Razorpay subscription checkout", async ({ page }) => {
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

  await page.route("**/api/v1/payment/subscription", async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          plan: null,
          isPaid: false,
          isPro: false,
          dailyScanLimit: 5,
          whiteLabel: false,
          monitoring: false,
          status: "none",
          currentPeriodEnd: null,
        },
      },
    });
  });

  let subscribeBody: { plan?: string; region?: string } | null = null;
  let verified = false;
  await page.route("**/api/v1/payment/razorpay/subscribe", async (route) => {
    if (route.request().url().includes("/verify")) {
      verified = true;
      await route.fulfill({ json: { success: true, data: { status: "active", currentPeriodEnd: null } } });
      return;
    }
    subscribeBody = route.request().postDataJSON() as { plan?: string; region?: string };
    await route.fulfill({
      json: {
        success: true,
        data: {
          subscriptionId: "sub_test",
          keyId: "rzp_test_key",
          plan: { id: 1, slug: "starter", name: "Starter", priceUsd: 9, cadence: "per month" },
          quote: prices(9, 1009, 154).USD,
          replaces: null,
          prefill: { email: "ada@example.com", name: "Ada Lovelace" },
        },
      },
    });
  });

  await page.addInitScript(() => {
    class MockRazorpay {
      options: { handler?: (payload: Record<string, string>) => void; subscription_id?: string };
      constructor(options: { handler?: (payload: Record<string, string>) => void; subscription_id?: string }) {
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
  await expect(page.getByRole("heading", { name: "Starter" })).toBeVisible();
  await expect(page.getByText("$9/month").first()).toBeVisible();
  await page.getByRole("button", { name: "Get Starter" }).click();
  await expect(page.getByText("You're on Starter")).toBeVisible();
  expect(subscribeBody).toEqual({ plan: "starter", region: "INTL" });
  expect(verified).toBeTruthy();
});
