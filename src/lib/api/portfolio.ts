import { apiFetch } from "./client";

export interface PortfolioItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  imageUrl: string | null;
  imageHint: string | null;
  imageKey: string;
}

export const getPortfolioApi = async () => {
  return await apiFetch<{ success: boolean; data: PortfolioItem[] }>("/portfolio", {
    method: "GET",
  });
};

export const getPortfolioBySlugApi = async (slug: string) => {
  return await apiFetch<{ success: boolean; data: PortfolioItem }>(`/portfolio/${slug}`, {
    method: "GET",
  });
};
