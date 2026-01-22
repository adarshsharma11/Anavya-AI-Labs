"use client";

import { motion } from "framer-motion";
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
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    icon: Bot,
    title: "AI Chatbot Development",
    description:
      "We build intelligent, conversational AI chatbots to automate customer support, generate leads, and enhance user engagement.",
  },
  {
    icon: BrainCircuit,
    title: "Custom AI Solutions",
    description:
      "Leverage the power of machine learning and AI with custom models and solutions tailored to your specific business challenges.",
  },
  {
    icon: Share2,
    title: "AI API Integration",
    description:
      "We integrate powerful AI APIs into your existing applications to add features like image recognition, natural language processing, and more.",
  },
  {
    icon: Wand2,
    title: "Prompt Optimization",
    description:
      "Craft and refine the perfect prompts to get the most accurate and powerful responses from your large language models.",
  },
  {
    icon: Code,
    title: "Web App Development",
    description:
      "We build high-performance, scalable, and secure web applications tailored to your business needs using the latest technologies.",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description:
      "Engage your users on the go with beautiful and intuitive mobile apps for both iOS and Android platforms.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description:
      "Our design team creates stunning and user-friendly interfaces that provide an exceptional user experience and drive engagement.",
  },
  {
    icon: Rocket,
    title: "Performance Optimization",
    description:
      "We'll fine-tune your application to ensure it's lightning-fast, providing a smooth experience for your users.",
  },
  {
    icon: Server,
    title: "Cloud & DevOps",
    description:
      "Automate your infrastructure and deployments with our DevOps expertise, ensuring reliability and scalability.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Compliance",
    description:
      "Protect your application and user data with our comprehensive security audits and implementation of best practices.",
  },
];

export default function ServicesPage() {
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
          Our Services
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We offer a wide range of services to help you build and grow your
          digital product.
        </p>
      </div>

      <motion.div
        className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            variants={cardVariants}
            whileHover={{
              y: -8,
              boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
              transition: { duration: 0.2 },
            }}
          >
            <Card className="h-full text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <service.icon className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
