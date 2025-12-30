
"use client";

import React, { useMemo, useEffect } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { Project } from '@/types/project';
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from 'next-themes';
import { useProjectStore } from '@/stores/project-store';

interface ProjectGanttProps {
    project: Project;
}

export function ProjectGantt({ project }: ProjectGanttProps) {
    const { theme } = useTheme();
    const { getProjectTasks, fetchProjectTasks } = useProjectStore();
    const projectTasks = getProjectTasks(project.id);
    
    useEffect(() => {
        fetchProjectTasks(project.id);
    }, [project.id]);

    const tasks: Task[] = useMemo(() => {
        if (!projectTasks || projectTasks.length === 0) {
            // Return a dummy task if empty to prevent errors or show empty state
            return [{
                start: new Date(project.startDate),
                end: new Date(project.deadline || new Date(Date.now() + 86400000)),
                name: "Proje Süreci",
                id: "project-root",
                type: "project",
                progress: project.completionPercentage,
                isDisabled: true,
                styles: { progressColor: '#6366f1', progressSelectedColor: '#ff9e0d' },
            }];
        }

        const projectStart = new Date(project.startDate);
        
        return projectTasks.map((t, index) => {
            // Logic to determine start/end dates
            // If no specific dates, stagger them purely for visualization
            const startDate = new Date(projectStart);
            startDate.setDate(projectStart.getDate() + (index * 2)); // Stagger by 2 days

            let endDate = new Date(startDate);
            if (t.dueDate) {
                endDate = new Date(t.dueDate);
            } else {
                endDate.setDate(startDate.getDate() + 2); // Default duration 2 days
            }

            // Ensure end date is after start date
            if (endDate <= startDate) {
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);
            }

            return {
                start: startDate,
                end: endDate,
                name: t.title,
                id: t.id,
                type: "task",
                progress: t.status === 'done' ? 100 : (t.status === 'in-progress' ? 50 : 0),
                isDisabled: false, // Could enable editing in future
                styles: { 
                    progressColor: t.status === 'done' ? '#10b981' : '#3b82f6', 
                    progressSelectedColor: '#ff9e0d',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#e5e7eb',
                    backgroundSelectedColor: theme === 'dark' ? '#374151' : '#d1d5db',
                },
            };
        });
    }, [project, projectTasks, theme]);

    const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Day);

    const isDark = theme === 'dark';

    return (
        <Card className="h-full">
            <CardContent className="h-[500px] overflow-hidden p-0 rounded-lg">
                <div className="flex justify-end p-2 gap-2 bg-muted/20 border-b">
                     <button className="text-xs border rounded px-2 py-1" onClick={() => setViewMode(ViewMode.Day)}>Gün</button>
                     <button className="text-xs border rounded px-2 py-1" onClick={() => setViewMode(ViewMode.Week)}>Hafta</button>
                     <button className="text-xs border rounded px-2 py-1" onClick={() => setViewMode(ViewMode.Month)}>Ay</button>
                </div>
                {tasks.length > 0 ? (
                    <Gantt
                        tasks={tasks}
                        viewMode={viewMode}
                        locale="tr"
                        arrowColor={isDark ? "#4b5563" : "#9ca3af"}
                        fontFamily="Inter, sans-serif"
                        fontSize="12px"
                        rowHeight={40}
                        columnWidth={viewMode === ViewMode.Month ? 150 : 60}
                        listCellWidth="155px"
                        barBackgroundColor={isDark ? "#374151" : "#aeb8c2"}
                        barBackgroundSelectedColor={isDark ? "#4b5563" : "#9ca3af"}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Takvime eklenecek görev bulunamadı.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
