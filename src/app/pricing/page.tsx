"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Get a basic scan of your website to identify critical issues.",
    features: [
      "1 Scan per month",
      "Basic performance check",
      "Basic SEO check",
      "Basic accessibility check",
    ],
    cta: "Start for Free",
  },
  {
    name: "Pro",
    price: { monthly: 49, yearly: 490 },
    description:
      "For professionals who need to dig deeper and monitor their sites.",
    features: [
      "Unlimited scans",
      "Advanced performance analysis",
      "Full SEO audit",
      "Comprehensive accessibility report",
      "Historical data",
      "Email support",
    ],
    cta: "Get Started with Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: { monthly: null, yearly: null },
    description:
      "For businesses that need custom solutions and premium support.",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "API access",
      "Dedicated account manager",
      "Priority support",
    ],
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
      className="container py-12 md:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that's right for you.
        </p>
      </div>

      <div className="mt-10 flex items-center justify-center space-x-4">
        <Label htmlFor="billing-cycle">Monthly</Label>
        <Switch
          id="billing-cycle"
          checked={billingCycle === "yearly"}
          onCheckedChange={(checked) =>
            setBillingCycle(checked ? "yearly" : "monthly")
          }
        />
        <Label htmlFor="billing-cycle">Yearly (Save 20%)</Label>
      </div>

      <motion.div
        className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3"
        initial="initial"
        animate="in"
        transition={{ staggerChildren: 0.2 }}
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card
              className={cn(
                "flex h-full flex-col",
                plan.highlighted && "border-primary ring-2 ring-primary"
              )}
            >
              <CardHeader>
                <CardTitle className="font-headline">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  {plan.price.monthly !== null ? (
                    <>
                      <span className="text-4xl font-bold">
                        $
                        {billingCycle === "monthly"
                          ? plan.price.monthly
                          : Math.round(plan.price.yearly / 12)}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                      {billingCycle === "yearly" && plan.price.yearly && (
                        <p className="text-sm text-muted-foreground">
                          Billed as ${plan.price.yearly} per year
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-3xl font-bold">Custom</span>
                  )}
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
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
