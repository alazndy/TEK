'use client';

import { Project } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  Pencil, 
  Trash2, 
  ExternalLink,
  Clock,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface ProjectListItemProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleFavorite: (e: React.MouseEvent, project: Project) => void;
}

export function ProjectListItem({ project, onEdit, onDelete, onToggleFavorite }: ProjectListItemProps) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-all group">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
           <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
             {project.logoUrl ? (
               <Image 
                 src={project.logoUrl} 
                 alt={project.name} 
                 fill 
                 className="object-cover"
                 sizes="40px"
               />
             ) : (
               <div className={`h-5 w-5 rounded-md shadow-sm bg-[${project.color || '#3b82f6'}]`} />
             )}
           </div>
           <div className="min-w-0">
             <p className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">{project.name}</p>
             <p className="text-[10px] text-[#a69db9] font-black uppercase tracking-widest mt-0.5">{project.manager}</p>
           </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex justify-center">
          <Badge className={cn(
            "rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest border-none flex items-center gap-1.5",
            project.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" :
            project.status === 'Planning' ? "bg-blue-500/10 text-blue-400" :
            project.status === 'On Hold' ? "bg-orange-500/10 text-orange-400" :
            "bg-zinc-800/50 text-zinc-400"
          )}>
            {project.status === 'Planning' && <Clock className="h-3 w-3" />}
            {project.status === 'Active' && <Play className="h-3 w-3 fill-current" />}
            {project.status === 'On Hold' && <Pause className="h-3 w-3" />}
            {project.status === 'Completed' && <CheckCircle2 className="h-3 w-3" />}
            <span>{project.status}</span>
          </Badge>
        </div>
      </td>
      <td className="px-6 py-5">
         <div className="flex items-center gap-3 w-40">
           <div className="flex-1 h-1.5 bg-[#2e2839] rounded-full overflow-hidden">
             <div 
               className={`h-full rounded-full bg-[${project.color || '#3b82f6'}] w-[${project.completionPercentage}%]`} 
             />
           </div>
           <span className="text-[10px] text-white font-bold w-8">{project.completionPercentage}%</span>
         </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full transition-all",
              project.isFavorite ? "text-yellow-500" : "text-[#a69db9] opacity-40 group-hover:opacity-100 hover:bg-white/10"
            )}
            onClick={(e) => onToggleFavorite(e, project)}
          >
            <Star className={cn("h-4 w-4", project.isFavorite && "fill-current")} />
          </Button>
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(project)} 
            className="h-9 w-9 text-[#a69db9] hover:text-white rounded-full hover:bg-white/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Link href={`/projects/${project.id}`}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-[#a69db9] hover:text-primary rounded-full hover:bg-white/10"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(project)} 
            className="h-9 w-9 text-[#a69db9] hover:text-red-400 rounded-full hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
