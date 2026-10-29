"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  FileCode,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { siteConfig, type NavItem } from "@/config/site";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/components/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function NavDropdown({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isChildActive = item.items?.some((sub) => pathname === sub.href) || pathname === item.href;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 160);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        aria-expanded={isOpen}
        className={cn(
          "group inline-flex items-center gap-1 text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm focus:outline-none",
          isChildActive || isOpen
            ? "text-foreground font-semibold"
            : "text-foreground/60"
        )}
      >
        <span>{item.title}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-1/2 top-full z-50 mt-2.5 w-[380px] -translate-x-1/2 rounded-2xl border border-border/80 bg-background/95 p-3 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
        >
          <div className="mb-2 px-2.5 pt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Free Tools for Every Website</span>
            <span className="text-[10px] lowercase text-muted-foreground/70 font-normal">no sign-up</span>
          </div>
          <div className="flex flex-col gap-1">
            {item.items?.map((sub) => {
              const isSubActive = pathname === sub.href;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/60",
                    isSubActive && "bg-muted/40"
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-foreground group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    {sub.icon === "file-code" && <FileCode className="h-4 w-4 text-rose-500" />}
                    {sub.icon === "shield-check" && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                    {sub.icon === "bar-chart" && <BarChart3 className="h-4 w-4 text-sky-500" />}
                    {!sub.icon && <Sparkles className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {sub.title}
                      </span>
                      {sub.badge && (
                        <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider text-rose-500">
                          {sub.badge}
                        </span>
                      )}
                    </div>
                    {sub.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors line-clamp-1">
                        {sub.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const scrolled = useScroll();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return null;
  }

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
        <nav className="hidden gap-6 md:flex items-center">
          {siteConfig.mainNav.map((item) => {
            if (item.items && item.items.length > 0) {
              return (
                <NavDropdown
                  key={item.title}
                  item={item}
                  pathname={pathname}
                />
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                  pathname === item.href
                    ? "text-foreground font-semibold"
                    : "text-foreground/60"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.companyLogoUrl} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="text-sm text-foreground/70 transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
            )}
            <Button asChild>
              <Link href="/scanner">Run free scan</Link>
            </Button>
          </div>
          <Button asChild className="md:hidden">
            <Link href="/scanner">Run free scan</Link>
          </Button>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Access site pages and account configuration</SheetDescription>
                <div className="flex h-full flex-col">
                  <div className="border-b p-4">
                    <Link href="/" onClick={() => setIsOpen(false)}>
                      <Logo />
                    </Link>
                  </div>
                  <nav className="flex flex-col gap-3 p-4 overflow-y-auto">
                    {siteConfig.mainNav.map((item) => {
                      if (item.items && item.items.length > 0) {
                        return (
                          <div key={item.title} className="flex flex-col gap-1 py-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                              {item.title}
                            </span>
                            <div className="flex flex-col gap-2 pl-3 border-l border-border/60 ml-1">
                              {item.items.map((sub) => (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={() => setIsOpen(false)}
                                  className={cn(
                                    "flex items-center justify-between text-base font-medium py-1 transition-colors hover:text-foreground",
                                    pathname === sub.href ? "text-foreground font-semibold" : "text-foreground/70"
                                  )}
                                >
                                  <span>{sub.title}</span>
                                  {sub.badge && (
                                    <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.2 text-[10px] font-bold text-rose-500">
                                      {sub.badge}
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-lg font-medium",
                            pathname === item.href
                              ? "text-foreground font-semibold"
                              : "text-foreground/60"
                          )}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="mt-auto border-t p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span>Switch Theme</span>
                      <ThemeToggle />
                    </div>
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.companyLogoUrl} />
                            <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col text-sm">
                            <span className="font-medium">{user?.name}</span>
                            <span className="text-xs text-muted-foreground">{user?.email}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 mb-2">
                          <Button variant="outline" asChild className="w-full justify-start" onClick={() => setIsOpen(false)}>
                            <Link href="/dashboard">
                              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                            </Link>
                          </Button>
                          <Button variant="outline" asChild className="w-full justify-start" onClick={() => setIsOpen(false)}>
                            <Link href="/dashboard/settings">
                              <User className="mr-2 h-4 w-4" /> Profile Settings
                            </Link>
                          </Button>
                        </div>
                        <Button variant="destructive" className="w-full justify-start" onClick={() => { logout(); setIsOpen(false); }}>
                          <LogOut className="mr-2 h-4 w-4" /> Log Out
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                        >
                          Sign In
                        </Link>
                        <Button asChild className="w-full">
                          <Link href="/scanner" onClick={() => setIsOpen(false)}>Run free scan</Link>
                        </Button>
                      </div>
                    )}
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
