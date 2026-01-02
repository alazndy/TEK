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
  Zap,
  Target,
  Cog
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from 'next-intl';
import { useFeatureStore } from '@/stores/feature-store';

interface SidebarProps {
  isCollapsed?: boolean;
}

interface NavCategory {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  featureId?: string;
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const t = useTranslations('Common');
  const features = useFeatureStore((state) => state.features);
  
  // Track which accordions are open
  const [openCategories, setOpenCategories] = useState<string[]>(['general', 'projects']);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Check if feature is enabled
  const isFeatureEnabled = (featureId?: string) => {
    if (!featureId) return true;
    if (['dashboard', 'projects', 'settings'].includes(featureId)) return true;
    const feature = features.find(f => f.id === featureId);
    return feature ? feature.enabled : true;
  };

  // Categorized navigation
  const categories: NavCategory[] = [
    {
      id: 'general',
      label: 'Genel',
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-l-sky-500',
      icon: LayoutDashboard,
      items: [
        { label: t('dashboard'), icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
        { label: 'Focus Mode', icon: Target, href: '/focus' },
      ]
    },
    {
      id: 'projects',
      label: 'Proje Yönetimi',
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-l-violet-500',
      icon: FolderKanban,
      items: [
        { label: t('projects'), icon: FolderKanban, href: '/projects', featureId: 'projects' },
        { label: t('kanban'), icon: Columns3, href: '/kanban', featureId: 'kanban' },
        { label: 'Gantt Şeması', icon: BarChart3, href: '/gantt', featureId: 'gantt' },
        { label: 'Kaynak Planlama', icon: Users, href: '/planning/capacity', featureId: 'projects' },
      ]
    },
    {
      id: 'engineering',
      label: 'Mühendislik',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-l-blue-500',
      icon: Cog,
      items: [
        { label: 'Değişim Talepleri (ECR)', icon: Settings, href: '/engineering/ecr', featureId: 'ecm' },
        { label: 'Değişim Emirleri (ECO)', icon: Rocket, href: '/engineering/eco', featureId: 'ecm' },
        { label: 'Malzeme Listesi (BOM)', icon: Package, href: '/bom', featureId: 'bom' },
        { label: 'Risk Zekası (RAID)', icon: ShieldAlert, href: '/analytics/risk', featureId: 'ecm' },
      ]
    },
    {
      id: 'analytics',
      label: 'Analitik',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-l-emerald-500',
      icon: TrendingUp,
      items: [
        { label: t('analytics'), icon: BarChart3, href: '/analytics', featureId: 'risk-management' },
        { label: 'EVM Dashboard', icon: TrendingUp, href: '/analytics/evm', featureId: 'evm' },
      ]
    },
    {
      id: 'operations',
      label: 'Operasyonlar',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-l-orange-500',
      icon: Zap,
      items: [
        { label: t('inventory'), icon: Package, href: '/inventory', featureId: 'inventory' },
        { label: 'Forge (Üretim)', icon: Hammer, href: '/forge', featureId: 'forge' },
        { label: 'Flux (IoT)', icon: Activity, href: '/flux', featureId: 'flux' },
      ]
    },
    {
      id: 'system',
      label: 'Sistem',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-l-slate-500',
      icon: Settings,
      items: [
        { label: 'Güvenlik & Audit', icon: ShieldCheck, href: '/settings/security', featureId: 'settings' },
        { label: 'Sistem Durumu', icon: CloudSync, href: '/settings/status', featureId: 'settings' },
        { label: t('settings'), icon: Settings, href: '/settings', featureId: 'settings' },
      ]
    },
  ];

  // Filter items based on feature flags
  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => isFeatureEnabled(item.featureId))
  })).filter(cat => cat.items.length > 0);

  // Check if any item in category is active
  const isCategoryActive = (category: NavCategory) => {
    return category.items.some(item => pathname.includes(item.href));
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
              <h1 className="text-xl font-bold tracking-tight">T-HUB</h1>
              <span className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] -mt-1">ECOSYSTEM</span>
            </div>
          )}
        </Link>
        
        {/* Accordion Navigation */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {filteredCategories.map((category) => {
            const isOpen = openCategories.includes(category.id);
            const hasActiveItem = isCategoryActive(category);
            
            return (
              <div key={category.id} className={cn("rounded-xl overflow-hidden transition-all", category.bgColor)}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-left transition-all",
                    "hover:bg-white/5 border-l-4",
                    category.borderColor,
                    hasActiveItem && "bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <category.icon className={cn("h-4 w-4", category.color)} />
                    {!isCollapsed && (
                      <span className={cn("text-sm font-semibold", category.color)}>
                        {category.label}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                      )} 
                    />
                  )}
                </button>
                
                {/* Category Items */}
                <AnimatePresence initial={false}>
                  {isOpen && !isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="py-1 space-y-0.5">
                        {category.items.map((item) => {
                          const isActive = pathname.includes(item.href);
                          
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-all",
                                isActive 
                                  ? "bg-primary text-white font-medium shadow-md" 
                                  : "text-sidebar-foreground/80 hover:text-foreground hover:bg-white/10"
                              )}
                            >
                              <item.icon className={cn("h-4 w-4", isActive && "text-white")} />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Collapsed Mode: Show items as tooltip triggers */}
                {isCollapsed && isOpen && (
                  <div className="py-1 space-y-1">
                    {category.items.map((item) => {
                      const isActive = pathname.includes(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={item.label}
                          className={cn(
                            "flex justify-center py-2 mx-1 rounded-lg transition-all",
                            isActive 
                              ? "bg-primary text-white" 
                              : "text-sidebar-foreground/60 hover:bg-white/10"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </Link>
                      );
                    })}
                  </div>
                )}
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
