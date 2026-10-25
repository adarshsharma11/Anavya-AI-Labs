import type { Metadata } from "next";
import PrivacyClient from "./privacy-client";
import { MetaHead } from "@/components/seo/meta-head";

export const metadata: Metadata = {
  ...MetaHead({
    title: "Privacy Policy",
    description: "Privacy Policy for Anavya AI Labs",
    canonical: "/privacy",
  }),
  robots: {
    index: false,
    follow: true,
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
