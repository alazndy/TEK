'use client';

import { useResourceStore } from '@/stores/resource-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ProjectResourcesProps {
  projectId: string;
  projectName: string;
}

export function ProjectResources({ projectId, projectName }: ProjectResourcesProps) {
  const { resources, calculateHeatmapData } = useResourceStore();
  
  // Find resources assigned to this project
  const projectResources = resources.filter(r => 
    r.currentAssignments.some(a => a.projectId === projectId)
  );

  // Get heatmap data for next 14 days
  const heatmapData = calculateHeatmapData(new Date(), 14);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Proje Kaynakları</h3>
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {projectResources.length} kişi atanmış
        </Badge>
      </div>

      {projectResources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/50 p-12 text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">Bu projeye henüz kaynak atanmamış.</p>
          <p className="text-muted-foreground text-xs mt-1">Kaynak planlaması için yönetim panelini kullanın.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projectResources.map((resource) => {
            const assignment = resource.currentAssignments.find(a => a.projectId === projectId);
            if (!assignment) return null;

            const resourceHeatmap = heatmapData.find(h => h.userId === resource.userId);
            const avgUtilization = resourceHeatmap 
              ? Math.round(resourceHeatmap.dailyData.reduce((sum, d) => sum + d.utilization, 0) / resourceHeatmap.dailyData.length)
              : 0;

            return (
              <Card key={resource.userId} className="bg-zinc-950/50 border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {resource.displayName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm">{resource.displayName}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">{resource.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{assignment.hoursPerDay} saat/gün</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{format(new Date(assignment.endDate), 'dd MMM', { locale: tr })}'e kadar</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Kullanım Oranı</span>
                      <span className={avgUtilization > 100 ? 'text-red-400' : avgUtilization > 80 ? 'text-amber-400' : 'text-green-400'}>
                        %{avgUtilization}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(avgUtilization, 100)} 
                      className="h-1.5"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
