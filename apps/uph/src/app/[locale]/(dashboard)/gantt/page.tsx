'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GanttChart } from '@/components/gantt/gantt-chart';
import { useGanttStore, createSampleGanttTasks } from '@/stores/gantt-store';
import { useProjectStore } from '@/stores/project-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Download, Loader2 } from 'lucide-react';
import { GanttTask } from '@/types/gantt';

export default function GanttPage() {
  const t = useTranslations('Common');
  const { tasks, isLoading, error, subscribeToTasks, unsubscribeAll, updateTask } = useGanttStore();
  const { projects, fetchProjects } = useProjectStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [isCreatingSamples, setIsCreatingSamples] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId === 'all') {
      subscribeToTasks();
    } else {
      subscribeToTasks(selectedProjectId);
    }

    return () => {
      unsubscribeAll();
    };
  }, [selectedProjectId, subscribeToTasks, unsubscribeAll]);

  const handleTaskClick = (task: GanttTask) => {
    console.log('Task clicked:', task);
    // TODO: Open task detail dialog
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<GanttTask>) => {
    await updateTask(taskId, updates);
  };

  const handleCreateSamples = async () => {
    if (!selectedProjectId || selectedProjectId === 'all') {
      alert('Lütfen önce bir proje seçin');
      return;
    }

    setIsCreatingSamples(true);
    try {
      await createSampleGanttTasks(selectedProjectId);
    } catch (error) {
      console.error('Error creating samples:', error);
    } finally {
      setIsCreatingSamples(false);
    }
  };

  const filteredTasks = selectedProjectId === 'all' 
    ? tasks 
    : tasks.filter(t => t.projectId === selectedProjectId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gantt Şeması</h1>
          <p className="text-muted-foreground">
            Proje zaman çizelgesini görselleştirin ve takip edin
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Proje Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Projeler</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleCreateSamples} disabled={isCreatingSamples}>
            {isCreatingSamples ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Örnek Görevler
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* Gantt Chart */}
      {!isLoading && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Zaman Çizelgesi</CardTitle>
            <CardDescription>
              {filteredTasks.length} görev • Görev çubuğuna tıklayarak detayları görüntüleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Bu projede henüz Gantt görevi yok.</p>
                <p className="text-sm mt-2">
                  Örnek görevler oluşturmak için yukarıdaki "Örnek Görevler" butonuna tıklayın.
                </p>
              </div>
            ) : (
              <GanttChart
                tasks={filteredTasks}
                onTaskClick={handleTaskClick}
                onTaskUpdate={handleTaskUpdate}
                className="h-[500px]"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {filteredTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Toplam Görev
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tamamlanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {filteredTasks.filter(t => t.status === 'done').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Devam Eden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {filteredTasks.filter(t => t.status === 'in-progress').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ortalama İlerleme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(filteredTasks.reduce((sum, t) => sum + t.progress, 0) / filteredTasks.length || 0)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
