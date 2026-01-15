'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { 
    LayoutDashboard, 
    Box, 
    ShoppingCart, 
    Settings, 
    Users, 
    BarChart3, 
    ChevronRight,
    LogOut,
    ChevronLeft,
    ChevronLeft,
    Factory,
    ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { useFeatureStore } from '@/stores/feature-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from './sidebar-context';

export function Sidebar() {
    const { isOpen, setIsOpen } = useSidebar();
    const t = useTranslations('sidebar');
    const locale = useLocale();
    const pathname = usePathname();
    const { userRole, logout } = useAuthStore();
    const { isFeatureEnabled } = useFeatureStore();
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['inventory_products', 'inventory_ops', 'commercial']);

    // Prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Toggle submenu group
    const toggleGroup = (groupKey: string) => {
        if (!isOpen) setIsOpen(true); // Auto-open sidebar if expanding a group
        setExpandedGroups(prev => 
            prev.includes(groupKey) 
                ? prev.filter(k => k !== groupKey) 
                : [...prev, groupKey]
        );
    };

    const navLinks = useMemo(() => [
        {
            icon: LayoutDashboard,
            label: t('dashboard'),
            href: `/${locale}/dashboard`,
            exact: true,
        },
        {
        {
            group: 'inventory_products',
            label: 'Tüm Ürünler',
            icon: Box,
            items: [
                { label: 'Genel Görünüm', href: `/${locale}/inventory` },
                { label: 'Stok Ürünleri', href: `/${locale}/inventory/stock` },
                { label: 'Demirbaşlar', href: `/${locale}/inventory/equipment` },
                { label: 'Sarf Malzemeleri', href: `/${locale}/inventory/consumables` },
                { label: 'Katalog', href: `/${locale}/catalog` },
            ]
        },
        {
            group: 'inventory_ops',
            label: 'Envanter İşlemleri',
            icon: ClipboardList,
            items: [
                { label: t('stock_movements'), href: `/${locale}/transfers` },
                { label: t('warehouse_layout'), href: `/${locale}/warehouse-map` },
                { label: 'Fiziksel Sayım', href: `/${locale}/physical-count` },
                { label: t('expiration_dates'), href: `/${locale}/discontinued` },
            ]
        },
        {
            group: 'commercial',
            label: t('commercial'),
            icon: ShoppingCart,
            items: [
                { label: t('suppliers'), href: `/${locale}/suppliers` },
                { label: t('purchase_orders'), href: `/${locale}/purchases` },
                { label: t('customer_orders'), href: `/${locale}/orders` },
                { label: t('proposals'), href: `/${locale}/proposals` },
            ]
        },
        {
            group: 'production',
            label: t('production'),
            icon: Factory,
            featureId: 'production_module',
            items: [
                { label: t('work_orders'), href: `/${locale}/projects` },
                { label: t('recipes'), href: `/${locale}/catalog` },
            ]
        },
        {
            group: 'reports',
            label: t('reports'),
            icon: BarChart3,
            requiredRole: 'manager',
            items: [
                { label: t('stock_reports'), href: `/${locale}/reports` },
                { label: t('sales_reports'), href: `/${locale}/reports` },
            ]
        },
        {
            label: t('team'),
            icon: Users,
            href: `/${locale}/projects`,
            requiredRole: 'admin',
        },
        {
            label: t('settings'),
            icon: Settings,
            href: `/${locale}/settings`,
        }
    ].filter(link => {
        // Feature Flag Check
        if (link.featureId && !isFeatureEnabled(link.featureId)) return false;
        // Role Check (Simple hierarchy: admin > manager > viewer)
        // NOTE: Commented out for dev visibility as per user request history
        // if (link.requiredRole === 'admin' && userRole !== 'admin') return false;
        return true;
    }), [t, isFeatureEnabled, userRole, locale]);

    if (!mounted) return null;

    return (
        <motion.aside
            initial={false}
            animate={{ 
                width: isOpen ? 280 : 80,
                transition: { type: "spring", stiffness: 300, damping: 30 }
            }}
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r bg-sidebar border-sidebar-border shadow-xl",
                "hidden md:flex flex-col overflow-hidden glass-sidebar" 
            )}
        >
            {/* Header / Logo Area */}
            <div className="flex h-16 items-center justify-between px-4 shrink-0">
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-2 font-bold text-xl text-primary"
                        >
                             <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Box className="h-5 w-5 text-primary" />
                             </div>
                             <span>Env-I</span>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full flex justify-center"
                        >
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Box className="h-6 w-6 text-primary" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {isOpen && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsOpen(false)}
                        className="text-muted-foreground hover:bg-muted/50"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <Separator className="bg-sidebar-border/50" />

            {/* Navigation Items */}
            <ScrollArea className="flex-1 py-4">
                <nav className="flex flex-col gap-1 px-3">
                    {navLinks.map((item, index) => {
                        const isGroup = 'items' in item;
                        const isActive = isGroup 
                            ? item.items?.some((sub: any) => pathname?.includes(sub.href))
                            : pathname === item.href;
                        const isExpanded = isGroup && expandedGroups.includes(item.group || '');

                        if (!isOpen && isGroup) {
                            return (
                                <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            size="icon"
                                            onClick={() => setIsOpen(true)} // Auto expand
                                            className={cn(
                                                "w-full h-10 mb-1 rounded-lg",
                                                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-popover text-popover-foreground">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        if (!isGroup) {
                            return (
                                <Link 
                                    key={index} 
                                    href={item.href}
                                    className="block"
                                >
                                    {isOpen ? (
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={cn(
                                                "w-full justify-start gap-3 h-10 mb-1",
                                                isActive && "sidebar-item-active font-medium"
                                            )}
                                        >
                                            <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                                            <span>{item.label}</span>
                                        </Button>
                                    ) : (
                                       <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant={isActive ? "secondary" : "ghost"}
                                                    size="icon"
                                                    className={cn(
                                                        "w-full h-10 mb-1",
                                                        isActive && "sidebar-item-active"
                                                    )}
                                                >
                                                    <item.icon className="h-5 w-5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                {item.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </Link>
                            );
                        }

                        // Expanded Group
                        return (
                            <div key={index} className="mb-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => toggleGroup(item.group!)}
                                    className={cn(
                                        "w-full justify-between hover:bg-sidebar-accent/50 h-10 px-3",
                                        isActive && "text-primary font-medium"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                        <span>{item.label}</span>
                                    </div>
                                    <ChevronRight 
                                        className={cn(
                                            "h-4 w-4 transition-transform text-muted-foreground",
                                            isExpanded && "rotate-90"
                                        )} 
                                    />
                                </Button>
                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="ml-9 mr-2 mt-1 flex flex-col gap-1 border-l border-sidebar-border pl-3">
                                                {item.items?.map((sub: any, subIndex: number) => {
                                                    // Feature check for subitems
                                                    if (sub.featureId && !isFeatureEnabled(sub.featureId)) return null;
                                                    const isSubActive = pathname === sub.href;
                                                    
                                                    return (
                                                        <Link key={subIndex} href={sub.href}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={cn(
                                                                    "w-full justify-start h-8 text-sm font-normal",
                                                                    isSubActive 
                                                                        ? "text-primary bg-sidebar-primary/5" 
                                                                        : "text-muted-foreground hover:text-foreground"
                                                                )}
                                                            >
                                                                {sub.label}
                                                            </Button>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/20">
                 <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    {isOpen && (
                         <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">Mevcut Kullanıcı</span>
                            <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
                        </div>
                    )}
                </div>
                {isOpen && (
                     <Button 
                        variant="outline" 
                        className="w-full mt-4 gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4" />
                        <span>{t('logout')}</span>
                    </Button>
                )}
            </div>
        </motion.aside>
    );
}
