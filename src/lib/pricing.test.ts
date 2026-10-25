import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolvePostAuthPath } from "./auth/post-auth-path";
import {
  defaultPlanCta,
  formatPrice,
  inferRegionFromEnvironment,
  normalizePlans,
  normalizeSubscription,
  planCtaHref,
  planPriceView,
  scanLimitLabel,
  selectPlanCta,
  subscribeLoginHref,
} from "./pricing";
import type { Plan, PlanPriceQuote, SubscriptionState } from "@/types/pricing";

function quote(
  currency: "USD" | "INR",
  total: number,
  gstAmount = 0
): PlanPriceQuote {
  return {
    region: currency === "INR" ? "IN" : "INTL",
    currency,
    base: total - gstAmount,
    gstAmount,
    gstRatePercent: currency === "INR" ? 18 : 0,
    total,
    amountSubunits: Math.round(total * 100),
  };
}

function plan(overrides: Partial<Plan> & Pick<Plan, "slug" | "name" | "type" | "price">): Plan {
  const usd = overrides.price;
  return {
    id: overrides.slug,
    description: null,
    cadence: overrides.type === "free" ? "forever" : "per month",
    features: [],
    cta: null,
    scanLimit: null,
    whiteLabel: false,
    monitoring: false,
    badge: null,
    isHighlighted: false,
    prices: {
      USD: quote("USD", usd),
      INR: quote("INR", usd * 100, Math.round(usd * 18)),
    },
    ...overrides,
  };
}

const freePlan = plan({
  id: 3,
  slug: "free",
  name: "Free",
  type: "free",
  price: 0,
  cta: "Start Free",
  scanLimit: 5,
  prices: { USD: quote("USD", 0), INR: quote("INR", 0) },
});

const starterPlan = plan({
  id: 1,
  slug: "starter",
  name: "Starter",
  type: "subscription",
  price: 9,
  cta: "Get Starter",
  scanLimit: 15,
  prices: { USD: quote("USD", 9), INR: quote("INR", 1009, 154) },
});

const proPlan = plan({
  id: 2,
  slug: "pro",
  name: "Pro",
  type: "subscription",
  price: 29,
  cta: "Go Pro",
  scanLimit: 50,
  whiteLabel: true,
  monitoring: true,
  badge: "Most popular",
  isHighlighted: true,
  prices: { USD: quote("USD", 29), INR: quote("INR", 3251, 496) },
});

const noneSub: SubscriptionState = {
  plan: null,
  isPaid: false,
  isPro: false,
  dailyScanLimit: 5,
  whiteLabel: false,
  monitoring: false,
  status: "none",
  currentPeriodEnd: null,
};

describe("formatPrice", () => {
  it("formats whole USD and INR without decimals", () => {
    assert.equal(formatPrice(29, "USD"), "$29");
    assert.equal(formatPrice(1009, "INR"), "₹1,009");
  });
});

describe("planPriceView", () => {
  it("shows the INR total and a separate GST line", () => {
    assert.deepEqual(planPriceView(starterPlan, "IN"), {
      headline: "₹1,009/month",
      taxLine: "₹855 + ₹154 GST (18%)",
    });
  });

  it("shows USD without GST", () => {
    assert.deepEqual(planPriceView(proPlan, "INTL"), {
      headline: "$29/month",
      taxLine: null,
    });
  });

  it("shows Free without a converted price", () => {
    assert.deepEqual(planPriceView(freePlan, "IN"), {
      headline: "Free",
      taxLine: null,
    });
  });
});

describe("scanLimitLabel", () => {
  it("uses the limit from the plan", () => {
    assert.equal(scanLimitLabel(freePlan), "5 scans / day");
    assert.equal(scanLimitLabel(starterPlan), "15 scans / day");
    assert.equal(scanLimitLabel(proPlan), "50 scans / day");
  });
});

