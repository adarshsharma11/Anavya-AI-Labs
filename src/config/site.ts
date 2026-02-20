import type { Metadata } from 'next';

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type SiteConfig = {
  name: string;
  url: string;
  description: string;
  mainNav: NavItem[];
};

export const siteConfig: SiteConfig = {
  name: "Anavya AI Labs",
  url: "https://anavyaailabs.com",
  description: "AI that finds what’s costing your website customers.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "AI Tools",
      href: "/ai-tools",
    },
    {
      title: "AI Services",
      href: "/services",
    },
    {
      title: "Pricing",
      href: "/pricing",
    },
    {
      title: "Blog",
      href: "/blog",
    },
    {
      title: "About",
      href: "/about",
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
    title: 'AI-Powered Website Analysis',
    description:
      'AI that finds what’s costing your website customers. Get a free, instant analysis of your website’s performance, SEO, and user experience.',
    canonical: '/',
  },
  aiTools: {
    title: 'AI Tools',
    description:
      'Explore AI tools by Anavya AI Labs, including website scanning, competitor comparisons, and conversion insights.',
    canonical: '/ai-tools',
  },
  scanner: {
    title: 'AI Website Scanner Tool',
    description:
      'Free AI website scanner for performance, SEO, accessibility, and security. Get an instant report with actionable fixes.',
    canonical: '/scanner',
  },
  services: {
    title: 'AI Services',
    description:
      'Explore AI-powered website analysis services: performance, SEO, and accessibility improvements to boost conversions.',
    canonical: '/services',
  },
  portfolio: {
    title: 'Portfolio',
    description:
      'See recent projects and examples of high-performing websites and UI/UX work delivered by anavyaailabs.com.',
    canonical: '/portfolio',
  },
  pricing: {
    title: 'Pricing',
    description:
      'Compare plans and unlock Pro checks, detailed reports, and continuous monitoring for your website.',
    canonical: '/pricing',
  },
  about: {
    title: 'About',
    description:
      'Learn about anavyaailabs.com and our mission to help teams build faster, more accessible websites.',
    canonical: '/about',
  },
  blog: {
    title: 'Blog',
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
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}
