"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Linkedin } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons/logo";
import { Separator } from "@/components/ui/separator";

const PRODUCT_LINKS = [
  { title: "Website Scanner", href: "/scanner" },
  { title: "Competitor Scanner", href: "/competitor-scanner" },
  { title: "Services", href: "/services" },
  { title: "Blog", href: "/blog" },
] as const;

const COMPANY_LINKS = [
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
] as const;

const LEGAL_LINKS = [
  { title: "Terms of Service", href: "/terms" },
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Refund Policy", href: "/refund-policy" },
] as const;

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="border-t bg-transparent">
      <div className="container py-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Logo />
            </Link>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="font-semibold">Product</h3>
              <ul className="mt-4 space-y-2">
                {PRODUCT_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2">
                {COMPANY_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2">
                {LEGAL_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Contact</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="hover:text-foreground"
                  >
                    {siteConfig.email}
                  </a>
                </li>
                <li>{siteConfig.location}</li>
                <li>{siteConfig.name}</li>
              </ul>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <a
            href={siteConfig.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Anavya AI Labs on LinkedIn"
            className="text-muted-foreground hover:text-foreground"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
