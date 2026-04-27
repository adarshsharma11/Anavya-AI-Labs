import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MetaHead } from "@/components/seo/meta-head";
import { blogPosts } from "@/lib/blog-data";
import BlogDetailsClient from "./blog-details-client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return {
      title: "Blog Post",
    };
  }

  return MetaHead({
    title: post.title,
    description: post.excerpt,
    canonical: `/blog/${post.slug}`,
    image: post.image,
  });
}

export default async function BlogDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailsClient post={post} />;
}