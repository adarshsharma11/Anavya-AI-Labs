"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import React from "react";
import { Menu, User, LayoutDashboard, LogOut } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

export function SiteHeader() {
  const scrolled = useScroll();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const { isAuthenticated, user, logout } = useAuth();

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
          {siteConfig.mainNav.map((item) => {
            if (item.href === "/" && isAuthenticated) {
              return (
                <React.Fragment key="home-and-dashboard">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                      pathname === item.href ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    {item.title}
                  </Link>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                      pathname.startsWith("/dashboard") ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    My Dashboard
                  </Link>
                </React.Fragment>
              );
            }

            return (
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
            );
          })}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-4">
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
               <div className="flex items-center space-x-2 ml-4">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
               </div>
            )}
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
                    {siteConfig.mainNav.map((item) => {
                      if (item.href === "/" && isAuthenticated) {
                        return (
                          <React.Fragment key="mobile-home-and-dashboard">
                            <Link
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "text-lg font-medium",
                                pathname === item.href ? "text-foreground" : "text-foreground/60"
                              )}
                            >
                              {item.title}
                            </Link>
                            <Link
                              href="/dashboard"
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "text-lg font-medium",
                                pathname.startsWith("/dashboard") ? "text-foreground" : "text-foreground/60"
                              )}
                            >
                              My Dashboard
                            </Link>
                          </React.Fragment>
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
                              ? "text-foreground"
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
                         <div className="flex items-center space-x-3 mb-4">
                           <Avatar className="h-8 w-8">
                             <AvatarImage src={user?.companyLogoUrl} />
                             <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                           </Avatar>
                           <div className="flex flex-col text-sm">
                             <span className="font-medium">{user?.name}</span>
                           </div>
                         </div>
                         <Button variant="destructive" className="w-full justify-start" onClick={() => { logout(); setIsOpen(false); }}>
                           <LogOut className="mr-2 h-4 w-4" /> Log Out
                         </Button>
                       </div>
                    ) : (
                       <div className="flex flex-col gap-2">
                         <Button variant="outline" asChild className="w-full">
                           <Link href="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                         </Button>
                         <Button asChild className="w-full">
                           <Link href="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
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
