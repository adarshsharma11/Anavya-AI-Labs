"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeft,
  Briefcase,
  CreditCard,
  FileSearch,
  FileText,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareQuote,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { AdminPendingReviewsBadge } from "@/components/reviews/admin-pending-badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";
import { getAppShellBackLink, isAdminSection, isNavActive } from "@/lib/dashboard/shell-nav";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: "pending-reviews";
};

const userNavItems: NavItem[] = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Scans", href: "/dashboard/scans", icon: FileSearch },
  { title: "Monitoring", href: "/dashboard/monitors", icon: Activity },
  { title: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { title: "Profile & Branding", href: "/dashboard/settings", icon: Settings },
];

const adminNavItems: NavItem[] = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Contact Requests", href: "/dashboard/admin/contacts", icon: Mail },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: MessageSquareQuote,
    badge: "pending-reviews",
  },
  { title: "Manage Blogs", href: "/dashboard/admin/blogs", icon: FileText },
  { title: "Manage Services", href: "/dashboard/admin/services", icon: Wrench },
  { title: "Manage Portfolio", href: "/dashboard/admin/portfolio", icon: Briefcase },
  { title: "Manage About", href: "/dashboard/admin/about", icon: Info },
  { title: "Users & Scans", href: "/dashboard/admin/users", icon: Users },
  { title: "Revenue", href: "/dashboard/admin/revenue", icon: Activity },
  { title: "GEO Leads", href: "/dashboard/admin/geo-leads", icon: Mail },
  { title: "Site Settings", href: "/dashboard/admin/settings", icon: Settings },
];

function SidebarBrand({ isAdmin }: { isAdmin: boolean }) {
  const logoSrc = siteConfig.logo?.src ?? "/logo.svg";

  return (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-2.5 rounded-lg px-1.5 py-1 outline-none ring-sidebar-ring focus-visible:ring-2"
    >
      <img
        src={logoSrc}
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0 object-contain"
      />
      <span className="min-w-0 truncate text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
        {isAdmin ? "Admin" : "Dashboard"}
      </span>
    </Link>
  );
}

function SidebarBackLink({ href, label }: { href: string; label: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={label}>
          <Link href={href}>
            <ArrowLeft />
            <span>{label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function SidebarNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const { setOpenMobile } = useSidebar();

  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                    {item.badge === "pending-reviews" ? (
                      <AdminPendingReviewsBadge className="ml-auto group-data-[collapsible=icon]:hidden" />
                    ) : null}
                  </Link>
                </SidebarMenuButton>
                {item.badge === "pending-reviews" ? (
                  <AdminPendingReviewsBadge
                    variant="dot"
                    className="absolute right-1 top-1 hidden group-data-[collapsible=icon]:block"
                  />
                ) : null}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function DashboardShell({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const back = getAppShellBackLink(pathname);
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="h-dvh min-h-0 overflow-hidden"
      data-app-shell="true"
    >
      <Sidebar collapsible="icon">
        <SidebarHeader className="gap-1 border-b border-sidebar-border/70">
          <SidebarBrand isAdmin={isAdmin} />
          <p className="truncate px-2 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
            Welcome back, {firstName}
          </p>
        </SidebarHeader>

        <SidebarContent>
          <div className="px-2 pt-1">
            <SidebarBackLink href={back.href} label={back.label} />
          </div>
          <SidebarSeparator />
          <SidebarNav items={navItems} pathname={pathname} />
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/70">
          <div className="flex items-center justify-between px-2 group-data-[collapsible=icon]:justify-center">
            <span className="text-xs font-medium text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
              Theme
            </span>
            <ThemeToggle />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Log out" onClick={() => logout()}>
                <LogOut />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="h-full min-h-0 overflow-hidden bg-background">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-background/80 px-3 backdrop-blur-md md:px-5">
          <SidebarTrigger className="-ml-1" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {isAdminSection(pathname) ? "Admin" : "Dashboard"}
            </p>
          </div>
          <Link
            href={back.href}
            aria-label={back.label}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">{back.label}</span>
          </Link>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute right-0 top-32 h-[30rem] w-[30rem] rounded-full bg-sky-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
          </div>
          <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8 lg:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
