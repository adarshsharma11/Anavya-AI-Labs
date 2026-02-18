"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "0",
    cadence: "first scan",
    description: "Get a baseline scan to see immediate issues and quick wins.",
    features: [
      "1 full scan included",
      "Performance + SEO + accessibility",
      "Shareable summary report",
      "Action checklist",
    ],
    cta: "Start Free",
  },
  {
    name: "Full Report",
    price: "2.99",
    cadence: "per report",
    description:
      "Unlock the complete AI audit report and download it instantly.",
    features: [
      "Full issue breakdown",
      "AI recommendations",
      "Downloadable report",
      "Premium insights",
    ],
    cta: "Unlock Report",
    highlighted: true,
    badge: "Save $2.01",
    compareAt: "5.00",
  },
  {
    name: "Pro Monthly",
    price: "49",
    cadence: "per month",
    description:
      "Unlimited scans and monitoring for teams shipping every week.",
    features: [
      "Unlimited scans",
      "Historical trend tracking",
      "Advanced performance insights",
      "Email + Slack alerts",
    ],
    cta: "Go Pro",
  },
];

export default function PricingClient() {
  const checkoutLink = process.env.NEXT_PUBLIC_STRIPE_REPORT_LINK;
  const cardVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-12 md:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
          Pricing that matches how you scan.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose a one-time scan pack or go unlimited when you need it.
        </p>
      </div>

      <motion.div
        className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <Card
              className={cn(
                "flex h-full flex-col border-border/60 bg-background/80 shadow-sm",
                plan.highlighted && "border-primary ring-2 ring-primary"
              )}
            >
              <CardHeader className="space-y-3">
                {plan.badge && (
                  <Badge className="w-fit rounded-full">{plan.badge}</Badge>
                )}
                <CardTitle className="font-headline">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.cadence}</span>
                    {"compareAt" in plan && plan.compareAt && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${plan.compareAt}
                      </span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild={plan.name === "Full Report" && !!checkoutLink}
                >
                  {plan.name === "Full Report" && checkoutLink ? (
                    <a href={checkoutLink} rel="noreferrer">
                      {plan.cta}
                    </a>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

 
    </motion.div>
  );
}
