import type { Metadata } from "next";
import TermsClient from "./terms-client";
import { MetaHead } from "@/components/seo/meta-head";

export const metadata: Metadata = MetaHead({
  title: "Terms of Service",
  description: "Terms of Service for Anavya AI Labs",
  canonical: "/terms",
});

export default function TermsPage() {
  return <TermsClient />;
}
