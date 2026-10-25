import type { Metadata } from "next";
import { cookies } from "next/headers";

import { DashboardShell } from "@/app/dashboard/dashboard-shell";
import { noindexMetadataFor } from "@/components/seo/noindex";

export const metadata: Metadata = noindexMetadataFor("/admin");

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return <DashboardShell defaultOpen={defaultOpen}>{children}</DashboardShell>;
}
