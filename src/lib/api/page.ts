import { apiFetch } from "./client";

export interface PageContent {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  content: string; // JSON or HTML
  metaTitle: string;
  metaDescription: string;
  sections: any; // Flexible JSON for different page types
  updatedAt: string;
}

export const fetchPageBySlug = async (slug: string) => {
  return await apiFetch<{ success: boolean; data: PageContent }>(`/page?slug=${slug}`, {
    method: "GET",
  });
};
