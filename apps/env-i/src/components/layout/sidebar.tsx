
"use client"

import React, { createContext, useContext, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PremiumButton } from "@t-ecosystem/ui-kit";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  PanelLeft,
  LayoutGrid,
  Boxes,
  ShoppingCart,
  FlaskConical,
  ClipboardCheck,
  BarChart2,
  HardHat,
  FileText,
  History,
  Archive,
  ChevronLeft,
  ChevronRight,
  Settings,
  Folder,
  BookOpen,
  ChevronDown,
  Map,
  Truck,
  Users,
  ArrowLeftRight,
  Bell
} from "lucide-react";
import { useFeatureStore } from "@/stores/feature-store";

interface SidebarContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen, isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

type NavItem = {
    href?: string;
    label: string;
    icon: React.ElementType;
    subItems?: { href: string; label: string; icon: React.ElementType }[];
    featureId?: string;
};

import { useTranslations } from 'next-intl';

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen, isCollapsed, setIsCollapsed } = useSidebar();
  const { isFeatureEnabled } = useFeatureStore();
  const t = useTranslations('Common');
  
  // State for collapsible items
  const [openGroups, setOpenGroups] = useState<string[]>([t('assetManagement')]);

  const navLinks: NavItem[] = [
    { href: "/dashboard", label: t('dashboard'), icon: LayoutGrid },
    { href: "/projects", label: t('projects'), icon: Folder },
    {
        label: t('assetManagement'),
        icon: Boxes,
        featureId: 'asset-management',
        subItems: [
            { href: "/inventory", label: t('inventory'), icon: Boxes },
            { href: "/equipment", label: t('equipment'), icon: HardHat },
            { href: "/consumables", label: t('consumables'), icon: FlaskConical },
            { href: "/catalog", label: t('catalog'), icon: BookOpen },
            { href: "/physical-count", label: t('physicalCount'), icon: ClipboardCheck },
            { href: "/discontinued", label: t('discontinued'), icon: Archive },
        ]
    },
    {
        label: "Tedarik", // Procurement
        icon: Truck,
        featureId: 'procurement',
        subItems: [
            { href: "/suppliers", label: "Tedarikçiler", icon: Users },
            { href: "/purchases", label: "Satın Alma", icon: Truck },
            { href: "/transfers", label: "Transferler", icon: ArrowLeftRight },
        ]
    },
    {
        label: t('commercial'),
        icon: ShoppingCart,
        featureId: 'commercial',
        subItems: [
            { href: "/orders", label: t('orders'), icon: ShoppingCart },
            { href: "/proposals", label: t('proposals'), icon: FileText },
        ]
    },
    {
        label: t('reporting'),
        icon: BarChart2,
        featureId: 'reporting',
        subItems: [
            { href: "/reports", label: t('reports'), icon: BarChart2 },
            { href: "/audit-log", label: t('auditLog'), icon: History },
        ]
    },
    { href: "/warehouse-map", label: t('warehouseMap'), icon: Map, featureId: 'warehouse-map' },
    { href: "/settings", label: t('settings'), icon: Settings },
  ].filter(link => {
      // Filter based on featureId if present
      if ((link as any).featureId) {
          return isFeatureEnabled((link as any).featureId);
      }
      return true;
  });

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const isGroupActive = (subItems: { href: string }[]) => {
      return subItems.some(item => isActive(item.href));
  };

  const toggleGroup = (label: string) => {
      if (isCollapsed) {
          setIsCollapsed(false);
          setOpenGroups(prev => [...prev, label]);
      } else {
        setOpenGroups(prev => 
            prev.includes(label) 
            ? prev.filter(l => l !== label) 
            : [...prev, label]
        );
      }
  };

  const NavContent = () => (
    <TooltipProvider>
        <nav className={`grid items-start gap-2 px-2 text-sm font-medium lg:px-4 ${isCollapsed ? 'justify-center' : ''}`}>
        {navLinks.map((link, index) => {
            if (link.subItems) {
                const isOpen = openGroups.includes(link.label);
                const groupActive = isGroupActive(link.subItems);
                
                return (
                    <Collapsible 
                        key={link.label} 
                        open={isOpen} 
                        onOpenChange={() => toggleGroup(link.label)}
                        className={`w-full ${isCollapsed ? 'flex justify-center' : ''}`}
                    >
                        {isCollapsed ? (
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <CollapsibleTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            className={`w-full justify-center p-2 mb-2 ${groupActive ? 'bg-primary/10 text-emerald-400' : 'text-zinc-400'}`}
                                        >
                                            <link.icon className="h-4 w-4" />
                                            <span className="sr-only">{link.label}</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="bg-black/80 backdrop-blur-md border border-white/10 text-emerald-400">
                                    {link.label} ({t('clickToExpand')})
                                </TooltipContent>
                             </Tooltip>
                        ) : (
                            <CollapsibleTrigger className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-zinc-400 hover:text-foreground hover:bg-white/5 ${groupActive ? 'text-foreground' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <link.icon className={`h-4 w-4 ${groupActive ? "text-emerald-400" : ""}`} />
                                    <span>{link.label}</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                            </CollapsibleTrigger>
                        )}

                        <CollapsibleContent className="space-y-1">
                             {!isCollapsed && link.subItems.map((subItem) => {
                                 const active = isActive(subItem.href);
                                 return (
                                     <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        className={`flex items-center gap-3 rounded-lg pl-9 pr-3 py-2 transition-all duration-200 border border-transparent ${
                                            active
                                            ? "bg-primary/20 text-emerald-400 border-primary/20 shadow-[0_0_15px_-5px_var(--primary)]"
                                            : "text-zinc-400 hover:text-foreground hover:bg-white/5"
                                        }`}
                                        onClick={() => setIsSidebarOpen(false)}
                                     >
                                         <subItem.icon className={`h-4 w-4 ${active ? "text-emerald-400" : ""}`} />
                                         <span>{subItem.label}</span>
                                     </Link>
                                 )
                             })}
                        </CollapsibleContent>
                    </Collapsible>
                )
            }

            // Standard Link
            const active = isActive(link.href!);
            return (
                <Tooltip key={link.href}>
                    <TooltipTrigger asChild>
                        <PremiumButton
                          variant={active ? "premium" : "glass"}
                          size="sm"
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 border border-transparent w-full ${
                              active
                              ? "text-white"
                              : "text-zinc-400 hover:text-foreground"
                          } ${isCollapsed ? 'justify-center p-0' : 'justify-start'}`}
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          <link.icon className={`h-4 w-4 ${active ? "text-white" : ""}`} />
                          <span className={`${isCollapsed ? 'sr-only' : ''}`}>{link.label}</span>
                        </PremiumButton>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" className="bg-black/80 backdrop-blur-md border border-white/10 text-emerald-400">
                            {link.label}
                        </TooltipContent>
                    )}
                </Tooltip>
            );
        })}
        </nav>
    </TooltipProvider>
  );

  return (
    <>
      <div className="md:hidden">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden border-white/10 bg-black/40 backdrop-blur-md">
              <PanelLeft className="h-5 w-5 text-emerald-400" />
              <span className="sr-only">{t('toggleMenu')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs bg-zinc-950/90 backdrop-blur-xl border-r border-white/10">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
      <div className={`hidden border-r glass-sidebar md:flex md:flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className={`flex h-16 items-center border-b border-white/5 px-4 lg:px-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <div className="relative w-8 h-8 overflow-hidden rounded-lg shrink-0">
                        <img src="/logo.png" alt="ENV-I Logo" className="w-full h-full object-cover" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                            ENV-I
                        </span>
                    )}
                </div>
                <PremiumButton variant="glass" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="text-zinc-400 hover:text-emerald-400">
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    <span className="sr-only">{t('toggleSidebar')}</span>
                </PremiumButton>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <NavContent />
            </div>
        </div>
      </div>
    </>
  );
}
