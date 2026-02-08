export type BlogCategory = "Engineering" | "Design" | "Growth" | "AI";

export type BlogAuthor = {
  name: string;
  role: string;
  avatar: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  date: string;
  readTime: string;
  image: string;
  author: BlogAuthor;
  tags: string[];
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "signal-over-noise",
    title: "Signal Over Noise: UX Patterns That Convert in 2026",
    excerpt:
      "How AI-led heuristics and human-led intent mapping can lift conversion without bloating the UI.",
    category: "Design",
    date: "Feb 3, 2026",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    author: {
      name: "Ariana Patel",
      role: "Head of Experience",
      avatar:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=200&q=80",
    },
    tags: ["UX", "Conversion", "Research"],
    content: [
      "Great conversion design is quiet. It removes friction without adding noise.",
      "We map intent first, then apply AI to rank which moments deserve visual emphasis.",
      "The best-performing flows rely on decisive hierarchy, not extra components.",
      "Treat every pixel as a cost. If it cannot answer a user question, it gets removed.",
    ],
  },
  {
    slug: "latency-advantage",
    title: "The Latency Advantage: Speed as a Growth Lever",
    excerpt:
      "A fast page is not just good engineering. It is a compounding growth channel.",
    category: "Engineering",
    date: "Jan 24, 2026",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=1600&q=80",
    author: {
      name: "Marco Liu",
      role: "Performance Lead",
      avatar:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=200&q=80",
    },
    tags: ["Performance", "Web", "Core Web Vitals"],
    content: [
      "Speed shapes perception. Users equate delays with unreliability.",
      "We treat performance budgets like product requirements.",
      "AI-assisted audits surface layout shifts before they hit production.",
      "The fastest teams instrument everything, then delete what is not essential.",
    ],
  },
  {
    slug: "ai-ops-playbook",
    title: "An AI Ops Playbook for Lean Product Teams",
    excerpt:
      "Build a lightweight AI operations loop that keeps models aligned with real user intent.",
    category: "AI",
    date: "Jan 9, 2026",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1600&q=80",
    author: {
      name: "Dylan Moore",
      role: "Applied AI Lead",
      avatar:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=200&q=80",
    },
    tags: ["AI", "Ops", "Playbooks"],
    content: [
      "Teams win when AI is treated as an evolving system, not a static feature.",
      "Build feedback hooks into every prompt and surface drift in real time.",
      "Pair quantitative signals with weekly qualitative reviews.",
      "Small, consistent improvements beat big, unstable launches.",
    ],
  },
  {
    slug: "accessibility-as-product",
    title: "Accessibility as Product Strategy",
    excerpt:
      "Inclusive design is a brand decision. The best products build for everyone by default.",
    category: "Growth",
    date: "Dec 18, 2025",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=1600&q=80",
    author: {
      name: "Maya Singh",
      role: "Product Strategist",
      avatar:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=200&q=80",
    },
    tags: ["Accessibility", "Brand", "Strategy"],
    content: [
      "Accessibility is not a checklist; it is a competitive edge.",
      "Better contrast and structure also reduce customer support burden.",
      "We align inclusive UX with measurable product outcomes.",
      "Designing for everyone expands your addressable market.",
    ],
  },
];

export const featuredPost = blogPosts[0];
