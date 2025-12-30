import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ForgeJob } from '@/types/forge';
import { ForgeJobCard } from './forge-job-card';

interface KanbanColumnProps {
  id: string;
  title: string;
  jobs: ForgeJob[];
  className?: string;
  onJobClick?: (job: ForgeJob) => void;
}

export function KanbanColumn({ id, title, jobs, className, onJobClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`flex flex-col rounded-xl border p-4 h-full min-h-[600px] ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded text-muted-foreground">
          {jobs.length}
        </span>
      </div>

      <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 flex flex-col gap-3">
          {jobs.map((job) => (
            <ForgeJobCard key={job.id} job={job} onClick={() => onJobClick?.(job)} />
          ))}
        </div>
      </SortableContext>
      
      {jobs.length === 0 && (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg text-muted-foreground/30 text-sm">
              Bu aşamada iş yok
          </div>
      )}
    </div>
  );
}
