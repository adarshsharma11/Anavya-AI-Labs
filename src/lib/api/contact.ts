import { apiFetch } from "./client";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const submitContact = async (data: ContactFormData): Promise<ContactResponse> => {
  return await apiFetch<ContactResponse>("/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const fetchContacts = async (): Promise<{ success: boolean; data: any[] }> => {
  return await apiFetch<{ success: boolean; data: any[] }>("/contact", {
    method: "GET",
  });
};
