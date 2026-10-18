import type { Metadata } from "next";

import { noindexMetadata } from "@/components/seo/noindex";

export const metadata: Metadata = noindexMetadata;

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
