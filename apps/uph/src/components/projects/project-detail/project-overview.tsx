'use client';

import { Project } from '@/types/project';
import { ProjectUsage } from '@/types/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
    Calendar, 
    DollarSign, 
    Box, 
    LayoutDashboard,
    FileText,
    Github,
    Package,
    RefreshCw
} from 'lucide-react';
import { GitHubStats } from '@/components/projects/github-stats';
import { MarkdownViewer } from '@/components/ui/markdown-viewer';

interface ProjectOverviewProps {
  project: Project;
  projectInventory: ProjectUsage[];
  system: any;
  envEnabled: boolean;
  syncProjectReadme: (id: string) => Promise<void>;
  onSetGithubOpen: (open: boolean) => void;
  onSetInventoryOpen: (open: boolean) => void;
}

export function ProjectOverview({
  project,
  projectInventory,
  system,
  envEnabled,
  syncProjectReadme,
  onSetGithubOpen,
  onSetInventoryOpen
}: ProjectOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bütçe Durumu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${project.spent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mb-2">/ ${project.budget.toLocaleString()}</p>
            <Progress value={(project.spent / project.budget) * 100} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Zaman Çizelgesi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{project.deadline ? new Date(project.deadline).toLocaleDateString('tr-TR') : 'Belirsiz'}</div>
            <p className="text-xs text-muted-foreground mt-1">Bitiş Tarihi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Envanter</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{projectInventory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Atanan Kalem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tamamlanma</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{project.completionPercentage}%</div>
            <Progress value={project.completionPercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* GitHub Stats Integration */}
      {system.integrations.github && project.githubRepo && (
        <div className="animate-fade-in-up">
          <GitHubStats repoUrl={`https://github.com/${project.githubRepo}`} />
        </div>
      )}

      {/* Scope & Description */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Proje Kapsamı
            </CardTitle>
            {project.githubRepo && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs gap-2"
                onClick={() => syncProjectReadme(project.id)}
              >
                <RefreshCw className="h-3 w-3" />
                README&apos;den Eşitle
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <MarkdownViewer 
              content={project.readmeContent || project.scope || project.description || ""} 
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => onSetGithubOpen(true)}>
              <Github className="mr-2 h-4 w-4" /> GitHub Bağla
            </Button>
            {envEnabled && (
              <Button variant="outline" className="w-full justify-start" onClick={() => onSetInventoryOpen(true)}>
                <Package className="mr-2 h-4 w-4" /> Malzeme Ekle
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
