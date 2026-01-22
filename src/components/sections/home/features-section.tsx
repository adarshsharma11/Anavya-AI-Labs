"use client";

import { motion } from "framer-motion";
import { BarChart, Gauge, Lightbulb, type LucideIcon } from "lucide-react";
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
      "Identify bottlenecks slowing down your site. We analyze loading times, image optimization, and rendering paths.",
  },
  {
    icon: BarChart,
    title: "SEO Analysis",
    description:
      "Uncover SEO issues hurting your ranking. From meta tags to structured data, we check it all.",
  },
  {
    icon: Lightbulb,
    title: "Accessibility Checks",
    description:
      "Ensure your website is usable by everyone. Our scanner checks for ARIA compliance, color contrast, and more.",
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
    <section className="bg-secondary/50 py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to improve your site
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Our AI-powered scanner delves deep into your website's code to find
            what's holding you back.
          </p>
        </div>
        <motion.div
          className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
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
