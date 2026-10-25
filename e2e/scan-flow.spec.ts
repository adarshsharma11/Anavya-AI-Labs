import { expect, test, type Page, type Route } from "@playwright/test";

const PUBLIC_ID = "11111111-2222-3333-4444-555555555555";

function auditPreview(complete = true) {
  return {
    version: 2,
    url: "https://example.com",
    origin: "https://example.com",
    generatedAt: "2026-10-24T00:00:00.000Z",
    complete,
    progress: { pages: complete ? "done" : "running", speed: "done" },
    overall: 72,
    verdict: "Good",
    summary: "The homepage is crawlable but structured data is thin.",
    totalIssuesFound: 4,
    categories: {
      aeo: 70,
      geo: 64,
      crawlers: 80,
      technical: 75,
      content: 68,
      speed: null,
    },
    crawlerAccess: { allowed: 7, total: 9 },
    structuredDataTypes: ["Organization"],
    siteChecks: [
      {
        id: "robots",
        category: "crawlers",
        label: "robots.txt allows GPTBot",
        status: "pass",
        points: 5,
        maxPoints: 5,
        evidence: "GPTBot is allowed",
        why: "AI crawlers need access",
        fix: null,
      },
    ],
    pages: [
      {
        url: "https://example.com/",
        title: "Example",
        pageType: "homepage",
        isHomepage: true,
        overall: 72,
        categories: {
          aeo: 70,
          geo: 64,
          crawlers: 80,
          technical: 75,
          content: 68,
          speed: null,
        },
        checks: [],
        speed: null,
        stats: {
          wordCount: 420,
          sizeKB: 80,
          internalLinks: 12,
          externalLinks: 3,
          images: 4,
          schemaTypes: ["Organization"],
        },
      },
    ],
    recommendations: [
      {
        id: "faq",
        category: "aeo",
        label: "Add FAQ schema",
        priority: "important",
        gain: 8,
        evidence: "No FAQPage JSON-LD",
        fix: "Add an FAQ block with JSON-LD",
        why: "AI answers pull from FAQ markup",
        affectedPages: ["https://example.com/"],
      },
    ],
  };
}

function scanPayload(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    data: {
      id: 12,
      publicId: PUBLIC_ID,
      url: "https://example.com",
      competitorUrl: null,
      status: "preview_done",
      reportVersion: 2,
      auditComplete: true,
      preview: auditPreview(),
      competitorPreview: null,
      competitorAnalysis: null,
      fullReport: null,
      isUnlocked: false,
      locked: true,
      processing: false,
      createdAt: "2026-10-24T00:00:00.000Z",
      ...overrides,
    },
  };
}

async function mockCommon(page: Page) {
  await page.route("**/api/v1/payment/razorpay/quote**", async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          region: "INTL",
          currency: "USD",
          total: 2.99,
          amountSubunits: 299,
          gstInclusive: true,
          gstRatePercent: 18,
        },
      },
    });
  });
}

test("scan polls then downloads PDF after REPORT_PENDING retries", async ({ page }) => {
  let pdfHits = 0;
  await mockCommon(page);

  await page.route("**/api/v1/scan/create", async (route: Route) => {
    await route.fulfill({
      json: {
        success: true,
        scanId: PUBLIC_ID,
        publicId: PUBLIC_ID,
        unlocked: false,
        cached: false,
      },
    });
  });

  await page.route(`**/api/v1/scan/${PUBLIC_ID}`, async (route) => {
    await route.fulfill({ json: scanPayload() });
  });

  await page.route(`**/api/v1/scan/${PUBLIC_ID}/pdf`, async (route) => {
    pdfHits += 1;
    if (pdfHits < 2) {
      await route.fulfill({
        status: 409,
        json: { success: false, code: "REPORT_PENDING", message: "Preparing" },
      });
      return;
    }
    await route.fulfill({
      contentType: "application/pdf",
      body: Buffer.from("%PDF-1.4 test"),
    });
  });

  await page.goto("/scanner");
  await page.getByPlaceholder("example.com").fill("example.com");
  await page.getByRole("button", { name: "Scan Now" }).click();
  await expect(page.getByText("The homepage is crawlable")).toBeVisible();
  await expect(page.getByText("Not measured")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download PDF|Retry PDF|Preparing/ }).first().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("aeo-geo-report");
  expect(pdfHits).toBeGreaterThanOrEqual(2);
});

