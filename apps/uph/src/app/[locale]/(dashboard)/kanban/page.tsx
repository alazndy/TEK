'use client';

import { useState, useEffect } from 'react';
import { KanbanBoard } from '@/components/kanban';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddTaskDialog } from '@/components/kanban/add-task-dialog';
import { KanbanFilterPopover, KanbanFilters } from '@/components/kanban/kanban-filter-popover';
import { KanbanViewPopover, KanbanViewMode } from '@/components/kanban/kanban-view-popover';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/stores/project-store';

export default function KanbanPage() {
  const t = useTranslations('Kanban');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState<KanbanFilters>({ priorities: [], projectIds: [] });
  const [viewMode, setViewMode] = useState<KanbanViewMode>('default');
  const { fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <KanbanFilterPopover filters={filters} onFiltersChange={setFilters} />
          <KanbanViewPopover viewMode={viewMode} onViewModeChange={setViewMode} />
          <Button 
            size="sm" 
            className="gap-2 bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {t('addTask')}
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard filters={filters} viewMode={viewMode} />
      </div>

      <AddTaskDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
