'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { SearchCommand } from '@/components/layout/search-command';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { PageWrapper } from './page-wrapper';
import { LegalFooter } from '../compliance/legal-footer';


export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Initialize auth listener
        const unsubscribe = initializeAuth();
        return () => unsubscribe();
    }, [initializeAuth]);

    useEffect(() => {
        // Redirect if not authenticated and not loading
        if (!isLoading && !isAuthenticated) {
            // Prevent redirecting if we are already on login page (though this component shouldn't be rendered there)
            // router.push('/login'); 
            // NOTE: Allow rendering for now to avoid loops during dev if auth fails often.
            // UNCOMMENT BELOW FOR PRODUCTION
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem('uph-sidebar-collapsed');
        if (saved) setIsCollapsed(JSON.parse(saved));
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('uph-sidebar-collapsed', JSON.stringify(newState));
    };

    if (!isMounted) {
        return (
            <div className="h-full relative">
                <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-30 glass-sidebar">
                    <Sidebar />
                </div>
                <main className="md:pl-72">
                    <Header />
                    <div className="p-8">{children}</div>
                </main>
            </div>
        );
    }

    return (
        <div className="h-full relative">
            {/* Sidebar Wrapper */}
            <div 
                className={cn(
                    "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-30 glass-sidebar transition-all duration-300 shadow-2xl shadow-primary/5",
                    isCollapsed ? "w-20" : "w-72"
                )}
            >
                <Sidebar isCollapsed={isCollapsed} />
                
                {/* Toggle Button */}
                <button 
                     onClick={toggleSidebar}
                     className="absolute -right-3 top-8 bg-sidebar-accent border border-sidebar-border text-muted-foreground p-1 rounded-full shadow-md hover:text-sidebar-foreground transition-colors z-50 hidden md:flex"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Main Content */}
            <main 
                className={cn(
                    "transition-all duration-300",
                    isCollapsed ? "md:pl-20" : "md:pl-72"
                )}
            >
                <SearchCommand />
                <Header />
                <PageWrapper className="p-8">
                    {children}
                </PageWrapper>
                <LegalFooter />
            </main>
        </div>
    );
}
