import type { Metadata } from "next";
import { MetaHead } from "@/components/seo/meta-head";
import CaseStudyClient from "./case-study-client";

export const metadata: Metadata = MetaHead({
  title: "Case Study",
  description:
    "See how Anavya AI Labs improved conversion, performance, and trust with an AI-led optimization engagement.",
  canonical: "/case-study",
});

export default function CaseStudyPage() {
  return <CaseStudyClient />;
}
