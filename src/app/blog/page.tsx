import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import BlogClient from "./blog-client";

export const metadata: Metadata = MetaHead(pageMetadata.blog);

export default function BlogPage() {
  return <BlogClient />;
}
