"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Gauge,
  Lightbulb,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Gauge,
    title: "Performance Audits",
    description:
      "Expose bottlenecks in LCP, CLS, and TTFB with a prioritized fix list.",
  },
  {
    icon: BarChart,
    title: "SEO Analysis",
    description:
      "Surface missing metadata, schema gaps, and content blockers in minutes.",
  },
  {
    icon: Lightbulb,
    title: "Accessibility Checks",
    description:
      "Catch contrast, ARIA, and keyboard issues before they ship.",
  },
  {
    icon: ShieldCheck,
    title: "Trust Signals",
    description:
      "Identify UX moments that damage credibility and lower conversion intent.",
  },
];

export function FeaturesSection() {
  const containerVariants = {
    hidden: {},
    visible: {
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
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-secondary/40 py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to improve your site
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            A modern audit stack that connects engineering fixes to business
            outcomes.
          </p>
        </div>
        <motion.div
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full border-border/60 bg-background/80 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
