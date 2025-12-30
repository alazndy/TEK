import React, { useLayoutEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, MoreHorizontal, Trash2 } from 'lucide-react';
import { KanbanTask, useKanbanStore } from '@/stores/kanban-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  task: KanbanTask;
  isCompact?: boolean;
}

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function KanbanCard({ task, isCompact = false }: KanbanCardProps) {
  const { deleteTask } = useKanbanStore();
  const t = useTranslations('Kanban');
  const tCommon = useTranslations('Common');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const cardRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = CSS.Transform.toString(transform) || '';
      cardRef.current.style.transition = transition || '';
    }
  }, [transform, transition]);

  if (isCompact) {
    return (
      <div
        ref={(node) => {
          setNodeRef(node);
          cardRef.current = node as HTMLDivElement;
        }}
        className={cn(
          'flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50 border border-zinc-700 cursor-grab active:cursor-grabbing',
          isDragging && 'opacity-50 ring-2 ring-purple-500'
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3 text-zinc-500 shrink-0" />
        <span className="text-sm truncate flex-1">{task.title}</span>
        <Badge
          variant="outline"
          className={cn('text-[10px] px-1 py-0', priorityColors[task.priority])}
        >
          {t(`priorities.${task.priority}`)}
        </Badge>
      </div>
    );
  }

  return (
    <Card
      ref={(node: any) => {
        setNodeRef(node);
        cardRef.current = node as HTMLDivElement;
      }}
      className={cn(
        'bg-zinc-800/50 border-zinc-700 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-purple-500'
      )}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
          <CardTitle className="text-sm font-medium leading-tight">
            {task.title}
          </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
            <DropdownMenuItem
              onClick={() => deleteTask(task.projectId, task.id)}
              className="text-red-400 focus:text-red-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon('actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {task.description && (
          <p className="text-xs text-zinc-400 mb-2 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn('text-[10px] px-1.5 py-0', priorityColors[task.priority])}
          >
            {t(`priorities.${task.priority}`)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
