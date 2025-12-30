'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';

export interface KanbanFilters {
  priorities: ('low' | 'medium' | 'high')[];
  projectIds: string[];
}

interface KanbanFilterPopoverProps {
  filters: KanbanFilters;
  onFiltersChange: (filters: KanbanFilters) => void;
}

export function KanbanFilterPopover({ filters, onFiltersChange }: KanbanFilterPopoverProps) {
  const t = useTranslations('Kanban');
  const { projects } = useProjectStore();
  const [open, setOpen] = useState(false);

  const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  const togglePriority = (priority: 'low' | 'medium' | 'high') => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority];
    onFiltersChange({ ...filters, priorities: newPriorities });
  };

  const toggleProject = (projectId: string) => {
    const newProjectIds = filters.projectIds.includes(projectId)
      ? filters.projectIds.filter(id => id !== projectId)
      : [...filters.projectIds, projectId];
    onFiltersChange({ ...filters, projectIds: newProjectIds });
  };

  const clearFilters = () => {
    onFiltersChange({ priorities: [], projectIds: [] });
  };

  const hasActiveFilters = filters.priorities.length > 0 || filters.projectIds.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          {t('filter')}
          {hasActiveFilters && (
            <span className="ml-1 h-5 w-5 rounded-full bg-purple-600 text-xs flex items-center justify-center">
              {filters.priorities.length + filters.projectIds.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-zinc-900 border-zinc-800" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{t('filter')}</h4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                {t('clearFilters')}
              </Button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">{t('form.priority')}</Label>
            <div className="space-y-2">
              {priorities.map(priority => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={filters.priorities.includes(priority)}
                    onCheckedChange={() => togglePriority(priority)}
                  />
                  <label
                    htmlFor={`priority-${priority}`}
                    className="text-sm cursor-pointer"
                  >
                    {t(`priorities.${priority}`)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Project Filter */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">{t('form.project')}</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {projects.map(project => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`project-${project.id}`}
                      checked={filters.projectIds.includes(project.id)}
                      onCheckedChange={() => toggleProject(project.id)}
                    />
                    <label
                      htmlFor={`project-${project.id}`}
                      className="text-sm cursor-pointer truncate"
                    >
                      {project.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
