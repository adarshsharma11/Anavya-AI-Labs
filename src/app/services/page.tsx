import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import ServicesClient from './services-client';
import { fetchServices, type ServicesPayload } from "@/lib/api/services";

export const metadata: Metadata = MetaHead(pageMetadata.services);

export const revalidate = 300;

export default async function ServicesPage() {
  let initialData: ServicesPayload | null = null;

  try {
    initialData = await fetchServices({
      next: {
        revalidate,
      },
    });
  } catch {
    initialData = null;
  }

  return <ServicesClient initialData={initialData ?? undefined} />;
}
