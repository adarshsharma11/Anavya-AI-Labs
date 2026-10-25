import type { Metadata } from "next";
import { cookies } from "next/headers";

import { noindexMetadataFor } from "@/components/seo/noindex";
import { DashboardShell } from "./dashboard-shell";

export const metadata: Metadata = noindexMetadataFor("/dashboard");

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return <DashboardShell defaultOpen={defaultOpen}>{children}</DashboardShell>;
}
