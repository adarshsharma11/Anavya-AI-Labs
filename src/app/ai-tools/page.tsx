import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import AiToolsClient from "./ai-tools-client";

export const metadata: Metadata = MetaHead(pageMetadata.aiTools);

export default function AiToolsPage() {
  return <AiToolsClient />;
}

