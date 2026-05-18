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

import { type PortfolioItem } from "@/lib/api/portfolio";

export default function PortfolioClient({ initialItems = [] }: { initialItems?: PortfolioItem[] }) {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

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

      {initialItems.length === 0 ? (
        <section className="container py-24 text-center">
          <h2 className="text-3xl font-bold">No portfolio items found.</h2>
          <p className="mt-4 text-muted-foreground">Check back later to see our recent work.</p>
          <Button asChild className="mt-8">
            <Link href="/">Return Home</Link>
          </Button>
        </section>
      ) : (
        <motion.div
          className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          initial="initial"
          animate="in"
          transition={{ staggerChildren: 0.2 }}
        >
          {initialItems.map((project) => {
            const imageUrl = project.imageUrl || imageMap.get(project.imageKey)?.imageUrl;
            const imageHint = project.imageHint || imageMap.get(project.imageKey)?.imageHint || "portfolio project";

            if (!imageUrl) {
              return null;
            }

            return (
              <motion.div
                key={project.id || project.slug}
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
                      src={imageUrl}
                      alt={imageHint}
                      data-ai-hint={imageHint}
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
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
