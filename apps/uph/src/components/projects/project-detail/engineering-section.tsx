'use client';

import { Project } from '@/types/project';
import { Product } from '@/types/inventory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';
import { BOMExtractor } from './bom-extractor';
import { ProjectECRList } from './project-ecr-list';
import { ProjectECOList } from './project-eco-list';
import { ProjectResources } from './project-resources';

const ProjectDesigns = dynamic(() => import('@/components/projects/project-designs').then(mod => mod.ProjectDesigns));
const ProjectPCBDesigns = dynamic(() => import('@/components/projects/project-pcb-designs').then(mod => mod.ProjectPCBDesigns));
const ProjectCadDrawings = dynamic(() => import('@/components/projects/project-cad-drawings').then(mod => mod.ProjectCadDrawings));
const Project3DModels = dynamic(() => import('@/components/projects/project-3d-models').then(mod => mod.Project3DModels));

interface EngineeringSectionProps {
  project: Project;
  weaveEnabled: boolean;
  envEnabled: boolean;
  products: Product[];
}

export function EngineeringSection({
  project,
  weaveEnabled,
  envEnabled,
  products
}: EngineeringSectionProps) {
  return (
    <Tabs defaultValue="ecr" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 lg:w-[900px]">
        <TabsTrigger value="ecr">ECR</TabsTrigger>
        <TabsTrigger value="eco">ECO</TabsTrigger>
        <TabsTrigger value="resources">Kaynaklar</TabsTrigger>
        {weaveEnabled && <TabsTrigger value="designs">Weave</TabsTrigger>}
        <TabsTrigger value="pcb">PCB</TabsTrigger>
        <TabsTrigger value="cad">CAD</TabsTrigger>
        <TabsTrigger value="3d">3D</TabsTrigger>
        {weaveEnabled && <TabsTrigger value="bom">BOM</TabsTrigger>}
      </TabsList>

      <div className="mt-6">
        {/* ECR/ECO/Resources - Project Scoped */}
        <TabsContent value="ecr">
          <ProjectECRList projectId={project.id} />
        </TabsContent>
        <TabsContent value="eco">
          <ProjectECOList projectId={project.id} />
        </TabsContent>
        <TabsContent value="resources">
          <ProjectResources projectId={project.id} projectName={project.name} />
        </TabsContent>

        {/* Design Assets */}
        {weaveEnabled && (
          <TabsContent value="designs">
            <ProjectDesigns project={project} />
          </TabsContent>
        )}
        <TabsContent value="pcb">
          <ProjectPCBDesigns project={project} />
        </TabsContent>
        <TabsContent value="cad">
          <ProjectCadDrawings project={project} />
        </TabsContent>
        <TabsContent value="3d">
          <Project3DModels project={project} />
        </TabsContent>
        {weaveEnabled && (
          <TabsContent value="bom">
            <BOMExtractor 
              project={project} 
              envEnabled={envEnabled} 
              products={products} 
            />
          </TabsContent>
        )}
      </div>
    </Tabs>
  );
}

