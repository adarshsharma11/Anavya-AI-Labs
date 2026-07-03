"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileSearch,
  Settings,
  Menu,
  X,
  LogOut,
  Mail,
  FileText,
  Briefcase,
  Info,
  Wrench,
  Users,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Scans",
    href: "/dashboard/scans",
    icon: FileSearch,
  },
  {
    title: "Profile & Branding",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const adminSidebarNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Contact Requests",
    href: "/dashboard/admin/contacts",
    icon: Mail,
  },
  {
    title: "Manage Blogs",
    href: "/dashboard/admin/blogs",
    icon: FileText,
  },
  {
    title: "Manage Services",
    href: "/dashboard/admin/services",
    icon: Wrench,
  },
  {
    title: "Manage Portfolio",
    href: "/dashboard/admin/portfolio",
    icon: Briefcase,
  },
  {
    title: "Manage About",
    href: "/dashboard/admin/about",
    icon: Info,
  },
  {
    title: "Users & Scans",
    href: "/dashboard/admin/users",
    icon: Users,
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === "admin" ? adminSidebarNavItems : sidebarNavItems;

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      {/* Background Ambient Gradients (matching scanner) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute right-0 top-32 h-[30rem] w-[30rem] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      {/* Mobile Nav Toggle & Back to Home Button */}
      <div className="md:hidden absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-none">
        <Button variant="outline" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="bg-background/80 backdrop-blur pointer-events-auto">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 backdrop-blur px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shadow-sm pointer-events-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border/60 bg-background/80 backdrop-blur shadow-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col px-4 py-8 md:py-12">
          <div className="mb-8 px-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {user?.role === "admin" ? "Admin Panel" : "Dashboard"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground/90">{user?.name?.split(" ")[0] || "User"}</span>.
            </p>
            <div className="mt-4 pt-4 border-t border-border/40">
              <Link 
                href="/"
                className="inline-flex w-full items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
          <nav className="flex-1 space-y-2 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="dashboard-sidebar-active"
                      className="absolute inset-0 z-0 rounded-xl border border-primary/20 bg-primary/10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "relative z-10 h-5 w-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "relative z-10 transition-colors",
                      isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-border/60 pt-6 pb-2 px-2 space-y-4">
            <div className="flex items-center justify-between px-3">
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" 
              onClick={() => logout()}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto px-4 py-16 md:px-8 md:py-12 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
