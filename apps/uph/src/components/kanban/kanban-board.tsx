'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useKanbanStore, KanbanTask, TaskStatus } from '@/stores/kanban-store';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { AddTaskDialog } from './add-task-dialog';
import { KanbanFilters } from './kanban-filter-popover';
import { KanbanViewMode } from './kanban-view-popover';

interface KanbanBoardProps {
  filters?: KanbanFilters;
  viewMode?: KanbanViewMode;
}

export function KanbanBoard({ filters, viewMode = 'default' }: KanbanBoardProps) {
  const { columns, moveTask, batchReorder, fetchGlobalTasks } = useKanbanStore();
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [addTaskColumn, setAddTaskColumn] = useState<TaskStatus | null>(null);

  useEffect(() => {
    fetchGlobalTasks();
  }, [fetchGlobalTasks]);

  // Apply filters to columns
  const filteredColumns = useMemo(() => {
    if (!filters || (filters.priorities.length === 0 && filters.projectIds.length === 0)) {
      return columns;
    }

    return columns.map(column => ({
      ...column,
      tasks: column.tasks.filter(task => {
        const priorityMatch = filters.priorities.length === 0 || filters.priorities.includes(task.priority);
        const projectMatch = filters.projectIds.length === 0 || filters.projectIds.includes(task.projectId);
        return priorityMatch && projectMatch;
      }),
    }));
  }, [columns, filters]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap(c => c.tasks)
      .find(t => t.id === active.id);
    
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source task and column
    let sourceColumnId: TaskStatus | null = null;
    let sourceTask: KanbanTask | null = null;
    
    for (const col of columns) {
      const task = col.tasks.find(t => t.id === activeId);
      if (task) {
        sourceColumnId = col.id;
        sourceTask = task;
        break;
      }
    }

    if (!sourceColumnId || !sourceTask) {
      setActiveTask(null);
      return;
    }

    // Identify target column
    let targetColumnId: TaskStatus | null = null;
    
    // Case 1: Dropped directly on a column container
    const directColumn = columns.find(c => c.id === overId);
    if (directColumn) {
        targetColumnId = directColumn.id;
    } else {
        // Case 2: Dropped on another task
        for (const col of columns) {
            if (col.tasks.some(t => t.id === overId)) {
                targetColumnId = col.id;
                break;
            }
        }
    }

    if (!targetColumnId) {
        setActiveTask(null);
        return;
    }

    // Logic for same column vs different column
    if (sourceColumnId === targetColumnId) {
        // Reordering within the same column
        const column = columns.find(c => c.id === sourceColumnId)!;
        const oldIndex = column.tasks.findIndex(t => t.id === activeId);
        const newIndex = column.tasks.findIndex(t => t.id === overId);

        if (oldIndex !== newIndex) {
            // Calculate new order locally using arrayMove
            const newTasks = arrayMove(column.tasks, oldIndex, newIndex);
            // Persist new order
            await batchReorder(newTasks);
        }
    } else {
        // Moving to a different column
        // If dropped on a column (empty or end), index is length. 
        // If dropped on a task, finding index of that task.
        const targetColumn = columns.find(c => c.id === targetColumnId)!;
        let newIndex = targetColumn.tasks.length;
        
        if (!directColumn) {
            const overIndex = targetColumn.tasks.findIndex(t => t.id === overId);
            newIndex = overIndex >= 0 ? overIndex : newIndex;
        }

        await moveTask(sourceTask, targetColumnId, newIndex);
    }

    setActiveTask(null);
  };

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {filteredColumns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddTask={() => setAddTaskColumn(column.id)}
              isCompact={viewMode === 'compact'}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 scale-105">
              <KanbanCard task={activeTask} isCompact={viewMode === 'compact'} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <AddTaskDialog
        open={addTaskColumn !== null}
        onOpenChange={(open: boolean) => !open && setAddTaskColumn(null)}
        defaultStatus={addTaskColumn || 'todo'}
      />
    </div>
  );
}
