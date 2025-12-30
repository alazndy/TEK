'use client';

import { Project } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  User, 
  Target, 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  CheckCircle2 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface ProjectCardProps {
  project: Project;
  t: (key: string) => string;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleFavorite: (e: React.MouseEvent, project: Project) => void;
}

export function ProjectCard({ project, t, onEdit, onDelete, onToggleFavorite }: ProjectCardProps) {
  return (
    <motion.article 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 flex flex-col h-full group relative overflow-hidden"
    >
      {/* Gradient Ambient Background */}
      <div 
        className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
      />

      {/* Card Header */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <Badge className={cn(
          "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-none backdrop-blur-md flex items-center gap-2",
          project.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
          project.status === 'Planning' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
          project.status === 'On Hold' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
          "bg-zinc-800/50 text-zinc-400"
        )}>
          {project.status === 'Planning' && <Clock className="h-3 w-3" />}
          {project.status === 'Active' && <Play className="h-3 w-3 fill-current" />}
          {project.status === 'On Hold' && <Pause className="h-3 w-3" />}
          {project.status === 'Completed' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
          <span>{project.status}</span>
        </Badge>
        
        <div className="flex items-center gap-1">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[#a69db9] hover:text-white hover:bg-white/10">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card bg-[#1a1821] border-white/10 text-white min-w-[140px]">
              <DropdownMenuItem onClick={() => onEdit(project)} className="focus:bg-white/5 cursor-pointer gap-2">
                <Pencil className="h-3.5 w-3.5" />
                {t('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(project)} className="focus:bg-red-500/10 text-red-400 cursor-pointer gap-2">
                <Trash2 className="h-3.5 w-3.5" />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Logo & Info */}
      <Link href={`/projects/${project.id}`} className="flex-1 flex flex-col gap-4 relative z-10 group/content">
        <div className="flex items-center gap-4">
           {project.logoUrl ? (
             <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/10 bg-black/20 shrink-0 relative">
               <Image 
                 src={project.logoUrl} 
                 alt={project.name} 
                 fill 
                 className="object-cover"
                 sizes="48px"
               />
             </div>
           ) : (
             <div 
               className="h-12 w-12 rounded-2xl border border-white/10 flex items-center justify-center shrink-0"
               style={{ backgroundColor: `${project.color || '#3b82f6'}22` }}
             >
               <div className="h-6 w-6 rounded-lg" style={{ backgroundColor: project.color || '#3b82f6' }} />
             </div>
           )}
           <div className="min-w-0">
             <h3 className="text-xl font-bold text-white group-hover/content:text-primary transition-colors leading-tight truncate">
               {project.name}
             </h3>
             <div className="flex items-center gap-1.5 mt-0.5">
               <User className="h-3 w-3 text-[#a69db9]" />
               <p className="text-[9px] text-[#a69db9] font-black uppercase tracking-widest">{project.manager}</p>
             </div>
           </div>
        </div>
        <p className="text-sm text-[#a69db9] leading-relaxed line-clamp-2 min-h-[40px]">
          {project.description}
        </p>
      </Link>

      {/* Progress Bar */}
      <div className="mt-6 mb-5 relative z-10">
        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest mb-2">
           <div className="flex items-center gap-1.5 text-[#a69db9]">
             <Target className="h-3.5 w-3.5" />
             <span>{t('progress')}</span>
           </div>
          <span className="text-white">{project.completionPercentage}%</span>
        </div>
        <div className="w-full bg-[#2e2839] rounded-full h-1.5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${project.completionPercentage}%` }}
            className="h-full rounded-full transition-all duration-1000"
            style={{ backgroundColor: project.color || '#3b82f6', boxShadow: `0 0 10px ${project.color || '#3b82f6'}88` }}
          />
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex justify-between items-center mt-auto pt-5 border-t border-white/5 relative z-10">
        <div className="flex -space-x-2">
           {[1, 2, 3].map((i) => (
             <div key={i} className="h-8 w-8 rounded-full border-2 border-[#131118] bg-[#2e2839] flex items-center justify-center text-[10px] font-bold text-white">
               U{i}
             </div>
           ))}
           <div className="h-8 w-8 rounded-full border-2 border-[#131118] bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
             +2
           </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#a69db9] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{project.deadline ? project.deadline : 'NO DATE'}</span>
        </div>
      </div>
    </motion.article>
  );
}
