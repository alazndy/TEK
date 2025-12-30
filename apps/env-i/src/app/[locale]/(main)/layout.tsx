
"use client"

import * as React from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useDataStore } from "@/stores/data-store";
import { Header } from "@/components/layout/header";
import { Sidebar, SidebarProvider, useSidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SearchProvider } from "@/context/search-context"; 
import { OnboardingGuide } from "@/components/onboarding-guide";
import { PageWrapper } from "@/components/layout/page-wrapper";


interface MainLayoutProps {
  children: React.ReactNode;
}

function MainContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out`}>
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-hidden">
                <PageWrapper className="flex-1 flex flex-col gap-4 lg:gap-6">
                    {children}
                </PageWrapper>
            </main>
        </div>
    );
}

function AppLayout({ children }: MainLayoutProps) {
  const { user, loading } = useAuth();
  const { fetchAllData } = useDataStore();

  React.useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const t = useTranslations('Common');

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="text-2xl font-semibold">{t('loading')}</div>
        </div>
    );
  }

  if (!user) {
    return redirect("/login");
  }

  return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <MainContent>{children}</MainContent>
        </div>
        <Toaster />
        <OnboardingGuide />
      </SidebarProvider>
  );
}

import { useTranslations } from 'next-intl';

export default function MainLayout({ children }: MainLayoutProps) {
    const t = useTranslations('Common');
    return (
        <React.Suspense fallback={<div>{t('loading')}</div>}>
            <SearchProvider>
                <AppLayout>{children}</AppLayout>
            </SearchProvider>
        </React.Suspense>
    )
}
