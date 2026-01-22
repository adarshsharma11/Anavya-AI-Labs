export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type SiteConfig = {
  name: string;
  description: string;
  mainNav: NavItem[];
};

export const siteConfig: SiteConfig = {
  name: "anavyaailabs.com",
  description: "AI that finds what’s costing your website customers.",
  mainNav: [
    {
      title: "Scanner",
      href: "/scanner",
    },
    {
      title: "Services",
      href: "/services",
    },
    {
      title: "Portfolio",
      href: "/portfolio",
    },
    {
      title: "Pricing",
      href: "/pricing",
    },
    {
      title: "About",
      href: "/about",
    },
  ],
};
