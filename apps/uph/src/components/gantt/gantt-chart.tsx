'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  GanttTask, 
  GanttViewConfig, 
  GANTT_STATUS_COLORS,
  GANTT_PRIORITY_COLORS 
} from '@/types/gantt';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  Calendar,
  Milestone,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface GanttChartProps {
  tasks: GanttTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  onTaskClick?: (task: GanttTask) => void;
  startDate?: Date;
  endDate?: Date;
  className?: string;
}

const VIEW_MODES = [
  { value: 'day', label: 'Gün' },
  { value: 'week', label: 'Hafta' },
  { value: 'month', label: 'Ay' },
];

export function GanttChart({
  tasks,
  onTaskUpdate,
  onTaskClick,
  startDate: propStartDate,
  endDate: propEndDate,
  className,
}: GanttChartProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Calculate date range based on tasks or props
  const dateRange = useMemo(() => {
    if (propStartDate && propEndDate) {
      return { start: propStartDate, end: propEndDate };
    }
    
    if (tasks.length === 0) {
      const today = new Date();
      return { 
        start: startOfWeek(today, { locale: tr }), 
        end: addDays(today, 30) 
      };
    }
    
    const dates = tasks.flatMap(t => [new Date(t.startDate), new Date(t.endDate)]);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    return {
      start: addDays(minDate, -7),
      end: addDays(maxDate, 14),
    };
  }, [tasks, propStartDate, propEndDate]);
  
  // Generate columns (days)
  const columns = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);
  
  // Column width based on view mode
  const columnWidth = useMemo(() => {
    switch (viewMode) {
      case 'day': return 60;
      case 'week': return 30;
      case 'month': return 15;
      default: return 30;
    }
  }, [viewMode]);
  
  const rowHeight = 48;
  const headerHeight = 60;
  const sidebarWidth = 280;
  
  // Calculate task position and width
  const getTaskStyle = useCallback((task: GanttTask) => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    
    const startOffset = differenceInDays(startDate, dateRange.start);
    const duration = differenceInDays(endDate, startDate) + 1;
    
    return {
      left: startOffset * columnWidth,
      width: Math.max(duration * columnWidth - 4, 20),
    };
  }, [dateRange.start, columnWidth]);
  
  // Navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'day' ? 7 : viewMode === 'week' ? 14 : 30;
    setCurrentDate(prev => addDays(prev, direction === 'next' ? days : -days));
  };
  
  // Sort tasks by order
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.order - b.order);
  }, [tasks]);

  return (
    <div className={cn('flex flex-col bg-background border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            <Calendar className="h-4 w-4 mr-2" />
            Bugün
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEW_MODES.map(mode => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Task list */}
        <div 
          className="flex-shrink-0 border-r bg-muted/20"
          style={{ width: sidebarWidth }}
        >
          {/* Header */}
          <div 
            className="flex items-center px-4 border-b font-medium text-sm text-muted-foreground"
            style={{ height: headerHeight }}
          >
            Görevler ({sortedTasks.length})
          </div>
          
          {/* Task rows */}
          <div className="overflow-y-auto">
            {sortedTasks.map((task, index) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-2 px-3 border-b cursor-pointer hover:bg-muted/50 transition-colors',
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                )}
                style={{ height: rowHeight }}
                onClick={() => onTaskClick?.(task)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                
                {task.isMilestone && (
                  <Milestone className="h-4 w-4 text-amber-500 flex-shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{task.title}</div>
                  {task.assigneeName && (
                    <div className="text-xs text-muted-foreground truncate">
                      {task.assigneeName}
                    </div>
                  )}
                </div>
                
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: GANTT_STATUS_COLORS[task.status],
                    color: GANTT_STATUS_COLORS[task.status]
                  }}
                >
                  {task.progress}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right side - Timeline */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {/* Timeline header */}
          <div 
            className="sticky top-0 z-10 flex border-b bg-muted/30"
            style={{ height: headerHeight, minWidth: columns.length * columnWidth }}
          >
            {columns.map((date, i) => {
              const isWeekStart = date.getDay() === 1;
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={i}
                  className={cn(
                    'flex-shrink-0 flex flex-col items-center justify-center border-r text-xs',
                    isTodayDate && 'bg-primary/10',
                    isWeekStart && 'border-l-2 border-l-muted-foreground/20'
                  )}
                  style={{ width: columnWidth }}
                >
                  <span className="text-muted-foreground">
                    {format(date, 'EEE', { locale: tr })}
                  </span>
                  <span className={cn('font-medium', isTodayDate && 'text-primary')}>
                    {format(date, 'd')}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Timeline grid */}
          <div 
            className="relative"
            style={{ 
              minWidth: columns.length * columnWidth,
              height: sortedTasks.length * rowHeight 
            }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 flex">
              {columns.map((date, i) => {
                const isTodayDate = isToday(date);
                const isWeekStart = date.getDay() === 1;
                
                return (
                  <div
                    key={i}
                    className={cn(
                      'h-full border-r',
                      isTodayDate && 'bg-primary/5',
                      isWeekStart && 'border-l border-l-muted-foreground/30'
                    )}
                    style={{ width: columnWidth }}
                  />
                );
              })}
            </div>
            
            {/* Today line */}
            {columns.some(d => isToday(d)) && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary z-20"
                style={{
                  left: differenceInDays(new Date(), dateRange.start) * columnWidth + columnWidth / 2,
                }}
              />
            )}
            
            {/* Task bars */}
            {sortedTasks.map((task, index) => {
              const style = getTaskStyle(task);
              const color = task.color || GANTT_STATUS_COLORS[task.status];
              
              return (
                <TooltipProvider key={task.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'absolute rounded-md cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] z-10',
                          task.isMilestone && 'rotate-45'
                        )}
                        style={{
                          top: index * rowHeight + 8,
                          left: style.left + 2,
                          width: task.isMilestone ? 24 : style.width,
                          height: task.isMilestone ? 24 : rowHeight - 16,
                          backgroundColor: color,
                        }}
                        onClick={() => onTaskClick?.(task)}
                      >
                        {/* Progress bar */}
                        {!task.isMilestone && (
                          <>
                            <div
                              className="absolute inset-y-0 left-0 rounded-l-md bg-white/30"
                              style={{ width: `${task.progress}%` }}
                            />
                            <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                              <span className="text-xs font-medium text-white truncate">
                                {task.title}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(task.startDate), 'dd MMM', { locale: tr })} - {format(new Date(task.endDate), 'dd MMM', { locale: tr })}
                        </div>
                        <div className="text-xs">İlerleme: {task.progress}%</div>
                        {task.assigneeName && (
                          <div className="text-xs">Atanan: {task.assigneeName}</div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
            
            {/* Dependency lines */}
            <svg 
              className="absolute inset-0 pointer-events-none z-0" 
              style={{ width: '100%', height: '100%' }}
            >
              {sortedTasks.flatMap(task => {
                if (!task.dependencies || task.dependencies.length === 0) return [];
                
                return task.dependencies.map(depId => {
                  const dependencyTask = sortedTasks.find(t => t.id === depId);
                  
                  // Skip if dependent task is not found or not in current view
                  // or if it's a self-dependency (safety check)
                  if (!dependencyTask || task.id === depId) return null;
                  
                  // Calculate coordinates (connecting Finish-to-Start usually)
                  const depStyle = getTaskStyle(dependencyTask);
                  const taskStyle = getTaskStyle(task);
                  
                  // Find row indices to determine vertical positions
                  const depIndex = sortedTasks.indexOf(dependencyTask);
                  const taskIndex = sortedTasks.indexOf(task);
                  
                  if (depIndex === -1 || taskIndex === -1) return null;
                  
                  // Start point: End of dependency task
                  const x1 = depStyle.left + depStyle.width;
                  const y1 = depIndex * rowHeight + (rowHeight / 2);
                  
                  // End point: Start of current task
                  const x2 = taskStyle.left;
                  const y2 = taskIndex * rowHeight + (rowHeight / 2);
                  
                  // Control points for bezier curve
                  const controlOffset = 20;
                  
                  // Draw path
                  // M x1 y1: Move to start
                  // C ...: Quadratic bezier curve
                  return (
                    <path
                      key={`${depId}-${task.id}`}
                      d={`M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      className="opacity-60 hover:opacity-100 hover:stroke-primary transition-all duration-300"
                    />
                  );
                });
              })}
              
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
