"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

export default function PortfolioClient() {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const portfolioItems = [
    {
      id: "portfolio-1",
      title: "E-commerce Platform",
      summary:
        "A headless storefront with real-time inventory, curated bundles, and rapid checkout.",
      tags: ["E-commerce", "UX", "Performance"],
    },
    {
      id: "portfolio-2",
      title: "SaaS Growth Dashboard",
      summary:
        "An analytics command center that turns churn signals into weekly retention wins.",
      tags: ["SaaS", "Analytics", "B2B"],
    },
    {
      id: "portfolio-3",
      title: "Mobile Banking App",
      summary:
        "A secure mobile experience redesigned for speed, trust, and instant onboarding.",
      tags: ["Fintech", "Mobile", "Security"],
    },
    {
      id: "portfolio-4",
      title: "AI Support Chatbot",
      summary:
        "A GPT-powered support assistant that deflects 42% of tickets in week one.",
      tags: ["Chatbot", "AI", "Support"],
    },
    {
      id: "portfolio-5",
      title: "Conversational Commerce",
      summary:
        "A guided shopping flow that turns product discovery into real-time conversations.",
      tags: ["Commerce", "Conversation", "Growth"],
    },
    {
      id: "portfolio-6",
      title: "Knowledge Base Assistant",
      summary:
        "An internal assistant that answers policy and process questions instantly.",
      tags: ["AI", "Knowledge", "Ops"],
    },
  ];

  const imageMap = new Map(
    PlaceHolderImages.map((image) => [image.id, image])
  );

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
          Our Work
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Check out some of the amazing projects we&apos;ve delivered for our
          clients.
        </p>
      </div>

      <motion.div
        className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        initial="initial"
        animate="in"
        transition={{ staggerChildren: 0.2 }}
      >
        {portfolioItems.map((project) => {
          const image = imageMap.get(project.id);
          if (!image) {
            return null;
          }

          return (
          <motion.div
            key={project.id}
            variants={{
              initial: { opacity: 0, y: 20 },
              in: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                },
              },
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="flex h-full flex-col overflow-hidden">
              <div className="relative h-56 w-full">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  data-ai-hint={image.imageHint}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="font-headline">
                  {project.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  {project.summary}
                </CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                <Button variant="outline" asChild>
                  <Link href="/case-study">
                    View Case Study <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
