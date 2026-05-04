import type { Metadata } from "next";
import RefundPolicyClient from "./refund-policy-client";
import { MetaHead } from "@/components/seo/meta-head";

export const metadata: Metadata = MetaHead({
  title: "Refund Policy",
  description: "Refund Policy for Anavya AI Labs",
  canonical: "/refund-policy",
});

export default function RefundPolicyPage() {
  return <RefundPolicyClient />;
}