describe("CTA state selection", () => {
  it("starts a scan for Free and never sends Free to subscribe", () => {
    assert.deepEqual(selectPlanCta({ plan: freePlan, isAuthenticated: false, subscription: null }), {
      kind: "link",
      href: "/scanner",
      label: "Start Free",
    });
    assert.equal(planCtaHref(freePlan, { isAuthenticated: true }), "/scanner");
    assert.equal(selectPlanCta({ plan: freePlan, isAuthenticated: true, subscription: noneSub }).kind, "link");
  });

  it("sends logged-out paid plans to login and back to pricing", () => {
    assert.equal(subscribeLoginHref("starter"), planCtaHref(starterPlan, { isAuthenticated: false }));
    assert.match(planCtaHref(proPlan, { isAuthenticated: false }), /plan=pro/);
    assert.match(planCtaHref(proPlan, { isAuthenticated: false }), /intent=subscribe/);
  });

  it("marks only the matching active plan as current", () => {
    const starterSub: SubscriptionState = {
      ...noneSub,
      plan: { id: 1, slug: "starter", name: "Starter" },
      isPaid: true,
      dailyScanLimit: 15,
      status: "active",
      currentPeriodEnd: "2026-11-20T00:00:00.000Z",
    };
    const current = selectPlanCta({
      plan: starterPlan,
      isAuthenticated: true,
      subscription: starterSub,
    });
    assert.equal(current.kind, "disabled");
    const upgrade = selectPlanCta({
      plan: proPlan,
      isAuthenticated: true,
      subscription: starterSub,
    });
    assert.deepEqual(upgrade, { kind: "subscribe", label: "Go Pro", slug: "pro" });
  });

  it("shows Cancels on for the scheduled plan", () => {
    const view = selectPlanCta({
      plan: proPlan,
      isAuthenticated: true,
      subscription: {
        ...noneSub,
        plan: { id: 2, slug: "pro", name: "Pro" },
        isPaid: true,
        isPro: true,
        status: "cancel_scheduled",
        currentPeriodEnd: "2026-11-20T00:00:00.000Z",
      },
    });
    assert.equal(view.kind, "disabled");
    if (view.kind !== "disabled") return;
    assert.match(view.label, /^Cancels on /);
  });

  it("starts checkout for a logged-in user who can subscribe", () => {
    assert.deepEqual(
      selectPlanCta({ plan: proPlan, isAuthenticated: true, subscription: noneSub }),
      { kind: "subscribe", label: "Go Pro", slug: "pro" }
    );
  });
});

describe("normalizePlans", () => {
  it("reads slug, limits, and both currency quotes", () => {
    const plans = normalizePlans({
      success: true,
      data: [freePlan, starterPlan, proPlan],
    });
    assert.deepEqual(
      plans.map((item) => item.slug),
      ["free", "starter", "pro"]
    );
    assert.equal(plans[2]?.whiteLabel, true);
    assert.equal(plans[2]?.prices.INR.total, 3251);
    assert.equal(defaultPlanCta(plans[1]!), "Get Starter");
  });

  it("drops plans that are not free or subscription", () => {
    const plans = normalizePlans({
      success: true,
      data: [{ ...starterPlan, type: "one_time", slug: "report" }],
    });
    assert.equal(plans.length, 0);
  });
});

describe("normalizeSubscription", () => {
  it("treats a null plan as Free", () => {
    const state = normalizeSubscription({
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
    });
    assert.equal(state.plan, null);
    assert.equal(state.whiteLabel, false);
    assert.equal(state.dailyScanLimit, 5);
  });
});

describe("detectRegion", () => {
  it("treats Kolkata timezones and -IN locales as India", () => {
    assert.equal(inferRegionFromEnvironment("Asia/Kolkata", "en-US"), "IN");
    assert.equal(inferRegionFromEnvironment("America/New_York", "en-US"), "INTL");
  });
});

describe("resolvePostAuthPath", () => {
  it("returns pricing with the selected plan after login", () => {
    assert.equal(
      resolvePostAuthPath("?next=%2Fpricing%3Fplan%3Dstarter&intent=subscribe"),
      "/pricing?plan=starter&intent=subscribe"
    );
  });
});
