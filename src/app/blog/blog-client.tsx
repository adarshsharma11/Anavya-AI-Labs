"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { blogPosts, featuredPost } from "@/lib/blog-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categories = ["All", "Design", "Engineering", "AI", "Growth"] as const;

export default function BlogClient() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <section className="container py-12 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Anavya AI Labs Journal
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Ideas for building faster, smarter, more human products.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Field notes from AI operators, product strategists, and performance
            engineers. Practical, sharp, and built for the teams shipping now.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === "All" ? "default" : "secondary"}
                className="rounded-full px-4 py-2 text-sm"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <Card className="relative overflow-hidden border-border/60 bg-background/80 shadow-lg backdrop-blur">
            <div className="relative h-64 w-full md:h-80">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="secondary" className="rounded-full">
                  {featuredPost.category}
                </Badge>
                <span>{featuredPost.date}</span>
                <span>{featuredPost.readTime}</span>
              </div>
              <CardTitle className="text-2xl leading-tight md:text-3xl">
                {featuredPost.title}
              </CardTitle>
              <p className="text-base text-muted-foreground">
                {featuredPost.excerpt}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Image
                  src={featuredPost.author.avatar}
                  alt={featuredPost.author.name}
                  width={44}
                  height={44}
                  sizes="44px"
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">
                    {featuredPost.author.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {featuredPost.author.role}
                  </p>
                </div>
              </div>
              <Button asChild className="w-fit">
                <Link href={`/blog/${featuredPost.slug}`}>
                  Read the feature <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {blogPosts.slice(1, 4).map((post) => (
              <Card
                key={post.slug}
                className="group flex flex-col gap-4 border-border/60 bg-background/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="secondary" className="rounded-full">
                    {post.category}
                  </Badge>
                  <span>{post.readTime}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                </div>
                <Button variant="ghost" className="w-fit px-0" asChild>
                  <Link href={`/blog/${post.slug}`}>
                    Read story <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Card
              key={post.slug}
              className="group overflow-hidden border-border/60 bg-background/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44 w-full">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="rounded-full">
                    {post.category}
                  </Badge>
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <CardTitle className="text-xl leading-snug">
                  {post.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
              </CardHeader>
              <CardContent className="pb-6">
                <Button variant="outline" asChild>
                  <Link href={`/blog/${post.slug}`}>
                    Explore article <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 rounded-3xl border border-border/60 bg-gradient-to-br from-foreground/5 via-background to-background p-10 shadow-lg md:p-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight">
                Ready for sharper insights every week?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Join the monthly field report. We share product teardown notes,
                AI experiments, and the performance wins that matter most.
              </p>
            </div>
            <Button asChild size="lg" className="w-fit">
              <Link href="/scanner">Get the free scan</Link>
            </Button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
