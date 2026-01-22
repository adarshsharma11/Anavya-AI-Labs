"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="animated-grid absolute inset-0 -z-10" />

      <div className="container">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Bot className="h-4 w-4" />
              <span>Powered by Gemini AI</span>
            </div>
          </motion.div>

          <motion.h1
            className="mt-6 font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            variants={itemVariants}
          >
            AI that finds what’s costing your website{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              customers
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg leading-8 text-muted-foreground"
            variants={itemVariants}
          >
            anavyaailabs.com scans your website for critical issues in performance,
            SEO, and accessibility, providing actionable insights to boost your
            conversions.
          </motion.p>

          <motion.div
            className="mt-10 flex items-center justify-center gap-x-6"
            variants={itemVariants}
          >
            <Button asChild size="lg">
              <Link href="/scanner">
                Scan Your Website Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
