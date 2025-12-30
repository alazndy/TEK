"use client";

import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (!user.role || !allowedRoles.includes(user.role)) {
        router.push("/unauthorized"); // Create this page later or redirect to dashboard
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return null; // or loading/unauthorized message
  }

  return <>{children}</>;
}
