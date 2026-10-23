import type { Metadata } from "next";

import { noindexMetadataFor } from "@/components/seo/noindex";

export const metadata: Metadata = noindexMetadataFor("/reset-password");

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
