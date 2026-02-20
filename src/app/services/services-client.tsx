"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  Code,
  Palette,
  Rocket,
  ShieldCheck,
  Smartphone,
  Server,
  Bot,
  BrainCircuit,
  Share2,
  Wand2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchServices, type ServicesPayload } from "@/lib/api/services";

const iconMap = {
  Bot,
  BrainCircuit,
  Share2,
  Wand2,
  Code,
  Smartphone,
  Palette,
  Rocket,
  Server,
  ShieldCheck,
} as const;

type IconKey = keyof typeof iconMap;

const fallbackData: ServicesPayload = {
  page: {
    id: 0,
    title: "AI Services",
    subtitle:
      "We offer a wide range of services to help you build and grow your digital product.",
    createdAt: new Date(0).toISOString(),
  },
  services: [
    {
      id: 1,
      slug: "ai-chatbot-development",
      title: "AI Chatbot Development",
      description:
        "We build intelligent, conversational AI chatbots to automate customer support, generate leads, and enhance user engagement.",
      icon: "Bot",
      cta: {
        label: "Get a quote",
        href: "/pricing",
      },
      createdAt: new Date(0).toISOString(),
    },
    {
      id: 2,
      slug: "custom-ai-solutions",
      title: "Custom AI Solutions",
      description:
        "Leverage the power of machine learning and AI with custom models and solutions tailored to your specific business challenges.",
      icon: "BrainCircuit",
      cta: {
        label: "Talk to us",
        href: "/about",
      },
      createdAt: new Date(0).toISOString(),
    },
    {
      id: 3,
      slug: "ai-api-integration",
      title: "AI API Integration",
      description:
        "We integrate powerful AI APIs into your existing applications to add features like image recognition, natural language processing, and more.",
      icon: "Share2",
      cta: {
        label: "Explore services",
        href: "/services",
      },
      createdAt: new Date(0).toISOString(),
    },
    {
      id: 4,
      slug: "prompt-optimization",
      title: "Prompt Optimization",
      description:
        "Craft and refine the perfect prompts to get the most accurate and powerful responses from your large language models.",
      icon: "Wand2",
      cta: {
        label: "See pricing",
        href: "/pricing",
      },
      createdAt: new Date(0).toISOString(),
    },
    {
      id: 5,
      slug: "web-app-development",
      title: "Web App Development",
      description:
        "We build high-performance, scalable, and secure web applications tailored to your business needs using the latest technologies.",
      icon: "Code",
      cta: {
        label: "Start project",
        href: "/about",
      },
      createdAt: new Date(0).toISOString(),
    },
    {
      id: 6,
      slug: "mobile-app-development",
      title: "Mobile App Development",
      description:
        "Engage your users on the go with beautiful and intuitive mobile apps for both iOS and Android platforms.",
      icon: "Smartphone",
      cta: {
        label: "Request demo",
        href: "/about",
      },
      createdAt: new Date(0).toISOString(),
    },
    {
      id: 7,
      slug: "ui-ux-design",
      title: "UI/UX Design",
      description:
        "Our design team creates stunning and user-friendly interfaces that provide an exceptional user experience and drive engagement.",
      icon: "Palette",
      cta: {
        label: "View work",
        href: "/portfolio",
      },
      createdAt: new Date(0).toISOString(),
    },
    {
      id: 8,
      slug: "performance-optimization",
      title: "Performance Optimization",
      description:
        "We'll fine-tune your application to ensure it's lightning-fast, providing a smooth experience for your users.",
      icon: "Rocket",
      cta: {
        label: "Run a scan",
        href: "/scanner",
      },
      createdAt: new Date(0).toISOString(),
    },
    {
      id: 9,
      slug: "cloud-devops",
      title: "Cloud & DevOps",
      description:
        "Automate your infrastructure and deployments with our DevOps expertise, ensuring reliability and scalability.",
      icon: "Server",
      cta: {
        label: "Talk to us",
        href: "/about",
      },
      createdAt: new Date(0).toISOString(),
    },
    {
      id: 10,
      slug: "security-compliance",
      title: "Security & Compliance",
      description:
        "Protect your application and user data with our comprehensive security audits and implementation of best practices.",
      icon: "ShieldCheck",
      cta: {
        label: "See pricing",
        href: "/pricing",
      },
      createdAt: new Date(0).toISOString(),
    },
  ],
};

export default function ServicesClient({
  initialData,
}: {
  initialData?: ServicesPayload;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["services"],
    queryFn: () => fetchServices(),
    initialData,
    staleTime: 300_000,
    refetchOnMount: true,
  });

  const resolved = data ?? initialData ?? fallbackData;
  const page = resolved.page;
  const services = resolved.services;

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => a.id - b.id),
    [services]
  );
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
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
          {page.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {page.subtitle}
        </p>
      </div>

      <motion.div
        className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {!isLoading && error && sortedServices.length === 0 ? (
          <Card className="col-span-full border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
            {(error as Error).message ?? "Unable to load services."}
          </Card>
        ) : null}

        {sortedServices.map((service) => {
          const iconKey = service.icon as IconKey;
          const Icon = iconMap[iconKey] ?? Code;

          return (
          <motion.div
            key={service.slug ?? `${service.id}`}
            variants={cardVariants}
            whileHover={{
              y: -8,
              boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
              transition: { duration: 0.2 },
            }}
          >
            <Card className="flex h-full flex-col text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <CardDescription>{service.description}</CardDescription>
                {service.cta ? (
                  <Button asChild variant="outline" className="mt-6 w-full">
                    <Link href={service.cta.href}>{service.cta.label}</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
