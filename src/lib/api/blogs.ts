import { apiFetch } from "./client";
import type { BlogPost } from "@/types/api";

export type { BlogPost };

export const getBlogsApi = async () => {
  return apiFetch<{ success: boolean; data: BlogPost[] }>("/blogs", {
    method: "GET",
  });
};

export const getBlogBySlugApi = async (slug: string) => {
  return apiFetch<{ success: boolean; data: BlogPost }>(`/blogs/${slug}`, {
    method: "GET",
  });
};
