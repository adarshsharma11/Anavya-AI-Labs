"use client";

import { motion } from "framer-motion";
import { ScanLine, FileBarChart, Wrench } from "lucide-react";

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
    <section className="py-20 md:py-32">
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
          className="relative mt-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <div className="absolute left-1/2 top-4 -ml-px hidden h-full w-0.5 bg-border md:block" />
          <div className="space-y-12">
            {steps.map((step) => (
              <motion.div
                key={step.title}
                className="relative flex flex-col items-center text-center md:flex-row md:items-start md:text-left"
                variants={itemVariants}
              >
                <div className="absolute -left-6 top-1 hidden h-12 w-12 items-center justify-center rounded-full bg-background md:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="md:ml-12">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
