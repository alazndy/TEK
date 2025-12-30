'use client';

import { motion } from 'framer-motion';
import { Project } from '@/types/project';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface RecentProjectsCarouselProps {
  projects: Project[];
}

export function RecentProjectsCarousel({ projects }: RecentProjectsCarouselProps) {
  return (
    <div className="relative group">
      <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x scrollbar-hide">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            whileHover={{ y: -5 }}
            className="flex-none w-[300px] snap-start"
          >
            <Link href={`/projects/${project.id}`}>
              <div className="glass-card p-5 border-[#2a4234] bg-[#1a2c22]/50 hover:bg-[#244732]/30 transition-all duration-300 h-full relative overflow-hidden group/card">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10 border border-border/50 bg-background/50 relative overflow-hidden">
                    {project.logoUrl ? (
                      <Image 
                        src={project.logoUrl} 
                        alt={project.name} 
                        fill 
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <AvatarFallback className="text-white font-bold" style={{ backgroundColor: project.color || '#3b82f6' }}>
                        {project.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{project.name}</h3>
                    <p className="text-[10px] text-[#93c8a8] uppercase tracking-tighter font-medium">{project.manager}</p>
                  </div>
                </div>
                
                <p className="text-xs text-[#93c8a8] line-clamp-2 mb-4 h-8">
                  {project.description}
                </p>

                <div className="space-y-3">
                   <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="text-[#93c8a8]">Progress</span>
                      <span className="text-primary">{project.completionPercentage || 0}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-[#0d1811] rounded-full overflow-hidden border border-[#2a4234]/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.completionPercentage || 0}%` }}
                        className="h-full shadow-lg"
                        style={{ 
                          backgroundColor: project.color || '#3b82f6',
                          boxShadow: `0 0 10px ${project.color || '#3b82f6'}66`
                        }}
                      />
                   </div>
                </div>

                <div className="absolute top-2 right-2 flex gap-1 items-center">
                   {project.isFavorite && (
                     <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                   )}
                   <Badge variant="outline" className="text-[8px] border-[#2a4234] text-[#93c8a8]">
                      {project.status}
                   </Badge>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
        
        {projects.length === 0 && (
          <div className="w-full text-center py-10 text-[#93c8a8] font-medium border border-dashed border-[#2a4234] rounded-2xl">
            {/* Translated empty state would be better, but for now: */}
            No projects found.
          </div>
        )}
      </div>
      
      {/* Decorative side fades */}
      <div className="absolute inset-y-0 left-0 w-8 bg-linear-to-r from-[#112117] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-y-0 right-0 w-8 bg-linear-to-l from-[#112117] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
