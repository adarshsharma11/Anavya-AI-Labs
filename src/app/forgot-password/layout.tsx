import type { Metadata } from "next";

import { noindexMetadataFor } from "@/components/seo/noindex";

export const metadata: Metadata = noindexMetadataFor("/forgot-password");

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
