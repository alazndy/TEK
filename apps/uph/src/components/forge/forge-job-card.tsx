import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ForgeJob } from '@/types/forge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GripVertical, Clock, AlertCircle } from 'lucide-react';

interface ForgeJobCardProps {
  job: ForgeJob;
  isOverlay?: boolean;
  onClick?: () => void;
}

export function ForgeJobCard({ job, isOverlay, onClick }: ForgeJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityColor = {
    High: 'bg-red-500/20 text-red-400 border-red-500/50',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    Low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  }[job.priority] || 'bg-zinc-500/20 text-zinc-400';

  return (
    <Card 
        ref={setNodeRef} 
        style={style} 
        onClick={onClick}
        className={`bg-zinc-900 border-white/10 hover:border-cyan-500/30 transition-colors group relative ${isOverlay ? 'shadow-2xl border-cyan-500/50' : 'cursor-pointer'}`}
    >
      <CardHeader className="p-3 pb-0 space-y-0">
        <div className="flex justify-between items-start gap-2">
            <div className="space-y-1">
                <Badge variant="outline" className={`text-xs ${priorityColor} border`}>
                    {job.priority}
                </Badge>
                <CardTitle className="text-sm font-medium leading-tight">
                    {job.project}
                </CardTitle>
            </div>
            <button {...attributes} {...listeners} className="text-zinc-600 hover:text-white cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
            </button>
        </div>
      </CardHeader>
      
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <span className="font-mono">{job.id}</span>
            <span>•</span>
            <span>{job.add_date}</span>
        </div>

        <div className="space-y-1 mb-3">
            <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{job.step}</span>
                <span className="font-bold text-cyan-500">%{job.progress}</span>
            </div>
            <Progress value={job.progress} className="h-1.5 bg-zinc-800" indicatorClassName="bg-cyan-600"/>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5 border border-white/10">
                <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-300">
                    {job.technician?.slice(0, 2).toUpperCase() || 'NA'}
                </AvatarFallback>
            </Avatar>
            <span className="text-xs text-zinc-400">{job.technician || 'Atanmamış'}</span>
         </div>
         {job.status === 'Delayed' && (
             <AlertCircle className="w-4 h-4 text-orange-500" />
         )}
      </CardFooter>
    </Card>
  );
}
