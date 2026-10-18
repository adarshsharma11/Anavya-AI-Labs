import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const PRIVATE_PATHS = [
  "/dashboard",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
