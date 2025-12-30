'use client';

import { Activity, DollarSign, AlertTriangle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface StatsCardsProps {
  t: (key: string) => string;
  activeProjectsCount: number;
  totalProjectsCount: number;
  totalSpent: number;
  totalBudget: number;
  lowStockItemsCount: number;
  inventoryValue: number;
}

export function StatsCards({
  t,
  activeProjectsCount,
  totalProjectsCount,
  totalSpent,
  totalBudget,
  lowStockItemsCount,
  inventoryValue
}: StatsCardsProps) {
  const budgetProgress = (totalSpent / totalBudget) * 100 || 0;

  return (
    <motion.div 
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {/* Active Projects */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
        <Link href="/projects" className="group">
          <div className="glass-panel relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary border border-border/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 group-hover:bg-primary/20 transition-all opacity-50 dark:opacity-100" />
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase tracking-wider">
                Live
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">{t('activeProjects')}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground dark:text-white tracking-tight">{activeProjectsCount}</span>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">+2 this week</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Workflow: {totalProjectsCount}</p>
            </div>
          </div>
        </Link>
      </motion.div>
      
      {/* Budget Usage */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
        <div className="glass-panel relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] group border border-border/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] -mr-16 -mt-16 opacity-50 dark:opacity-100" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-500">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
              Optimal
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">{t('budgetUsage')}</h3>
            <div className="text-3xl font-bold text-foreground dark:text-white tracking-tight">${totalSpent.toLocaleString()}</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(budgetProgress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ width: `${Math.round(budgetProgress)}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Low Stock Items */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
        <Link href="/inventory" className="group">
          <div className="glass-panel relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500 border border-border/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] -mr-16 -mt-16 opacity-50 dark:opacity-100" />
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                <AlertTriangle className="h-5 w-5" />
              </div>
              {lowStockItemsCount > 0 && (
                <Badge className="bg-orange-500/20 text-orange-400 border-none animate-pulse">
                  Critical
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">{t('lowStockAlerts')}</h3>
              <div className="text-3xl font-bold text-foreground dark:text-white tracking-tight">{lowStockItemsCount}</div>
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest">
              {t('belowThreshold')}
            </p>
          </div>
        </Link>
      </motion.div>
      
      {/* Inventory Value */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
        <div className="glass-panel relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] group border border-border/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] -mr-16 -mt-16 opacity-50 dark:opacity-100" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">{t('inventoryValue')}</h3>
            <div className="text-3xl font-bold text-foreground dark:text-white tracking-tight">${inventoryValue.toLocaleString()}</div>
          </div>
          <p className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest">
            {t('stockAssetValue')}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
