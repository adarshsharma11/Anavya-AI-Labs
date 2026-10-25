"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

function isAppShellPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isAppShellPath(pathname)) {
    return <div className="h-dvh overflow-hidden">{children}</div>;
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
