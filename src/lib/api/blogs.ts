import { apiFetch } from "./client";

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  image: string;
  category: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  readTime: string;
  date: string;
  tags: string[];
  createdAt: string;
}

export const getBlogsApi = async () => {
  return await apiFetch<{ success: boolean; data: BlogPost[] }>("/blogs", {
    method: "GET",
  });
};

export const getBlogBySlugApi = async (slug: string) => {
  return await apiFetch<{ success: boolean; data: BlogPost }>(`/blogs/${slug}`, {
    method: "GET",
  });
};
