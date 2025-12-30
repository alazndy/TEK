'use client';

import { useEffect } from 'react';
import { 
  FolderKanban, 
  Star 
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useActivityStore } from '@/stores/activity-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { useTranslations } from 'next-intl';

// Sub-components
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ActivityFeed } from '@/components/dashboard/activity-feed';

export default function DashboardPage() {
  const { projects, fetchProjects } = useProjectStore();
  const { products, fetchInventory } = useInventoryStore();
  const { activities } = useActivityStore();
  const t = useTranslations('Dashboard');

  useEffect(() => {
    fetchProjects();
    fetchInventory();
  }, [fetchProjects, fetchInventory]);

  // Derived Data
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });

  const activeProjects = projects.filter(p => p.status === 'Active');
  const lowStockItems = products.filter(p => p.stock <= (p.minStock || 5)); 
  const totalBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);
  const totalSpent = projects.reduce((acc, curr) => acc + curr.spent, 0);
  const inventoryValue = products.reduce((acc, curr) => acc + (curr.stock * (curr.price || 0)), 0);

  return (
    <div className="flex-1 space-y-8 p-0 text-foreground">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-sm">Welcome back. Here&apos;s what&apos;s happening in your workspace.</p>
      </div>
      
      <div className="flex items-center gap-4">
        <CreateProjectDialog />
      </div>

      <StatsCards 
        t={t}
        activeProjectsCount={activeProjects.length}
        totalProjectsCount={projects.length}
        totalSpent={totalSpent}
        totalBudget={totalBudget}
        lowStockItemsCount={lowStockItems.length}
        inventoryValue={inventoryValue}
      />

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-12">
        {/* Recent Projects Section */}
        <div className="glass-panel rounded-4xl col-span-12 lg:col-span-8 p-8 border border-border/50">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground dark:text-white">{t('recentProjects')}</h3>
              <p className="text-xs text-muted-foreground">Manage your latest project workflows</p>
            </div>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl">View all</Button>
            </Link>
          </div>
          
          <div className="space-y-1">
            {sortedProjects.slice(0, 5).map(project => (
              <div key={project.id} className="group flex items-center p-4 rounded-2xl hover:bg-white/3 transition-all duration-300 border border-transparent hover:border-border/50">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/50">
                  <span className="text-lg font-bold text-primary">{project.name.charAt(0)}</span>
                </div>
                <div className="ml-4 space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-foreground dark:text-white group-hover:text-primary transition-colors text-sm">{project.name}</div>
                        {project.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                      </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={cn(
                    "rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-widest border-none",
                    project.status === 'Active' ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {project.status}
                  </Badge>
                  <div className="w-24 h-1 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 w-[65%]" />
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-3">
                <div className="p-4 rounded-full bg-white/5">
                    <FolderKanban className="h-8 w-8 opacity-20" />
                </div>
                <p className="text-sm">{t('noProjects')}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Activity Feed Section */}
        <div className="col-span-12 lg:col-span-4">
          <ActivityFeed t={t} activities={activities} />
        </div>
      </div>
    </div>
  );
}
