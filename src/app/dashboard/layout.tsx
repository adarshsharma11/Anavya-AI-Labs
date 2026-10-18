import type { Metadata } from "next";

import { noindexMetadata } from "@/components/seo/noindex";
import { DashboardShell } from "./dashboard-shell";

export const metadata: Metadata = noindexMetadata;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
