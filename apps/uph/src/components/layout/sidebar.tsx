'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

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
  ShoppingBag
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

// Routes moved inside Sidebar component for translations

interface SidebarProps {
    isCollapsed?: boolean;
}

import { useTranslations } from 'next-intl';

import { useFeatureStore } from '@/stores/feature-store';

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const t = useTranslations('Common');
  const features = useFeatureStore((state) => state.features);

  const routes = [
    {
      label: t('dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
      color: 'text-sky-500',
      id: 'dashboard' // Core feature, always on
    },
    {
      label: t('projects'),
      icon: FolderKanban,
      href: '/projects',
      color: 'text-violet-500',
      id: 'projects' // Core feature
    },
    {
      label: 'Değişim Talepleri (ECR)',
      icon: Settings,
      href: '/engineering/ecr',
      color: 'text-blue-500',
      id: 'ecm'
    },
    {
      label: 'Değişim Emirleri (ECO)',
      icon: Rocket,
      href: '/engineering/eco',
      color: 'text-purple-500',
      id: 'ecm'
    },
    {
      label: 'Malzeme Listesi (BOM)',
      icon: Package,
      href: '/bom',
      color: 'text-indigo-500',
      id: 'bom'
    },
    {
      label: 'Risk Zekası (RAID)',
      icon: ShieldAlert,
      href: '/analytics/risk',
      color: 'text-red-500',
      id: 'ecm'
    },
    {
      label: 'Kaynak Planlama',
      icon: Users,
      href: '/planning/capacity',
      color: 'text-amber-500',
      id: 'projects' // Reusing projects id or could create 'capacity'
    },
    {
      label: t('kanban'),
      icon: Columns3,
      href: '/kanban',
      color: 'text-orange-500',
      id: 'kanban'
    },
    {
      label: 'Gantt Şeması',
      icon: BarChart3,
      href: '/gantt',
      color: 'text-teal-500',
      id: 'gantt'
    },
    {
      label: t('analytics'),
      icon: BarChart3,
      href: '/analytics',
      color: 'text-emerald-500',
      id: 'risk-management' // Mapped to risk for now
    },
    {
      label: 'EVM Dashboard',
      icon: TrendingUp,
      href: '/analytics/evm',
      color: 'text-indigo-500',
      id: 'evm'
    },
    {
      label: t('inventory'),
      icon: Package,
      href: '/inventory',
      color: 'text-pink-700',
      id: 'inventory'
    },
    {
      label: 'Marketplace',
      icon: ShoppingBag,
      href: '/marketplace',
      color: 'text-indigo-500',
      id: 'dashboard' // Grouping with core dashboard features
    },
    {
      label: 'Forge (Üretim)',
      icon: Hammer,
      href: '/forge',
      color: 'text-orange-600',
      id: 'forge'
    },
    {
      label: 'Flux (IoT)',
      icon: Activity,
      href: '/flux',
      color: 'text-cyan-500',
      id: 'flux'
    },
    {
      label: 'Güvenlik & Audit',
      icon: ShieldCheck,
      href: '/settings/security',
      color: 'text-emerald-500',
      id: 'settings'
    },
    {
      label: 'Sistem Durumu',
      icon: CloudSync,
      href: '/settings/status',
      color: 'text-blue-500',
      id: 'settings'
    },
    {
      label: t('settings'),
      icon: Settings,
      href: '/settings',
      color: 'text-slate-500',
      id: 'settings'
    },
  ].filter(route => {
    // Core routes are always enabled
    if (['dashboard', 'projects', 'settings'].includes(route.id)) return true;
    const feature = features.find(f => f.id === route.id);
    return feature ? feature.enabled : true;
  });

  return (
    <div className="space-y-4 py-6 flex flex-col h-full glass-sidebar text-sidebar-foreground transition-all duration-300">
      <div className="px-6 py-2 flex-1 flex flex-col">
        <Link href="/dashboard" className={cn("flex items-center mb-10 transition-all duration-300", isCollapsed ? "px-0 justify-center" : "px-0")}>
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-linear-to-br from-primary to-purple-600 shadow-xl transition-transform hover:scale-105">
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
                <h1 className="text-xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  T-HUB
                </h1>
                <span className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] -mt-1">ECOSYSTEM</span>
              </div>
          )}
        </Link>
        
        <motion.div 
          className="space-y-2 flex-1"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0, x: -10 },
            show: {
              opacity: 1,
              x: 0,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {routes.map((route) => (
            <motion.div 
              key={route.href}
              variants={{
                hidden: { opacity: 0, x: -10 },
                show: { opacity: 1, x: 0 }
              }}
            >
              <PremiumButton
                variant={pathname === route.href ? "premium" : "glass"}
                size="sm"
                className={cn(
                  'group relative flex items-center p-3 w-full font-medium rounded-xl transition-all duration-300',
                  pathname === route.href 
                      ? 'text-white' 
                      : 'text-sidebar-foreground hover:text-foreground dark:hover:text-white hover:bg-white/5',
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? route.label : undefined}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className={cn('h-5 w-5 transition-all duration-300', 
                    pathname === route.href ? "text-white scale-110" : "text-sidebar-foreground group-hover:text-primary group-hover:scale-110", 
                    !isCollapsed && "ml-1 mr-3"
                  )} />
                  
                  {!isCollapsed && (
                    <span className="text-sm transition-opacity duration-300">
                      {route.label}
                    </span>
                  )}
                </Link>
              </PremiumButton>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="px-6 py-4 space-y-4">
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
