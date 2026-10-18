/**
 * Unprefixed keys live in .env / .env.local.
 * exposeVarToPublic() copies them to NEXT_PUBLIC_* for the browser
 * via next.config.ts `env`.
 *
 *   API_BASE_URL
 *   RAZORPAY_KEY_ID
 *   PAYMENT_CURRENCY
 *   GOOGLE_ANALYTICS_ID
 *   GOOGLE_ADS_ID
 *   ADSENSE_SLOT_IN_ARTICLE
 *   ADSENSE_SLOT_BEFORE_RELATED
 *   SITE_COMPANY_NAME
 *   SITE_DOMAIN
 *   SITE_EFFECTIVE_DATE
 *   SITE_EMAIL
 *   ENABLE_SITE_SETTINGS_API
 */
const PUBLIC_ENV_KEYS = [
  "API_BASE_URL",
  "RAZORPAY_KEY_ID",
  "PAYMENT_CURRENCY",
  "GOOGLE_ANALYTICS_ID",
  "GOOGLE_ADS_ID",
  "ADSENSE_SLOT_IN_ARTICLE",
  "ADSENSE_SLOT_BEFORE_RELATED",
  "SITE_COMPANY_NAME",
  "SITE_DOMAIN",
  "SITE_EFFECTIVE_DATE",
  "SITE_EMAIL",
  "ENABLE_SITE_SETTINGS_API",
] as const;

export function exposeVarToPublic() {
  const exposed: Record<string, string> = {};

  for (const key of PUBLIC_ENV_KEYS) {
    const value = process.env[key];
    if (value) {
      exposed[`NEXT_PUBLIC_${key}`] = value;
    }
  }

  return exposed;
}

export const env = {
  // API_BASE_URL — backend origin, e.g. https://anavyaailabs.com/api/v1
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, ""),

  // RAZORPAY_KEY_ID — Razorpay checkout key
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",

  // PAYMENT_CURRENCY — checkout currency
  paymentCurrency: process.env.NEXT_PUBLIC_PAYMENT_CURRENCY ?? "USD",

  // GOOGLE_ANALYTICS_ID — GA4 measurement ID, e.g. G-XXXX
  googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "",

  // GOOGLE_ADS_ID — AdSense publisher, e.g. ca-pub-XXXX
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "",

  // ADSENSE_SLOT_IN_ARTICLE — blog in-article ad unit
  adsenseSlotInArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? "",

  // ADSENSE_SLOT_BEFORE_RELATED — blog related-posts ad unit
  adsenseSlotBeforeRelated: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BEFORE_RELATED ?? "",

  // SITE_COMPANY_NAME — legal / policy company name
  siteCompanyName: process.env.NEXT_PUBLIC_SITE_COMPANY_NAME ?? "",

  // SITE_DOMAIN — public site domain
  siteDomain: process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "",

  // SITE_EFFECTIVE_DATE — policy effective date
  siteEffectiveDate: process.env.NEXT_PUBLIC_SITE_EFFECTIVE_DATE ?? "",

  // SITE_EMAIL — public support email
  siteEmail: process.env.NEXT_PUBLIC_SITE_EMAIL ?? "",

  // ENABLE_SITE_SETTINGS_API — "true" to load settings from the API
  enableSiteSettingsApi: process.env.NEXT_PUBLIC_ENABLE_SITE_SETTINGS_API === "true",
} as const;
