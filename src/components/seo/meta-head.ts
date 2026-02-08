import type { Metadata } from "next";
import { createPageMetadata } from "@/config/site";

type MetaHeadInput = {
  title: string;
  description: string;
  canonical: `/${string}` | "/";
  image?: string;
};

export function MetaHead({
  title,
  description,
  canonical,
  image,
}: MetaHeadInput): Metadata {
  const base = createPageMetadata({ title, description, canonical });

  if (!image) {
    return base;
  }

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [{ url: image }],
    },
    twitter: {
      ...base.twitter,
      card: "summary_large_image",
      images: [image],
    },
  };
}
