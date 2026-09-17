"use client";

import { Children, Fragment, cloneElement, isValidElement, type ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { type BlogPost } from "@/lib/api/blogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdSenseAd } from "@/components/ads/AdSenseAd";

type BlogDetailsClientProps = {
  post: BlogPost;
  relatedPosts?: BlogPost[];
  children?: React.ReactNode;
};

function flattenNodes(nodes: ReactNode): ReactNode[] {
  return Children.toArray(nodes).flatMap((node) => {
    if (isValidElement(node) && node.type === Fragment) {
      return flattenNodes((node.props as { children?: ReactNode }).children);
    }
    return [node];
  });
}

function isParagraph(node: ReactNode) {
  if (!isValidElement(node)) return false;
  if (node.type === "p") return true;
  const props = node.props as { mdxType?: string };
  return props.mdxType === "p";
}

function insertAfterNthParagraph(
  children: ReactNode,
  paragraphIndex: number,
  ad: ReactNode
) {
  const state = { count: 0, inserted: false };

  const walk = (nodes: ReactNode): ReactNode[] => {
    const out: ReactNode[] = [];

    for (const node of flattenNodes(nodes)) {
      if (state.inserted) {
        out.push(node);
        continue;
      }

      if (isParagraph(node)) {
        out.push(node);
        state.count += 1;
        if (state.count === paragraphIndex) {
          out.push(ad);
          state.inserted = true;
        }
        continue;
      }

      if (isValidElement(node)) {
        const nested = (node.props as { children?: ReactNode }).children;
        if (nested != null) {
          out.push(cloneElement(node, undefined, walk(nested)));
          continue;
        }
      }

      out.push(node);
    }

    return out;
  };

  const result = walk(children);
  if (!state.inserted) {
    result.push(ad);
  }
  return result;
}

export default function BlogDetailsClient({ post, relatedPosts = [], children }: BlogDetailsClientProps) {
  const author = {
    name: post.authorName,
    role: post.authorRole,
    avatar: post.authorAvatar,
  };
  const inArticleSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? "";
  const beforeRelatedSlot =
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_BEFORE_RELATED ?? "";
  const articleContent = insertAfterNthParagraph(
    children,
    2,
    <AdSenseAd key="blog-in-article-ad" adSlot={inArticleSlot} />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <section className="container py-10 md:py-20">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <Button variant="ghost" className="px-0" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
          <Badge variant="secondary" className="rounded-full">
            {post.category}
          </Badge>
          <span>{post.date}</span>
          <span>{post.readTime}</span>
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.6fr_0.9fr] lg:items-start">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {post.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Image
                src={author.avatar}
                alt={author.name}
                width={56}
                height={56}
                sizes="56px"
                unoptimized
                className="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">{author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {author.role}
                </p>
              </div>
            </div>
          </div>

          <Card className="border-border/60 bg-background/80 p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Focus Areas
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button className="mt-6 w-full" asChild>
              <Link href="/scanner">Run an AI scan</Link>
            </Button>
          </Card>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border/60">
          <div className="relative h-72 w-full md:h-[420px]">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* AI Key Insights Summary Card (GEO Optimization) */}
        <div className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-8 backdrop-blur shadow-sm max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            AI Key Takeaways (GEO Summary)
          </div>
          <ul className="space-y-2 text-muted-foreground text-sm list-disc pl-5">
            {post.excerpt.split('. ').filter(Boolean).map((sentence, idx) => {
              const trimmed = sentence.trim();
              if (!trimmed) return null;
              const formatted = trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
              return (
                <li key={idx} className="leading-relaxed">{formatted}</li>
              );
            })}
          </ul>
        </div>

        <div className="mt-12 max-w-6xl mx-auto w-full">
          <article className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed text-muted-foreground prose-img:mx-auto prose-img:max-w-2xl prose-img:w-auto prose-img:rounded-2xl">
            {articleContent}
          </article>
        </div>

        <div className="mt-12 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-full">
              #{tag}
            </Badge>
          ))}
        </div>
      </section>

      <section className="container pb-16">
        <AdSenseAd adSlot={beforeRelatedSlot} />
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">More from the journal</h2>
          <Button variant="ghost" asChild>
            <Link href="/blog">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {relatedPosts.slice(0, 3).map((item) => (
            <Card
              key={item.slug}
              className="group flex h-full flex-col overflow-hidden border-border/60 bg-background/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col space-y-3 p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="rounded-full">
                    {item.category}
                  </Badge>
                  <span>{item.readTime}</span>
                </div>
                <h3 className="line-clamp-2 min-h-[2.75em] text-lg font-semibold leading-snug">
                  {item.title}
                </h3>
                <p className="line-clamp-3 min-h-[3.75em] text-sm text-muted-foreground">
                  {item.excerpt}
                </p>
                <Button variant="outline" className="mt-auto w-fit" asChild>
                  <Link href={`/blog/${item.slug}`}>
                    Read more <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
