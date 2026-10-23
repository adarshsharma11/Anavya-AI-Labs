import type { Metadata } from "next";

import { noindexMetadataFor } from "@/components/seo/noindex";

export const metadata: Metadata = noindexMetadataFor("/login");

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
