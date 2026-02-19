"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import React from "react";
import { Menu } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader() {
  const scrolled = useScroll();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-sm"
          : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo />
        </Link>
        <nav className="hidden gap-6 md:flex">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex">
            <ThemeToggle />
            <Button asChild className="ml-4">
              <Link href="/scanner">AI Website Scanner</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex h-full flex-col">
                  <div className="border-b p-4">
                    <Link href="/" onClick={() => setIsOpen(false)}>
                      <Logo />
                    </Link>
                  </div>
                  <nav className="flex flex-col gap-4 p-4">
                    {siteConfig.mainNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-lg font-medium",
                          pathname === item.href
                            ? "text-foreground"
                            : "text-foreground/60"
                        )}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto border-t p-4">
                    <div className="flex items-center justify-between">
                      <span>Switch Theme</span>
                      <ThemeToggle />
                    </div>
                    <Button asChild className="mt-4 w-full">
                      <Link href="/scanner" onClick={() => setIsOpen(false)}>
                        AI Website Scanner
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
