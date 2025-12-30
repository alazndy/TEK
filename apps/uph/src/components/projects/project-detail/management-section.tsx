'use client';

import { Project } from '@/types/project';
import { Product, ProjectUsage } from '@/types/inventory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectTasks = dynamic(() => import('@/components/projects/project-tasks').then(mod => mod.ProjectTasks));
const KanbanBoard = dynamic(() => import('@/components/projects/kanban-board').then(mod => mod.KanbanBoard));
const ProjectGantt = dynamic(() => import('@/components/projects/project-gantt').then(mod => mod.ProjectGantt));
const ProjectFinancials = dynamic(() => import('@/components/projects/project-financials').then(mod => mod.ProjectFinancials));

interface ManagementSectionProps {
  project: Project;
  projectInventory: ProjectUsage[];
  products: Product[];
  system: any;
  syncGitHubIssues: (id: string) => Promise<void>;
}

export function ManagementSection({
  project,
  projectInventory,
  products,
  system,
  syncGitHubIssues
}: ManagementSectionProps) {
  return (
    <Tabs defaultValue="tasks" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
        <TabsTrigger value="tasks">Liste</TabsTrigger>
        <TabsTrigger value="board">Pano</TabsTrigger>
        <TabsTrigger value="timeline">Zaman</TabsTrigger>
        <TabsTrigger value="finance">Finans</TabsTrigger>
      </TabsList>
      
      <div className="mt-4">
        <TabsContent value="tasks">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">Proje Görevleri</h2>
              <Button variant="outline" size="sm" onClick={() => {
                alert("ENV-I ile iletişim kuruluyor...\nStok Durumu: YETERLİ (Mock)");
              }}>
                ENV-I Stok Kontrolü (Mock)
              </Button>
            </div>
            {system.integrations.github && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => syncGitHubIssues(project.id)}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                GitHub&apos;dan Eşitle
              </Button>
            )}
          </div>
          <ProjectTasks project={project} />
        </TabsContent>
        <TabsContent value="board">
          <KanbanBoard projectId={project.id} />
        </TabsContent>
        <TabsContent value="timeline">
          <ProjectGantt project={project} />
        </TabsContent>
        <TabsContent value="finance">
          <ProjectFinancials 
            project={project} 
            projectInventory={projectInventory} 
            allProducts={products} 
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
