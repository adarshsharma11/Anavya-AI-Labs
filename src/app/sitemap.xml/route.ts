import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

type ChangeFrequency = "daily" | "weekly" | "monthly" | "yearly";

type SitemapEntry = {
  path: string;
  lastModified: Date;
  changeFrequency: ChangeFrequency;
  priority: number;
};

const STATIC_LASTMOD = new Date("2026-10-26T00:00:00.000Z");

const STATIC_ROUTES: Array<Omit<SitemapEntry, "lastModified">> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/scanner", changeFrequency: "weekly", priority: 0.9 },
  { path: "/competitor-scanner", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", changeFrequency: "daily", priority: 0.8 },
  { path: "/services", changeFrequency: "weekly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
];

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    ""
  ).replace(/\/$/, "");
}

function parseDate(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}

function isSafeSlug(slug: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/.test(slug);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toAbsoluteUrl(path: string) {
  return path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
}

function toXml(entries: SitemapEntry[]) {
  const urls = entries
    .map((entry) => {
      return `<url>
<loc>${escapeXml(toAbsoluteUrl(entry.path))}</loc>
<lastmod>${entry.lastModified.toISOString()}</lastmod>
<changefreq>${entry.changeFrequency}</changefreq>
<priority>${entry.priority.toFixed(1)}</priority>
</url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function xmlResponse(entries: SitemapEntry[]) {
  return new NextResponse(toXml(entries), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function staticEntries(): SitemapEntry[] {
  return STATIC_ROUTES.map((route) => ({
    ...route,
    lastModified: STATIC_LASTMOD,
  }));
}

async function getBlogEntries(): Promise<SitemapEntry[]> {
  const apiBase = getApiBaseUrl();
  if (!apiBase) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${apiBase}/blogs`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const json = (await res.json()) as {
      data?: Array<{
        slug?: unknown;
        createdAt?: unknown;
        date?: unknown;
        updatedAt?: unknown;
      }>;
    };
    const posts = Array.isArray(json.data) ? json.data : [];

    return posts.flatMap((post) => {
      const slug = typeof post.slug === "string" ? post.slug.trim() : "";
      if (!isSafeSlug(slug)) return [];

      return [
        {
          path: `/blog/${slug}`,
          lastModified: parseDate(post.updatedAt ?? post.date ?? post.createdAt),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
      ];
    });
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  try {
    const blogEntries = await getBlogEntries();
    const seen = new Set<string>();
    const entries = [...staticEntries(), ...blogEntries].filter((entry) => {
      if (seen.has(entry.path)) return false;
      seen.add(entry.path);
      return true;
    });

    return xmlResponse(entries);
  } catch (error) {
    console.error("Failed to generate sitemap.xml", error);
    return xmlResponse(staticEntries());
  }
}
