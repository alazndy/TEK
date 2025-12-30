'use client';

import { Project } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ProjectHeaderProps {
  project: Project;
  onSetGithubOpen: (open: boolean) => void;
  onSetEditOpen: (open: boolean) => void;
  onSetDeleteOpen: (open: boolean) => void;
}

export function ProjectHeader({ 
  project, 
  onSetGithubOpen, 
  onSetEditOpen, 
  onSetDeleteOpen 
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/projects" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Badge variant="outline" className="text-xs uppercase">{project.status}</Badge>
          {project.priority === 'High' && <Badge variant="destructive" className="text-xs">High Priority</Badge>}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={() => onSetGithubOpen(true)}>
          <Github className="mr-2 h-4 w-4" /> GitHub
        </Button>
        <Button variant="outline" onClick={() => onSetEditOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" onClick={() => onSetDeleteOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
}
