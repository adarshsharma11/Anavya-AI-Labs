import { Suspense } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import BlogClient from "./blog-client";
import { getBlogsApi, type BlogPost } from "@/lib/api/blogs";

export const metadata: Metadata = MetaHead(pageMetadata.blog);

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialCategory =
    typeof params.category === "string" ? params.category : undefined;

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

  return (
    <Suspense fallback={<BlogPageFallback />}>
      <BlogClient initialBlogs={blogs} initialCategory={initialCategory} />
    </Suspense>
  );
}

function BlogPageFallback() {
  return (
    <section className="container py-12 md:py-24">
      <div className="mx-auto max-w-3xl animate-pulse space-y-4 text-center">
        <div className="mx-auto h-6 w-40 rounded-full bg-muted" />
        <div className="mx-auto h-12 w-full rounded-2xl bg-muted" />
        <div className="mx-auto h-5 w-2/3 rounded-full bg-muted" />
      </div>
    </section>
  );
}
