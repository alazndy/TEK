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
import { SlidersHorizontal, LayoutGrid, List } from 'lucide-react';

export type KanbanViewMode = 'default' | 'compact';

interface KanbanViewPopoverProps {
  viewMode: KanbanViewMode;
  onViewModeChange: (mode: KanbanViewMode) => void;
}

export function KanbanViewPopover({ viewMode, onViewModeChange }: KanbanViewPopoverProps) {
  const t = useTranslations('Kanban');
  const [open, setOpen] = useState(false);

  const viewModes: { id: KanbanViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { id: 'default', icon: LayoutGrid, label: t('viewDefault') },
    { id: 'compact', icon: List, label: t('viewCompact') },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {t('view')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 bg-zinc-900 border-zinc-800" align="end">
        <div className="space-y-2">
          <Label className="text-xs text-zinc-400">{t('view')}</Label>
          <div className="space-y-1">
            {viewModes.map(mode => (
              <Button
                key={mode.id}
                variant={viewMode === mode.id ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  onViewModeChange(mode.id);
                  setOpen(false);
                }}
              >
                <mode.icon className="h-4 w-4" />
                {mode.label}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
