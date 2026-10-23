import { apiFetch } from "./client";
import type {
  AdminRevenue,
  ApiEnvelope,
  BlogPost,
  GeoLead,
} from "@/types/api";

// Global analytics & user management
export const getAdminAnalyticsApi = async () => {
  return await apiFetch<any>("/admin/analytics", {
    method: "GET",
  });
};

export const getAdminUsersApi = async () => {
  return await apiFetch<any>("/admin/users", {
    method: "GET",
  });
};

export const deleteAdminUserApi = async (id: number) => {
  return await apiFetch<any>(`/admin/users/${id}`, {
    method: "DELETE",
  });
};

// Contact Form Request Management
export const getContactsApi = async () => {
  return await apiFetch<any>("/contact", {
    method: "GET",
  });
};

export const updateContactStatusApi = async (id: number, status: string) => {
  return await apiFetch<any>(`/contact/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

export const deleteContactApi = async (id: number) => {
  return await apiFetch<any>(`/contact/${id}`, {
    method: "DELETE",
  });
};

// Blog Management CRUD
export const createBlogApi = async (body: any) => {
  return await apiFetch<any>("/blogs", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const updateBlogApi = async (slug: string, body: any) => {
  return await apiFetch<any>(`/blogs/${slug}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const deleteBlogApi = async (slug: string) => {
  return await apiFetch<any>(`/blogs/${slug}`, {
    method: "DELETE",
  });
};

// Services Management CRUD
export const createServiceApi = async (body: any) => {
  return await apiFetch<any>("/services", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const updateServiceApi = async (id: number, body: any) => {
  return await apiFetch<any>(`/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const deleteServiceApi = async (id: number) => {
  return await apiFetch<any>(`/services/${id}`, {
    method: "DELETE",
  });
};

// Portfolio Management CRUD
export const createPortfolioApi = async (body: any) => {
  return await apiFetch<any>("/portfolio", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const updatePortfolioApi = async (slug: string, body: any) => {
  return await apiFetch<any>(`/portfolio/${slug}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const deletePortfolioApi = async (slug: string) => {
  return await apiFetch<any>(`/portfolio/${slug}`, {
    method: "DELETE",
  });
};

// About Page Customization
export const updateAboutApi = async (body: any) => {
  return await apiFetch<any>("/about", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const getAdminRevenueApi = async () => {
  return apiFetch<ApiEnvelope<AdminRevenue>>("/admin/revenue");
};

export const getAdminScansApi = async () => {
  return apiFetch<ApiEnvelope<unknown[]>>("/admin/scans");
};

export const regenerateAdminScanApi = async (id: number) => {
  return apiFetch<ApiEnvelope<unknown>>(`/admin/scans/${id}/regenerate`, {
    method: "POST",
  });
};

export const getAdminGeoLeadsApi = async (limit = 100) => {
  return apiFetch<ApiEnvelope<readonly GeoLead[]>>(
    `/admin/geo-leads?limit=${limit}`
  );
};

export const getAdminBlogsApi = async () => {
  return apiFetch<ApiEnvelope<readonly BlogPost[]>>("/admin/blogs");
};

export const updateSiteSettingsApi = async (body: Record<string, string>) => {
  return apiFetch<ApiEnvelope<Record<string, string>>>("/settings", {
    method: "POST",
    body: JSON.stringify(body),
  });
};
