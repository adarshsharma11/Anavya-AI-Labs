"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
import { fetchPricingPlans, type PricingPlan } from "@/lib/api/pricing";

export default function PricingClient({
  initialPlans = [],
}: {
  initialPlans?: PricingPlan[];
}) {
  const checkoutLink = process.env.NEXT_PUBLIC_STRIPE_REPORT_LINK;
  const { data, isLoading, error } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: () => fetchPricingPlans(),
    initialData: initialPlans,
    staleTime: 60_000,
    refetchOnMount: true,
  });

  const plans = data ?? initialPlans ?? [];

  const activePlans = plans
    .filter((plan) => plan.active)
    .sort((a, b) => a.id - b.id);

  const formatPrice = (price: number) =>
    Number.isInteger(price) ? price.toString() : price.toFixed(2);

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
          Choose a one-time report or go unlimited when you need it.
        </p>
      </div>

      <motion.div
        className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`pricing-skeleton-${index}`}
              className="h-[420px] animate-pulse border-border/60 bg-background/60"
            />
          ))}

        {!isLoading && error && plans.length === 0 && (
          <Card className="col-span-full border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
            {(error as Error).message ?? "Unable to load pricing."}
          </Card>
        )}

        {!isLoading &&
          !error &&
          activePlans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <Card
                className={cn(
                  "flex h-full flex-col border-border/60 bg-background/80 shadow-sm",
                  plan.isHighlighted && "border-primary ring-2 ring-primary"
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
                      <span className="text-4xl font-bold">
                        ${formatPrice(plan.price)}
                      </span>
                      <span className="text-muted-foreground">/{plan.cadence}</span>
                      {plan.compareAtPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${formatPrice(plan.compareAtPrice)}
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
                    variant={plan.isHighlighted ? "default" : "outline"}
                    asChild={plan.type === "one_time" && !!checkoutLink}
                  >
                    {plan.type === "one_time" && checkoutLink ? (
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
