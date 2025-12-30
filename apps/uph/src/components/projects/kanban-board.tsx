'use client';

import { useState, useEffect } from 'react';
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
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProjectTask, TaskStatus } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Eye, ListTodo, GripVertical } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';

interface KanbanBoardProps {
  projectId: string; // Changed from tasks prop to projectId
}

const COLUMNS: { id: TaskStatus; title: string; icon: React.ReactNode; color: string }[] = [
  { id: 'todo', title: 'To Do', icon: <ListTodo className="h-4 w-4" />, color: 'bg-slate-500' },
  { id: 'in-progress', title: 'In Progress', icon: <Clock className="h-4 w-4" />, color: 'bg-blue-500' },
  { id: 'review', title: 'Review', icon: <Eye className="h-4 w-4" />, color: 'bg-yellow-500' },
  { id: 'done', title: 'Done', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-500' },
];

// Sortable Task Card
function SortableTaskCard({ task }: { task: ProjectTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <CardContent className="p-3 flex items-center gap-2">
          <div {...listeners} className="text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{task.title}</p>
            {task.dueDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Task Card for Overlay (during drag)
function TaskCard({ task }: { task: ProjectTask }) {
  return (
    <Card className="cursor-grabbing shadow-lg">
      <CardContent className="p-3 flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{task.title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Droppable Column
function KanbanColumn({
  column,
  tasks,
}: {
  column: typeof COLUMNS[number];
  tasks: ProjectTask[];
}) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'column' },
  });

  return (
    <Card className="flex-1 min-w-[250px] bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className={`p-1 rounded ${column.color} text-white`}>
            {column.icon}
          </span>
          {column.title}
          <Badge variant="secondary" className="ml-auto">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef} className="space-y-2 min-h-[200px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed rounded-lg">
            Drop tasks here
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { getProjectTasks, updateTaskStatus, fetchProjectTasks } = useProjectStore();
  const tasks = getProjectTasks(projectId);
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);

  useEffect(() => {
      fetchProjectTasks(projectId);
  }, [projectId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = COLUMNS.find((col) => col.id === overId);
    if (targetColumn) {
      updateTaskStatus(projectId, taskId, targetColumn.id);
      return;
    }

    // Check if dropped on another task (get its column)
    const targetTask = tasks.find((t) => t.id === overId);
    if (targetTask && targetTask.status) {
      updateTaskStatus(projectId, taskId, targetTask.status);
    }
  };

  // Group tasks by status
  const tasksByStatus = COLUMNS.reduce((acc, column) => {
    acc[column.id] = tasks.filter((t) => (t.status || 'todo') === column.id);
    return acc;
  }, {} as Record<TaskStatus, ProjectTask[]>);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
