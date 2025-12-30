'use client';

import { Project } from '@/types/project';
import dynamic from 'next/dynamic';

const ProjectFiles = dynamic(() => import('@/components/projects/project-files').then(mod => mod.ProjectFiles));
const DriveBrowser = dynamic(() => import('@/components/projects/drive-browser').then(mod => mod.DriveBrowser));

interface FilesSectionProps {
  project: Project;
}

export function FilesSection({ project }: FilesSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ProjectFiles project={project} />
      <DriveBrowser project={project} />
    </div>
  );
}
