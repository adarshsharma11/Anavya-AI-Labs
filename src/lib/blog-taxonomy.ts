import type { BlogPost } from "@/lib/api/blogs";

export const ALL_BLOG_CATEGORY = "all";

export type BlogCategoryTab = {
  slug: string;
  label: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitTaxonomy(value: string) {
  return value
    .split(/[,|/]|(?:\s+&\s+)|(?:\s+or\s+)/i)
    .map((part) =>
      part.replace(/\t/g, " ").replace(/[()]/g, " ").replace(/\s+/g, " ").trim()
    )
    .filter(Boolean);
}

function canonicalTaxonomy(raw: string) {
  const normalized = raw.toLowerCase().replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (/(^|\b)geo(\b|$)/.test(normalized) && !normalized.includes("geographic")) {
    return "GEO";
  }
  if (
    normalized.includes("technical seo") ||
    normalized === "seo" ||
    normalized.includes("search engine optimization")
  ) {
    return "SEO";
  }
  if (
    normalized.includes("artificial intelligence") ||
    normalized === "ai" ||
    normalized.startsWith("ai ") ||
    normalized.startsWith("ai-") ||
    normalized.includes("ai technology") ||
    normalized.includes("ai analytics")
  ) {
    return "AI";
  }
  if (normalized.includes("web development")) return "Web Development";
  if (normalized.includes("growth")) return "Growth";
  if (normalized.includes("design") && !normalized.includes("designed")) {
    return "Design";
  }
  if (normalized.includes("engineering")) return "Engineering";
  return raw.replace(/\s+/g, " ").trim();
}

function categoryTokens(post: BlogPost) {
  return splitTaxonomy(post.category || "")
    .map(canonicalTaxonomy)
    .filter(Boolean);
}

function allTokens(post: BlogPost) {
  const tags = (post.tags || []).map(canonicalTaxonomy).filter(Boolean);
  return [...categoryTokens(post), ...tags];
}

export function getBlogCategoryTabs(posts: BlogPost[]): BlogCategoryTab[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const post of posts) {
    const labels = new Set(categoryTokens(post));
    for (const label of labels) {
      const slug = slugify(label);
      if (!slug) continue;
      const existing = counts.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(slug, { label, count: 1 });
      }
    }
  }

  return [...counts.entries()]
    .sort(
      (a, b) => b[1].count - a[1].count || a[1].label.localeCompare(b[1].label)
    )
    .map(([slug, { label }]) => ({ slug, label }));
}

export function filterBlogsByCategory(posts: BlogPost[], categorySlug: string) {
  if (!categorySlug || categorySlug === ALL_BLOG_CATEGORY) return posts;

  return posts.filter((post) =>
    allTokens(post).some((token) => slugify(token) === categorySlug)
  );
}
