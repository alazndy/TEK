import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragEndEvent 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { ForgeJobCard } from './forge-job-card';
import { useForgeStore } from '@/stores/forge-store';
import { EditJobDialog } from '@/components/forge/edit-job-dialog';
import { ForgeJob } from '@/types/forge';

type Status = 'Pending' | 'In Progress' | 'Review' | 'Completed';

const COLUMNS: { id: Status; title: string; color: string }[] = [
  { id: 'Pending', title: 'Bekleyen', color: 'bg-zinc-500/10 border-zinc-500/20' },
  { id: 'In Progress', title: 'Üretimde', color: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'Review', title: 'Kontrol', color: 'bg-yellow-500/10 border-yellow-500/20' },
  { id: 'Completed', title: 'Tamamlandı', color: 'bg-green-500/10 border-green-500/20' },
];

export function KanbanBoard() {
  const { jobs, updateJobStatus } = useForgeStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<ForgeJob | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5,
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
        setActiveId(null);
        return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the job
    const job = jobs.find(j => j.id === activeId);
    if (!job) {
        setActiveId(null);
        return;
    }

    // Determine new status
    // If dropped on a column (droppable)
    let newStatus = overId as Status;
    
    // If dropped on another card (sortable)
    if (!COLUMNS.find(c => c.id === newStatus)) {
        const overJob = jobs.find(j => j.id === overId);
        if (overJob) {
            newStatus = overJob.status as Status; // Assuming simple status sync for now
        }
    }
    
    // Update if status changed
    if (job.status !== newStatus && ['Pending', 'In Progress', 'Review', 'Completed'].includes(newStatus)) {
        updateJobStatus(activeId, newStatus);
    }

    setActiveId(null);
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn 
            key={col.id} 
            id={col.id} 
            title={col.title} 
            className={col.color}
            jobs={jobs.filter(j => j.status === col.id)}
            onJobClick={setEditingJob}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
            <div className="rotate-3 cursor-grabbing opacity-90 scale-105">
                <ForgeJobCard job={jobs.find(j => j.id === activeId)!} isOverlay />
            </div>
        ) : null}
      </DragOverlay>

      <EditJobDialog 
        open={!!editingJob} 
        onOpenChange={(open) => !open && setEditingJob(null)}
        job={editingJob}
      />
    </DndContext>
  );
}
