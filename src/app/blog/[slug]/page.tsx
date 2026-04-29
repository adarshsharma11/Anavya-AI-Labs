import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MetaHead } from "@/components/seo/meta-head";
import { getBlogBySlugApi, getBlogsApi } from "@/lib/api/blogs";
import BlogDetailsClient from "./blog-details-client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const res = await getBlogsApi();
    if (res.success) {
      return res.data.map((post) => ({ slug: post.slug }));
    }
  } catch (error) {
    console.error("Failed to generate static params for blogs:", error);
  }
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await getBlogBySlugApi(slug);
    if (!res.success || !res.data) {
      return { title: "Blog Post" };
    }

    const post = res.data;
    return MetaHead({
      title: post.title,
      description: post.excerpt,
      canonical: `/blog/${post.slug}`,
      image: post.image,
    });
  } catch {
    return { title: "Blog Post" };
  }
}

export default async function BlogDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const [blogRes, allBlogsRes] = await Promise.all([
      getBlogBySlugApi(slug),
      getBlogsApi(),
    ]);

    if (!blogRes.success || !blogRes.data) {
      notFound();
    }

    const post = blogRes.data;
    const relatedPosts = allBlogsRes.success 
      ? allBlogsRes.data.filter(b => b.slug !== slug)
      : [];

    return <BlogDetailsClient post={post} relatedPosts={relatedPosts} />;
  } catch (error) {
    console.error(`Failed to fetch blog post with slug ${slug}:`, error);
    notFound();
  }
}