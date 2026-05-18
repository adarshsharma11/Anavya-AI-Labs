import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import BlogClient from "./blog-client";
import { getBlogsApi, type BlogPost } from "@/lib/api/blogs";

export const metadata: Metadata = MetaHead(pageMetadata.blog);

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let blogs: BlogPost[] = [];
  try {
    const res = await getBlogsApi();
    if (res.success) {
      blogs = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    blogs = [];
  }

  return <BlogClient initialBlogs={blogs} />;
}