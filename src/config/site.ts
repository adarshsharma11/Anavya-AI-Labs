import type { Metadata } from 'next';

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

const CANONICAL_ORIGIN = "https://anavyaailabs.com";

export function toCanonicalUrl(path: `/${string}`): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("Canonical path must be an internal site path.");
  }

  const url = new URL(path, `${CANONICAL_ORIGIN}/`);

  if (url.origin !== CANONICAL_ORIGIN) {
    throw new Error("Canonical URL must use the configured site origin.");
  }

  url.search = "";
  url.hash = "";

  if (url.pathname !== "/") {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url.toString();
}

export type SiteConfig = {
  name: string;
  url: string;
  description: string;
  email: string;
  location: string;
  linkedin: string;
  x: string;
  logo?: {
    src: string;
    lightSrc?: string;
    darkSrc?: string;
    alt?: string;
    width?: number;
    height?: number;
    showName?: boolean;
  };
  mainNav: NavItem[];
};

export const siteConfig: SiteConfig = {
  name: "Anavya AI Labs",
  url: CANONICAL_ORIGIN,
  description: "AI that finds what is costing your website customers.",
  email: "support@anavyaailabs.com",
  location: "Mohali, India",
  linkedin: "https://www.linkedin.com/in/anavya-ai-labs-8811523a6/",
  x: "https://x.com/Anavyaailabs",
  logo: {
    src: "/logo.svg",
    alt: "Anavya AI Labs",
    width: 56,
    height: 56,
    showName: false,
  },
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Scanner",
      href: "/scanner",
    },
    {
      title: "Competitors",
      href: "/competitor-scanner",
    },
    {
      title: "Blog",
      href: "/blog",
    },
    {
      title: "Services",
      href: "/services",
    },
    {
      title: "About",
      href: "/about",
    },
    {
      title: "Contact",
      href: "/contact",
    },
  ],
};

export type PageMetadataConfig = {
  title: string;
  description: string;
  canonical: `/${string}` | '/';
};

export const pageMetadata = {
  home: {
    title: 'AI Website Scanner for SEO and GEO | Anavya AI Labs',
    description:
      'Scan any URL for SEO, speed, and AI-search issues. Get a ranked fix list in 60 seconds. Free, no signup needed.',
    canonical: '/',
  },
  scanner: {
    title: 'Free SEO, GEO and AEO Website Scanner',
    description:
      'Scan one public URL for SEO, Core Web Vitals, and AI-search readiness. Get a ranked fix list. Free to start, no install.',
    canonical: '/scanner',
  },
  competitorScanner: {
    title: 'Competitor SEO and AI Visibility Scan',
    description:
      'Compare two public websites for SEO, speed, accessibility, and AI-search gaps. Get a ranked list of what to fix first.',
    canonical: '/competitor-scanner',
  },
  services: {
    title: 'Website Audit and AI Optimization',
    description:
      'Implementation help after a scan: AI agents, site fixes, and performance work based on the issues in your report.',
    canonical: '/services',
  },
  portfolio: {
    title: 'Selected Website and Product Work',
    description:
      'Selected website and product work from Anavya AI Labs, including interface and performance projects shown on this page.',
    canonical: '/portfolio',
  },
  pricing: {
    title: 'Free, Starter, and Pro Scan Plans',
    description:
      'Free, Starter, and Pro plans for website scans. Daily limits and prices are shown on this page from the live pricing API.',
    canonical: '/pricing',
  },
  about: {
    title: 'About Our AI Website Scanner Studio',
    description:
      'Learn how Anavya AI Labs audits websites for search and AI answers, then helps teams ship the fixes from a scan.',
    canonical: '/about',
  },
  contact: {
    title: 'Talk to Us About Your Website Scan',
    description:
      'Contact Anavya AI Labs about a website scan, a competitor comparison, or help putting the report fixes into the site.',
    canonical: '/contact',
  },
  blog: {
    title: 'Guides for GEO, SEO and AI Search',
    description:
      'Guides on GEO, AI search, Core Web Vitals, and technical SEO from the team behind the Anavya website scanner.',
    canonical: '/blog',
  },
} satisfies Record<string, PageMetadataConfig>;

export function createPageMetadata({
  title,
  description,
  canonical,
}: PageMetadataConfig): Metadata {
  const canonicalUrl = toCanonicalUrl(canonical);
  const isHome = canonical === "/";

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}
