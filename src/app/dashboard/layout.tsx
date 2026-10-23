import type { Metadata } from "next";

import { noindexMetadataFor } from "@/components/seo/noindex";
import { DashboardShell } from "./dashboard-shell";

export const metadata: Metadata = noindexMetadataFor("/dashboard");

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
