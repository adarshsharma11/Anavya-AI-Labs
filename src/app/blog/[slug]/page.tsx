import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MetaHead } from "@/components/seo/meta-head";
import { blogPosts } from "@/lib/blog-data";
import BlogDetailsClient from "./blog-details-client";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = blogPosts.find((item) => item.slug === params.slug);

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

export default function BlogDetailsPage({ params }: PageProps) {
  const post = blogPosts.find((item) => item.slug === params.slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailsClient post={post} />;
}
