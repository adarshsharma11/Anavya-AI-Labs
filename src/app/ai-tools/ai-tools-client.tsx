"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Crown, ScanLine, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tools = [
  {
    title: "AI Website Scanner",
    description:
      "Scan any site for performance, SEO, accessibility, and security issues. Get prioritized quick wins and a downloadable report.",
    href: "/scanner",
    icon: ScanLine,
    badge: "Free tool",
  },
  {
    title: "AI Competitor Comparison",
    description:
      "Compare your site against a competitor to spot SEO and performance gaps and get an action plan to catch up.",
    href: "/scanner?tab=competitor",
    icon: Crown,
    badge: "Benchmark",
  },
  {
    title: "SEO Opportunity Insights",
    description:
      "Turn scan findings into an SEO-friendly action list you can ship quickly with measurable impact.",
    href: "/scanner",
    icon: BarChart3,
    badge: "Action plan",
  },
] as const;

export default function AiToolsClient() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="container py-12 md:py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          AI Tools
        </div>
        <h1 className="mt-6 font-headline text-4xl font-bold tracking-tight sm:text-5xl">
          AI tools to improve SEO, speed, and conversions
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Run a scan, compare competitors, and get an actionable list of fixes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="shadow-lg shadow-primary/20">
            <Link href="/scanner">
              Open AI Website Scanner
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/services">Explore AI Services</Link>
          </Button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3"
      >
        {tools.map((tool) => (
          <motion.div key={tool.title} variants={cardVariants}>
            <Card className="flex h-full flex-col border-border/60 bg-background/80 shadow-lg backdrop-blur">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background/60">
                      <tool.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {tool.badge}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild className="w-full">
                  <Link href={tool.href}>Open tool</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
