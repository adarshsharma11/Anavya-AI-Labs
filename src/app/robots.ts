import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const PRIVATE_PATHS = [
  "/dashboard",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin",
  "/api/",
];

const AI_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  const publicRule = {
    allow: "/",
    disallow: PRIVATE_PATHS,
  };

  return {
    rules: [
      { userAgent: "*", ...publicRule },
      { userAgent: AI_CRAWLERS, ...publicRule },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
