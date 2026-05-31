import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const ROUTES = [
  "/",
  "/scanner",
  "/competitor-scanner",
  "/services",
  "/portfolio",
  "/blog",
  "/about",
  "/contact",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
