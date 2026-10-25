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
    const publishedAt = new Date(post.date || post.createdAt || "");
    const publishedIso = Number.isNaN(publishedAt.getTime())
      ? undefined
      : publishedAt.toISOString();

    return {
      ...MetaHead({
        title: post.title,
        description: post.excerpt,
        canonical: `/blog/${post.slug}`,
        image: post.image,
      }),
      other: {
        author: post.authorName || "Anavya AI Labs",
        ...(publishedIso
          ? {
              "article:published_time": publishedIso,
              "publish-date": publishedIso.slice(0, 10),
            }
          : {}),
      },
    };
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
  const publishedAt = post.date || post.createdAt;
  const imageUrl = post.image
    ? post.image.startsWith("http")
      ? post.image
      : `${siteConfig.url}${post.image.startsWith("/") ? post.image : `/${post.image}`}`
    : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    ...(imageUrl ? { image: imageUrl } : {}),
    datePublished: publishedAt,
    dateModified: post.createdAt || publishedAt,
    author: {
      "@type": "Person",
      name: post.authorName || "Anavya AI Labs",
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
