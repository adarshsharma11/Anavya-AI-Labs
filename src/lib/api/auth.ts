import { apiFetch } from "./client";

export const signupApi = async (body: any) => {
  return await apiFetch<any>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const verifyOtpApi = async (email: string, otp: string) => {
  return await apiFetch<any>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
};

export const loginApi = async (body: any) => {
  return await apiFetch<any>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const forgotPasswordApi = async (email: string) => {
  return await apiFetch<any>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPasswordApi = async (body: any) => {
  return await apiFetch<any>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const refreshTokenApi = async (refreshToken: string) => {
  // Use a simple fetch or a flag to avoid recursion if apiFetch is used
  // Or just call apiFetch with a path that bypasses the 401 interceptor logic if we add a flag
  return await apiFetch<any>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    // @ts-ignore - custom property to skip 401 interceptor to avoid loops
    skipAuthInterceptor: true,
  });
};
