"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  return <>{children}</>;
}
