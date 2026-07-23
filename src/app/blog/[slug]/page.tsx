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

import { compileMDX } from "next-mdx-remote/rsc";

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

    // Compile MDX dynamically on the Server
    const { content } = await compileMDX({
      source: post.content || "",
      options: { parseFrontmatter: false },
    });

    // Create JSON-LD schema metadata for Google SEO & Generative search engine indexing (GEO)
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "image": post.image,
      "datePublished": post.date,
      "author": {
        "@type": "Person",
        "name": post.authorName,
        "jobTitle": post.authorRole,
      },
      "publisher": {
        "@type": "Organization",
        "name": "Anavya AI Labs",
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://anavya.ai/blog/${post.slug}`
      }
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
  } catch (error) {
    console.error(`Failed to fetch blog post with slug ${slug}:`, error);
    notFound();
  }
}