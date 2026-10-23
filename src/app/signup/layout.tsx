import type { Metadata } from "next";

import { noindexMetadataFor } from "@/components/seo/noindex";

export const metadata: Metadata = noindexMetadataFor("/signup");

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
