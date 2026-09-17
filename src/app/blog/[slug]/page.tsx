import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { MetaHead } from "@/components/seo/meta-head";
import { siteConfig } from "@/config/site";
import { compileBlogMarkdown } from "@/lib/blog-markdown";
import { getBlogBySlugApi, getBlogsApi } from "@/lib/api/blogs";
import BlogDetailsClient from "./blog-details-client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

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

  let blogRes;
  let allBlogsRes;
  try {
    [blogRes, allBlogsRes] = await Promise.all([
      getBlogBySlugApi(slug),
      getBlogsApi(),
    ]);
  } catch (error) {
    console.error(`Failed to fetch blog post with slug ${slug}:`, error);
    notFound();
  }

  if (!blogRes.success || !blogRes.data) {
    notFound();
  }

  const post = blogRes.data;
  const relatedPosts = allBlogsRes.success
    ? allBlogsRes.data.filter((b) => b.slug !== slug)
    : [];

  let content: ReactNode;
  try {
    ({ content } = await compileBlogMarkdown(post.content || ""));
  } catch (error) {
    console.error(`Failed to compile blog markdown for slug ${slug}:`, error);
    content = <p>{post.excerpt || post.title}</p>;
  }

  const postUrl = `${siteConfig.url}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.authorName,
      jobTitle: post.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogDetailsClient post={post} relatedPosts={relatedPosts}>
        {content}
      </BlogDetailsClient>
    </>
  );
}
