import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import AboutClient from './about-client';
import { fetchAboutData, type AboutPageData } from "@/lib/api/about";

export const metadata: Metadata = MetaHead(pageMetadata.about);

export const revalidate = 300;

export default async function AboutPage() {
  let initialData: AboutPageData | null = null;

  try {
    initialData = await fetchAboutData({
      next: {
        revalidate,
      },
    });
  } catch (error) {
    console.error("Failed to fetch dynamic about page data, falling back to static default:", error);
    initialData = null;
  }

  return <AboutClient initialData={initialData ?? undefined} />;
}
