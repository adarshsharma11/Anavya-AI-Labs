import { apiFetch } from "./client";
import type { AuthTokens, ForgotPasswordResponse } from "@/types/api";

export const signupApi = async (body: {
  readonly email: string;
  readonly password: string;
  readonly name?: string;
}) => {
  return apiFetch<{ success: boolean; message?: string } & Partial<AuthTokens>>(
    "/auth/signup",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
};

export const loginApi = async (body: {
  readonly email: string;
  readonly password: string;
}) => {
  return apiFetch<{
    success: boolean;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const forgotPasswordApi = async (email: string) => {
  return apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPasswordApi = async (body: {
  readonly email?: string;
  readonly token?: string;
  readonly otp?: string;
  readonly password?: string;
  readonly newPassword?: string;
}) => {
  return apiFetch<{ success: boolean; message?: string }>(
    "/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
};

export const refreshTokenApi = async (refreshToken: string) => {
  return apiFetch<AuthTokens>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    skipAuthInterceptor: true,
  });
};