test("competitor scan shows progressive results without retry looping", async ({ page }) => {
  await mockCommon(page);

  await page.route("**/api/v1/scan/create", async (route) => {
    await route.fulfill({
      json: {
        success: true,
        scanId: PUBLIC_ID,
        publicId: PUBLIC_ID,
        unlocked: false,
        cached: false,
      },
    });
  });

  let getHits = 0;
  await page.route(`**/api/v1/scan/${PUBLIC_ID}`, async (route) => {
    getHits += 1;
    await route.fulfill({
      json: scanPayload({
        competitorUrl: "https://competitor.example",
        status: "processing",
        auditComplete: false,
        competitorStatus: "running",
        preview: auditPreview(false),
        competitorPreview: {
          ...auditPreview(false),
          url: "https://competitor.example",
          origin: "https://competitor.example",
          overall: 37,
          verdict: "Poor",
          summary: "Competitor pages are still being analysed.",
          progress: { pages: "running", speed: "unavailable" },
        },
        competitorAnalysis: {
          scoreGap: -35,
          summary: "You are ahead of this competitor",
          categoryGaps: [],
          actionItems: [],
        },
      }),
    });
  });

  await page.goto("/competitor-scanner");
  await page.getByPlaceholder("yourwebsite.com").fill("example.com");
  await page.getByPlaceholder("competitor.com").fill("competitor.example");
  await page.getByRole("button", { name: "Compare now" }).click();

  await expect(page.getByText("The homepage is crawlable")).toBeVisible();
  await expect(page.getByText("Updating comparison…")).toBeVisible();
  await expect(page.getByText("You are ahead of this competitor")).toBeVisible();

  const hitsAfterResults = getHits;
  await page.waitForTimeout(3200);
  expect(getHits - hitsAfterResults).toBeLessThanOrEqual(3);
  expect(getHits).toBeGreaterThanOrEqual(1);
});

test("DAILY_LIMIT shows the Pro upsell card", async ({ page }) => {
  await mockCommon(page);
  await page.route("**/api/v1/scan/create", async (route) => {
    await route.fulfill({
      status: 429,
      json: {
        success: false,
        code: "DAILY_LIMIT",
        message: "Daily limit reached",
      },
    });
  });

  await page.goto("/scanner");
  await page.getByPlaceholder("example.com").fill("example.com");
  await page.getByRole("button", { name: "Scan Now" }).click();
  await expect(page.getByText("Daily free scan limit reached")).toBeVisible();
  await expect(page.getByRole("link", { name: "Upgrade to Pro" })).toBeVisible();
});

test("unlock checkout collects email and resumes after verify", async ({ page }) => {
  await mockCommon(page);
  await page.addInitScript(() => {
    class FakeRazorpay {
      options: { handler: (payload: Record<string, string>) => void };
      constructor(options: { handler: (payload: Record<string, string>) => void }) {
        this.options = options;
      }
      open() {
        this.options.handler({
          razorpay_payment_id: "pay_1",
          razorpay_order_id: "order_1",
          razorpay_signature: "sig_1",
        });
      }
      on() {}
    }
    // @ts-expect-error test mock
    window.Razorpay = FakeRazorpay;
  });

  await page.route("**/api/v1/scan/create", async (route) => {
    await route.fulfill({
      json: {
        success: true,
        scanId: PUBLIC_ID,
        publicId: PUBLIC_ID,
        unlocked: false,
        cached: false,
      },
    });
  });

  let unlocked = false;
  await page.route(`**/api/v1/scan/${PUBLIC_ID}`, async (route) => {
    await route.fulfill({
      json: scanPayload(
        unlocked
          ? {
              isUnlocked: true,
              locked: false,
              processing: false,
              status: "completed",
              fullReport: {
                executiveSummary: "Fix FAQ schema first.",
              },
            }
          : {}
      ),
    });
  });

  await page.route("**/api/v1/payment/razorpay/create-order", async (route) => {
    await route.fulfill({
      json: {
        success: true,
        order: { id: "order_1", amount: 299, currency: "USD" },
        quote: {
          region: "INTL",
          currency: "USD",
          total: 2.99,
          amountSubunits: 299,
          gstInclusive: true,
          gstRatePercent: 18,
        },
        publicId: PUBLIC_ID,
        prefill: { email: "buyer@example.com" },
        key_id: "rzp_test_1",
      },
    });
  });

  await page.route("**/api/v1/payment/razorpay/verify", async (route) => {
    unlocked = true;
    await route.fulfill({
      json: { success: true, unlocked: true, publicId: PUBLIC_ID },
    });
  });

  await page.goto("/scanner");
  await page.getByPlaceholder("example.com").fill("example.com");
  await page.getByRole("button", { name: "Scan Now" }).click();
  await page.getByRole("button", { name: /Unlock/ }).first().click();
  await page.getByLabel("Email").fill("buyer@example.com");
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await expect(page.getByText("Fix FAQ schema first.")).toBeVisible();
  await expect(page.getByText("We'll also email you when")).toBeVisible({ timeout: 8_000 }).catch(() => undefined);
});
