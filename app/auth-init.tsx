"use client";

import { useEffect } from "react";
import { authApi } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";

export function AuthInit({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const initialized = useAuthStore((state) => state.initialized);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authApi.getCurrentUser();
        setAuth(user);
        queryClient.setQueryData(["currentUser"], user);
      } catch {
        clearAuth();
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [setAuth, clearAuth, setInitialized, queryClient]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
