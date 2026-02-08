"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const highlights = [
  { value: "120+", label: "Sites analyzed", detail: "Across SaaS, fintech, and retail." },
  { value: "4.9/5", label: "Client rating", detail: "Measured after every launch." },
  { value: "38%", label: "Avg. lift", detail: "Conversion wins within 90 days." },
];

const principles = [
  {
    title: "Human-first AI",
    description:
      "We automate the tedious parts, so teams can focus on the decisions that move the needle.",
  },
  {
    title: "Performance obsessed",
    description:
      "Speed budgets, strict accessibility checks, and measurable impact at every release.",
  },
  {
    title: "Design with intent",
    description:
      "Every screen is mapped to user intent with clear hierarchy and conversion flow.",
  },
];

const culture = [
  {
    title: "Small, senior squads",
    description:
      "You work with a tight team of senior builders who ship quickly and stay accountable.",
  },
  {
    title: "Transparent collaboration",
    description:
      "Weekly demos, shared dashboards, and candid advice on what to prioritize next.",
  },
  {
    title: "Always learning",
    description:
      "We test new models, frameworks, and UX patterns weekly to keep results modern.",
  },
];

export default function AboutClient() {
  const aboutImage = PlaceHolderImages.find((p) => p.id === "about-team");

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
              We turn AI insights into product momentum.
            </h1>
            <p className="text-lg text-muted-foreground">
              Anavya AI Labs helps ambitious teams deliver faster, more accessible
              web experiences. We blend AI diagnostics with human strategy to
              unlock real revenue wins, not just prettier dashboards.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="rounded-full px-4 py-2" variant="secondary">
                UX + AI Strategy
              </Badge>
              <Badge className="rounded-full px-4 py-2" variant="secondary">
                Performance Engineering
              </Badge>
              <Badge className="rounded-full px-4 py-2" variant="secondary">
                Conversion Design
              </Badge>
            </div>
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
            {aboutImage && (
              <Image
                src={aboutImage.imageUrl}
                alt={aboutImage.description}
                data-ai-hint={aboutImage.imageHint}
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
              The principles behind every engagement.
            </h2>
            <p className="text-muted-foreground">
              We combine AI diagnostics, product strategy, and performance
              engineering to build experiences that feel fast, intentional, and
              unmistakably modern.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {principles.map((item) => (
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

      <section className="container pb-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">
              How we like to work.
            </h2>
            <p className="text-muted-foreground">
              Our delivery model stays lean and senior. You get direct access to
              the people doing the work and the data behind every decision.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/portfolio">See recent work</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {culture.map((item) => (
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
