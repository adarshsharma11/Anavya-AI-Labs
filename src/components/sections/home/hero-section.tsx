"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-28">
      <div className="animated-grid absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <div className="container">
        <motion.div
          className="mx-auto flex max-w-5xl flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Anavya AI Labs
            </div>
          </motion.div>

          <motion.h1
            className="mt-6 font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            variants={itemVariants}
          >
            AI that pinpoints exactly where your website leaks revenue.
          </motion.h1>

          <motion.p
            className="mt-6 text-lg leading-8 text-muted-foreground"
            variants={itemVariants}
          >
            Diagnose performance, UX, SEO, and accessibility in one scan. Then
            get a ranked action plan your team can ship within days.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            variants={itemVariants}
          >
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
              <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                <Link href="/scanner">
                  Run a free scan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
              <Button asChild variant="outline" size="lg">
                <Link href="/services">Explore services</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
            variants={itemVariants}
          >
            <Badge variant="secondary" className="rounded-full px-4 py-2">
              <Bot className="mr-2 h-4 w-4" />
              AI + Human strategy
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-2">
              120+ sites improved
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-2">
              Avg. 38% conversion lift
            </Badge>
          </motion.div>

          <motion.div
            className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
            variants={itemVariants}
          >
            <span className="rounded-full border border-border/60 bg-background/70 px-4 py-2">
              Scan in 60 seconds
            </span>
            <span className="rounded-full border border-border/60 bg-background/70 px-4 py-2">
              No credit card needed
            </span>
            <span className="rounded-full border border-border/60 bg-background/70 px-4 py-2">
              Action plan included
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
