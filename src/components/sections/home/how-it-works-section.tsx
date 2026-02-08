"use client";

import { motion } from "framer-motion";
import { ScanLine, FileBarChart, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: ScanLine,
    title: "1. Scan Your URL",
    description:
      "Enter your website's URL and let our AI get to work. No code or setup required.",
  },
  {
    icon: FileBarChart,
    title: "2. Get Your Report",
    description:
      "Receive a detailed, easy-to-understand report with prioritized issues in minutes.",
  },
  {
    icon: Wrench,
    title: "3. Fix and Improve",
    description:
      "Follow our actionable recommendations to fix issues and watch your metrics improve.",
  },
];

export function HowItWorksSection() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Start improving your website in just three simple steps.
          </p>
        </div>
        <motion.div
          className="mt-16 grid gap-6 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          {steps.map((step) => (
            <motion.div key={step.title} variants={itemVariants}>
              <Card className="h-full border-border/60 bg-background/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
