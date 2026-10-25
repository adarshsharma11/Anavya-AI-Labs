import type { Metadata } from 'next';

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

  const CANONICAL_ORIGIN = "https://www.anavyaailabs.com";

  export function toCanonicalUrl(path: `/${string}`): string {
    if (!path.startsWith("/") || path.startsWith("//")) {
      throw new Error("Canonical path must be an internal site path.");
    }
  
    const url = new URL(path, `${CANONICAL_ORIGIN}/`);
  
    if (url.origin !== CANONICAL_ORIGIN) {
      throw new Error("Canonical URL must use the configured site origin.");
    }
  
    // Public SEO pages should not have tracking or arbitrary query variants.
    url.search = "";
    url.hash = "";
  
    // Normalize trailing slashes except for the homepage.
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
    title: 'Free AI Website Scanner: SEO, Speed & AI Visibility Audit | Anavya AI Labs',
    description:
      'Scan any URL for SEO, speed, and AI-search issues. Get a ranked fix list in 60 seconds. Free, no signup needed.',
    canonical: '/',
  },
  scanner: {
    title: 'Free SEO & GEO Scanner | Anavya AI Labs',
    description:
      'Get free AEO and GEO scores in seconds. See how ChatGPT, Perplexity, Gemini, Claude, and Bing read your site — and what to fix first.',
    canonical: '/scanner',
  },
  competitorScanner: {
    title: 'Competitor Website Scanner & SEO Comparison Tool | Anavya AI Labs',
    description:
      'Compare your website against a competitor to uncover SEO, performance, accessibility, and conversion gaps with an AI-powered competitor website scanner.',
    canonical: '/competitor-scanner',
  },
  services: {
    title: 'Website Audit & AI Optimization Services | Anavya AI Labs',
    description:
      'Explore AI-powered website analysis services: performance, SEO, and accessibility improvements to boost conversions.',
    canonical: '/services',
  },
  portfolio: {
    title: 'Portfolio | Anavya AI Labs',
    description:
      'See recent projects and examples of high-performing websites and UI/UX work delivered by anavyaailabs.com.',
    canonical: '/portfolio',
  },
  pricing: {
    title: 'Pricing | Anavya AI Labs',
    description:
      'Free, Starter, and Pro plans for AI and search readiness audits. Prices and scan limits come from the live pricing API.',
    canonical: '/pricing',
  },
  about: {
    title: 'About | Anavya AI Labs',
    description:
      'Learn about anavyaailabs.com and our mission to help teams build faster, more accessible websites.',
    canonical: '/about',
  },
  contact: {
    title: 'Contact Us | Anavya AI Labs',
    description:
      'Get in touch with Anavya AI Labs for support, feedback, or enterprise inquiries.',
    canonical: '/contact',
  },
  blog: {
    title: 'Blog | Anavya AI Labs',
    description:
      'Insights on AI-powered UX, performance tuning, accessibility, and building high-converting web experiences.',
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
          alt: `${title} | Anavya AI Labs`,
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
