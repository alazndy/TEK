'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

// --- Context Definition ---
interface SidebarContextType {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    isCollapsed: boolean; // Alias for !isOpen
    setIsSidebarOpen: (value: boolean) => void; // Alias for setIsOpen
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);

    // Persist state if needed, or default to open on desktop
    // For now, simpler is better to fix the build
    
    const value = useMemo(() => ({
        isOpen,
        setIsOpen,
        isCollapsed: !isOpen,
        setIsSidebarOpen: setIsOpen,
        toggleSidebar: () => setIsOpen(prev => !prev)
    }), [isOpen]);

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
}
