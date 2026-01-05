'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  Settings,
  LogOut,
  Plus,
  Columns3,
  BarChart3,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Users,
  CloudSync,
  Hammer,
  Activity,
  TrendingUp,
  ShoppingBag,
  ChevronDown,
  Cog,
  Boxes,
  LineChart,
  Factory
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from 'next-intl';
import { useFeatureStore } from '@/stores/feature-store';

interface SidebarProps {
    isCollapsed?: boolean;
}

interface RouteItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  id: string;
}

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  routes: RouteItem[];
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const t = useTranslations('Common');
  const features = useFeatureStore((state) => state.features);
  
  // Track expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['core']) // Core is expanded by default
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Categorized routes with distinct colors
  const categories: CategoryConfig[] = [
    {
      id: 'core',
      label: 'Ana Menü',
      icon: LayoutDashboard,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/30',
      routes: [
        { label: t('dashboard'), icon: LayoutDashboard, href: '/dashboard', color: 'text-sky-400', id: 'dashboard' },
        { label: t('projects'), icon: FolderKanban, href: '/projects', color: 'text-violet-400', id: 'projects' },
        { label: 'Marketplace', icon: ShoppingBag, href: '/marketplace', color: 'text-indigo-400', id: 'dashboard' },
      ]
    },
    {
      id: 'engineering',
      label: 'Mühendislik',
      icon: Cog,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      routes: [
        { label: 'Değişim Talepleri (ECR)', icon: Settings, href: '/engineering/ecr', color: 'text-blue-400', id: 'ecm' },
        { label: 'Değişim Emirleri (ECO)', icon: Rocket, href: '/engineering/eco', color: 'text-purple-400', id: 'ecm' },
        { label: 'Malzeme Listesi (BOM)', icon: Package, href: '/bom', color: 'text-indigo-400', id: 'bom' },
        { label: 'Risk Zekası (RAID)', icon: ShieldAlert, href: '/analytics/risk', color: 'text-red-400', id: 'ecm' },
      ]
    },
    {
      id: 'planning',
      label: 'Planlama',
      icon: Columns3,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      routes: [
        { label: 'Kaynak Planlama', icon: Users, href: '/planning/capacity', color: 'text-amber-400', id: 'projects' },
        { label: t('kanban'), icon: Columns3, href: '/kanban', color: 'text-orange-400', id: 'kanban' },
        { label: 'Gantt Şeması', icon: BarChart3, href: '/gantt', color: 'text-teal-400', id: 'gantt' },
      ]
    },
    {
      id: 'analytics',
      label: 'Analitik',
      icon: LineChart,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      routes: [
        { label: t('analytics'), icon: BarChart3, href: '/analytics', color: 'text-emerald-400', id: 'risk-management' },
        { label: 'EVM Dashboard', icon: TrendingUp, href: '/analytics/evm', color: 'text-indigo-400', id: 'evm' },
      ]
    },
    {
      id: 'operations',
      label: 'Operasyonlar',
      icon: Factory,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      routes: [
        { label: t('inventory'), icon: Boxes, href: '/inventory', color: 'text-pink-400', id: 'inventory' },
        { label: 'Forge (Üretim)', icon: Hammer, href: '/forge', color: 'text-orange-400', id: 'forge' },
        { label: 'Flux (IoT)', icon: Activity, href: '/flux', color: 'text-cyan-400', id: 'flux' },
      ]
    },
    {
      id: 'system',
      label: 'Sistem',
      icon: Settings,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/30',
      routes: [
        { label: 'Güvenlik & Audit', icon: ShieldCheck, href: '/settings/security', color: 'text-emerald-400', id: 'settings' },
        { label: 'Sistem Durumu', icon: CloudSync, href: '/settings/status', color: 'text-blue-400', id: 'settings' },
        { label: t('settings'), icon: Settings, href: '/settings', color: 'text-slate-400', id: 'settings' },
      ]
    }
  ];

  // Filter routes based on feature flags
  const filteredCategories = categories.map(category => ({
    ...category,
    routes: category.routes.filter(route => {
      if (['dashboard', 'projects', 'settings'].includes(route.id)) return true;
      const feature = features.find(f => f.id === route.id);
      return feature ? feature.enabled : true;
    })
  })).filter(category => category.routes.length > 0);

  // Check if current path matches any route in a category
  const isCategoryActive = (category: CategoryConfig) => {
    return category.routes.some(route => pathname === route.href);
  };

  return (
    <div className="space-y-4 py-6 flex flex-col h-full glass-sidebar text-sidebar-foreground transition-all duration-300">
      <div className="px-4 py-2 flex-1 flex flex-col overflow-hidden">
        {/* Logo */}
        <Link href="/dashboard" className={cn("flex items-center mb-8 transition-all duration-300", isCollapsed ? "px-0 justify-center" : "px-2")}>
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-xl transition-transform hover:scale-105">
             <Image 
               src="/logo.png" 
               alt="T-HUB Logo" 
               width={24} 
               height={24} 
               className="object-contain dark:brightness-0 dark:invert" 
             />
          </div>
          {!isCollapsed && (
              <div className="ml-3 flex flex-col">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  T-HUB
                </h1>
                <span className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] -mt-1">ECOSYSTEM</span>
              </div>
          )}
        </Link>
        
        {/* Categorized Navigation */}
        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const isActive = isCategoryActive(category);
            
            return (
              <div key={category.id} className="space-y-1">
                {/* Category Header */}
                <button
                  onClick={() => !isCollapsed && toggleCategory(category.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                    category.bgColor,
                    isActive ? `${category.borderColor} border` : "border border-transparent",
                    "hover:brightness-110",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? category.label : undefined}
                >
                  <category.icon className={cn("h-4 w-4 flex-shrink-0", category.color)} />
                  
                  {!isCollapsed && (
                    <>
                      <span className={cn("flex-1 text-left", category.color)}>
                        {category.label}
                      </span>
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          category.color,
                          isExpanded && "rotate-180"
                        )} 
                      />
                    </>
                  )}
                </button>

                {/* Category Routes */}
                <AnimatePresence initial={false}>
                  {(isExpanded || isCollapsed) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={cn("space-y-0.5", !isCollapsed && "pl-4 border-l-2 ml-4", category.borderColor)}>
                        {category.routes.map((route) => (
                          <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                              pathname === route.href
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-sidebar-foreground/80 hover:text-white hover:bg-white/5",
                              isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? route.label : undefined}
                          >
                            <route.icon className={cn(
                              "h-4 w-4 flex-shrink-0 transition-colors",
                              pathname === route.href ? "text-white" : route.color
                            )} />
                            
                            {!isCollapsed && (
                              <span className="truncate">{route.label}</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-4 py-4 space-y-4">
         {!isCollapsed ? (
           <div className="glass-panel rounded-2xl p-4 border-sidebar-border/50">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Workspace</p>
              <PremiumButton className="w-full text-white rounded-xl shadow-lg border-0 transition-all bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                 <Plus className="h-4 w-4 mr-2" /> {t('newProject')}
              </PremiumButton>
           </div>
         ) : (
           <PremiumButton size="icon" className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-90" title={t('newProject')}>
             <Plus className="h-5 w-5 text-white" />
           </PremiumButton>
         )}

         <div className="pt-4 border-t border-sidebar-border/30">
            <Button 
                variant="ghost"
                onClick={() => logout()} 
                className={cn("w-full justify-start text-sidebar-foreground hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors", isCollapsed && "justify-center")}
                title={t('logout')}
            >
                <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span className="text-sm font-medium">{t('logout')}</span>}
            </Button>
         </div>
      </div>
    </div>
  );
}
