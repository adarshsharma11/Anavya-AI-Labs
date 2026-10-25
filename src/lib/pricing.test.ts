import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolvePostAuthPath } from "./auth/post-auth-path";
import {
  defaultPlanCta,
  formatPrice,
  inferRegionFromEnvironment,
  normalizePlans,
  planCtaHref,
  scanLimitLabel,
  selectPlanCta,
  withFallbackFreePlan,
} from "./pricing";
import type { Plan, SubscriptionState } from "@/types/pricing";

const freePlan: Plan = {
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
  cta: null,
  scanLimit: null,
  badge: null,
  isHighlighted: false,
};

const reportPlan: Plan = {
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
  isHighlighted: null,
};

const proPlan: Plan = {
  id: 3,
  name: "Pro",
  description: "Monthly",
  price: 19,
  compareAtPrice: null,
  discountPercent: null,
  hasDiscount: false,
  cadence: "per month",
  type: "subscription",
  features: ["Auto unlock"],
  cta: null,
  scanLimit: -1,
  badge: "Most popular",
  isHighlighted: true,
};

const noneSub: SubscriptionState = {
  isPro: false,
  dailyScanLimit: 15,
  status: "none",
  currentPeriodEnd: null,
};

describe("formatPrice", () => {
  it("formats whole USD and INR without decimals", () => {
    assert.equal(formatPrice(29, "USD"), "$29");
    assert.equal(formatPrice(2499, "INR"), "₹2,499");
  });

  it("keeps two decimals for fractional amounts", () => {
    assert.equal(formatPrice(29.5, "USD"), "$29.50");
  });
});

describe("scanLimitLabel", () => {
  it("uses the free-plan copy when the API limit is unset", () => {
    assert.equal(scanLimitLabel(freePlan), "Free daily scans");
  });

  it("surfaces an explicit free-plan limit", () => {
    assert.equal(scanLimitLabel({ ...freePlan, scanLimit: 15 }), "15 scans / day");
  });

  it("treats -1 and null as unlimited on paid plans", () => {
    assert.equal(scanLimitLabel(proPlan), "Unlimited scans");
    assert.equal(scanLimitLabel({ ...proPlan, scanLimit: null }), "Unlimited scans");
  });
});

describe("CTA state selection", () => {
  it("sends logged-out visitors to the scanner or login", () => {
    assert.deepEqual(selectPlanCta({ plan: freePlan, isAuthenticated: false, subscription: null }), {
      kind: "link",
      href: "/?intent=scan",
      label: "Start free",
    });
    assert.equal(planCtaHref(reportPlan, { isAuthenticated: false }), "/?intent=unlock");
    assert.equal(
      planCtaHref(proPlan, { isAuthenticated: false }),
      "/login?next=/pricing&intent=subscribe"
    );
  });

  it("marks the free plan current for logged-in non-Pro users", () => {
    assert.deepEqual(
      selectPlanCta({ plan: freePlan, isAuthenticated: true, subscription: noneSub }),
      { kind: "disabled", label: "Current plan" }
    );
  });

  it("shows an active Pro subscription as the current plan", () => {
    const view = selectPlanCta({
      plan: proPlan,
      isAuthenticated: true,
      subscription: {
        isPro: true,
        dailyScanLimit: null,
        status: "active",
        currentPeriodEnd: "2026-11-20T00:00:00.000Z",
      },
    });
    assert.equal(view.kind, "disabled");
    if (view.kind !== "disabled") return;
    assert.equal(view.label, "Current plan");
    assert.equal(view.manageHref, "/dashboard/billing");
    assert.match(view.hint ?? "", /Renews on/);
  });

  it("shows cancel_scheduled as Pro until the period end", () => {
    const view = selectPlanCta({
      plan: proPlan,
      isAuthenticated: true,
      subscription: {
        isPro: true,
        dailyScanLimit: null,
        status: "cancel_scheduled",
        currentPeriodEnd: "2026-11-20T00:00:00.000Z",
      },
    });
    assert.equal(view.kind, "disabled");
    if (view.kind !== "disabled") return;
    assert.match(view.label, /Pro until/);
    assert.equal(view.manageHref, "/dashboard/billing");
  });

  it("routes past_due users to billing", () => {
    assert.deepEqual(
      selectPlanCta({
        plan: proPlan,
        isAuthenticated: true,
        subscription: {
          isPro: false,
          dailyScanLimit: 15,
          status: "past_due",
          currentPeriodEnd: null,
        },
      }),
      {
        kind: "past_due",
        href: "/dashboard/billing",
        label: "Payment issue: update payment",
      }
    );
  });

  it("starts checkout when a logged-in user can subscribe", () => {
    assert.deepEqual(
      selectPlanCta({ plan: proPlan, isAuthenticated: true, subscription: noneSub }),
      { kind: "subscribe", label: "Go Pro" }
    );
  });
});

describe("withFallbackFreePlan", () => {
  it("adds a free card when the API has none", () => {
    const plans = withFallbackFreePlan([reportPlan, proPlan]);
    assert.equal(plans[0]?.type, "free");
    assert.equal(plans.length, 3);
  });

  it("keeps the API free plan when one exists", () => {
    const plans = withFallbackFreePlan([freePlan, reportPlan]);
    assert.equal(plans[0]?.id, 1);
    assert.equal(plans.length, 2);
  });
});

describe("normalizePlans", () => {
  it("includes extra subscription plans from the API", () => {
    const plans = normalizePlans({
      success: true,
      data: [
        freePlan,
        reportPlan,
        proPlan,
        {
          id: "agency",
          name: "Agency",
          description: "Teams",
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
      ],
    });
    assert.equal(plans.length, 4);
    assert.equal(plans[3]?.name, "Agency");
    assert.equal(defaultPlanCta(plans[3]!), "Talk to us");
  });
});

describe("detectRegion", () => {
  it("treats Kolkata timezones and -IN locales as India", () => {
    assert.equal(inferRegionFromEnvironment("Asia/Kolkata", "en-US"), "IN");
    assert.equal(inferRegionFromEnvironment("Asia/Calcutta", "en-GB"), "IN");
    assert.equal(inferRegionFromEnvironment("America/New_York", "en-IN"), "IN");
    assert.equal(inferRegionFromEnvironment("America/New_York", "en-US"), "INTL");
  });
});

describe("resolvePostAuthPath", () => {
  it("returns pricing with subscribe intent after login", () => {
    assert.equal(
      resolvePostAuthPath("?next=/pricing&intent=subscribe"),
      "/pricing?intent=subscribe"
    );
    assert.equal(resolvePostAuthPath(""), "/dashboard");
  });
});
