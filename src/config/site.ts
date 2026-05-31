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
  url: "https://anavyaailabs.com",
  description: "AI that finds what is costing your website customers.",
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
    title: 'AI-Powered Website Analysis',
    description:
      'AI that finds what is costing your website customers. Get a free, instant analysis of your website is performance, SEO, and user experience.',
    canonical: '/',
  },
  scanner: {
    title: 'Free AI Website Scanner & SEO Audit Tool | Anavya AI Labs',
    description:
      'Scan your website for SEO, performance, accessibility, and security issues. Get a free AI-powered website audit with instant fixes and competitor insights.',
    canonical: '/scanner',
  },
  competitorScanner: {
    title: 'Competitor Website Scanner & SEO Comparison Tool | Anavya AI Labs',
    description:
      'Compare your website against a competitor to uncover SEO, performance, accessibility, and conversion gaps with an AI-powered competitor website scanner.',
    canonical: '/competitor-scanner',
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
  // pricing: {
  //   title: 'Pricing',
  //   description:
  //     'Compare plans and unlock Pro checks, detailed reports, and continuous monitoring for your website.',
  //   canonical: '/pricing',
  // },
  about: {
    title: 'About',
    description:
      'Learn about anavyaailabs.com and our mission to help teams build faster, more accessible websites.',
    canonical: '/about',
  },
  contact: {
    title: 'Contact Us',
    description:
      'Get in touch with Anavya AI Labs for support, feedback, or enterprise inquiries.',
    canonical: '/contact',
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
