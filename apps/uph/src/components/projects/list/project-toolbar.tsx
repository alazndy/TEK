'use client';

import { Search, LayoutGrid, List, Filter, ChevronRight, Folder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';

interface ProjectToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  t: any;
}

export function ProjectToolbar({ 
  searchTerm, 
  setSearchTerm, 
  viewMode, 
  setViewMode, 
  t 
}: ProjectToolbarProps) {
  return (
    <header className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <Folder className="h-3 w-3" />
          <span>Workspace</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{t('title')}</span>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            {t('title')}
          </h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            className="w-full pl-11 pr-4 py-6 bg-muted/50 border-input rounded-full text-sm text-foreground placeholder-muted-foreground focus:bg-background focus:border-primary/50 focus:ring-primary/50 transition-all"
            placeholder={t('filterPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex bg-muted/50 rounded-full p-1 border border-border">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full transition-all",
                viewMode === 'grid' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full transition-all",
                viewMode === 'list' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-6 w-px bg-border mx-1 hidden md:block"></div>
          <Button 
            variant="ghost"
            className="flex items-center gap-2 px-5 py-5 bg-muted/50 hover:bg-muted border border-border rounded-full text-xs font-bold uppercase tracking-widest transition-all group h-auto"
          >
            <Filter className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            <span>{t('filter')}</span>
          </Button>
          <CreateProjectDialog />
        </div>
      </div>
    </header>
  );
}
