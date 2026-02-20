import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

const serviceCtaSchema = z
  .object({
    label: z.string(),
    href: z.string(),
  })
  .nullable()
  .optional();

const servicesPageSchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string(),
  createdAt: z.string(),
});

const serviceSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  cta: serviceCtaSchema,
  createdAt: z.string(),
});

const servicesResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    page: servicesPageSchema,
    services: z.array(serviceSchema),
  }),
});

export type ServicesPage = z.infer<typeof servicesPageSchema>;
export type ServiceItem = z.infer<typeof serviceSchema>;

export type ServicesPayload = {
  page: ServicesPage;
  services: ServiceItem[];
};

export async function fetchServices(options?: {
  signal?: AbortSignal;
  cache?: RequestCache;
  next?: {
    revalidate?: number;
  };
}): Promise<ServicesPayload> {
  const data = await apiFetch<unknown>("/services", {
    method: "GET",
    signal: options?.signal,
    cache: options?.cache,
    next: options?.next,
  });

  const parsed = servicesResponseSchema.safeParse(data);
  if (!parsed.success || !parsed.data.success) {
    throw new Error("Invalid services response.");
  }

  return parsed.data.data;
}

