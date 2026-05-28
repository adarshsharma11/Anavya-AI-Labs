"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchAboutData, type AboutPageData } from "@/lib/api/about";

const formatHighlightValue = (value: string) => {
  const num = Number(value);
  if (!isNaN(num) && Number.isInteger(num)) {
    if (num >= 10) {
      return `${Math.floor(num / 10) * 10}+`;
    }
    return `${num}+`;
  }
  return value;
};

export default function AboutClient({ initialData }: { initialData?: AboutPageData }) {
  const { data } = useQuery({
    queryKey: ["about-data"],
    queryFn: () => fetchAboutData(),
    initialData,
    staleTime: 300_000,
    refetchOnMount: true,
  });

  const resolved = data ?? initialData;

  // Render a simple skeleton/loading state if resolved data is missing
  if (!resolved) {
    return (
      <div className="container py-12 md:py-24 space-y-8">
        <div className="h-12 w-1/3 animate-pulse bg-muted rounded-xl" />
        <div className="h-48 w-full animate-pulse bg-muted rounded-3xl" />
      </div>
    );
  }

  const title = resolved.title;
  const description = resolved.description;
  const badges = resolved.badges ?? [];
  const imageUrl = resolved.imageUrl;
  const imageHint = resolved.imageHint ?? "team collaboration";
  const principlesData = resolved.principles ?? [];
  const cultureData = resolved.culture ?? [];
  
  const principlesTitle = resolved.principlesTitle || "The principles behind every engagement.";
  const principlesDescription = resolved.principlesDescription || "We combine AI diagnostics, product strategy, and performance engineering to build experiences that feel fast, intentional, and unmistakably modern.";
  const cultureTitle = resolved.cultureTitle || "How we like to work.";
  const cultureDescription = resolved.cultureDescription || "Our delivery model stays lean and senior. You get direct access to the people doing the work and the data behind every decision.";

  const highlights = (resolved.highlights ?? []).map(item => ({
    ...item,
    value: formatHighlightValue(item.value)
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <section className="container py-12 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              About Anavya AI Labs
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {description}
            </p>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge, idx) => (
                <Badge key={idx} className="rounded-full px-4 py-2" variant="secondary">
                  {badge}
                </Badge>
              ))}
            </div>
            
            {/* 1. Specific section that must remain exactly as it is */}
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/scanner">
                  Run a free scan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/services">Explore services</Link>
              </Button>
            </div>
          </div>

          <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-border/60 shadow-lg md:h-[420px]">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={imageHint}
                data-ai-hint={imageHint}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            )}
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <Card
              key={item.label}
              className="border-border/60 bg-background/80 p-6 shadow-sm"
            >
              <p className="text-3xl font-semibold">{item.value}</p>
              <p className="mt-2 text-sm font-semibold">{item.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.detail}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container pb-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              {principlesTitle}
            </h2>
            <p className="text-muted-foreground">
              {principlesDescription}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {principlesData.map((item) => (
              <Card
                key={item.title}
                className="border-border/60 bg-background/80 p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Specific section that must remain exactly as it is */}
      <section className="container pb-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">
              {cultureTitle}
            </h2>
            <p className="text-muted-foreground">
              {cultureDescription}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/portfolio">See recent work</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cultureData.map((item) => (
            <Card
              key={item.title}
              className="border-border/60 bg-background/80 p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
