"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getProfileApi } from "@/lib/api/dashboard";
import { resolvePostAuthPath } from "@/lib/auth/post-auth-path";
import { useRouter, usePathname } from "next/navigation";

interface UserProfile {
  id: number;
  email: string;
  name: string;
  username?: string;
  phoneNumber?: string;
  companyName?: string;
  companyLogoUrl?: string;
  role?: string;
}

const PROTECTED_ROUTES = [
  "/dashboard",
  "/admin",
];

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  fetchProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await getProfileApi();
      console.log(" [Auth] Profile response:", response);
      if (response && response.success && response.profile) {
        setUser(response.profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Protect routes
  useEffect(() => {
    console.log(" [Auth Guard] Checking state:", { isLoading, hasUser: !!user, pathname });
    if (isLoading) return;

    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");

    if (!user && isProtected) {
      console.log(" [Auth Guard] Unauthenticated on protected route. Redirecting to /login");
      router.replace("/login");
    } else if (user && pathname.startsWith("/admin") && user.role !== "admin") {
      router.replace("/login");
    } else if (user && isAuthPage) {
      const nextPath = resolvePostAuthPath(window.location.search);
      console.log(" [Auth Guard] Authenticated on auth page. Redirecting to", nextPath);
      router.replace(nextPath);
    }
  }, [isLoading, user, pathname, router]);

  const login = async (tokens: { accessToken: string; refreshToken: string }) => {
    console.log(" [Auth] Login started, tokens stored.");
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    
    await fetchProfile();
    
    const nextPath = resolvePostAuthPath(window.location.search);
    console.log(" [Auth] Profile fetched, navigating to", nextPath);
    router.replace(nextPath);
  };

  const logout = () => {
    console.log(" [Auth] Logging out...");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    router.replace("/");
  };

  // Determine if we should show a loading screen or nothing to prevent flicker
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // If we're on a protected route and don't have a user yet, don't render children
  // This prevents the "flash" of protected content
  const shouldHideContent =
    isProtected &&
    (isLoading || !user || (pathname.startsWith("/admin") && user.role !== "admin"));

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        fetchProfile,
      }}
    >
      {shouldHideContent ? (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
             <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="h-6 w-6 rounded-full bg-primary/10 animate-pulse" />
                </div>
             </div>
             <p className="text-sm font-medium animate-pulse text-muted-foreground">Authenticating...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
