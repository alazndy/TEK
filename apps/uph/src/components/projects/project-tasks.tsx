'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Calendar, Mail } from 'lucide-react';
import { Project, ProjectTask } from '@/types/project';
import { useProjectStore } from '@/stores/project-store';
import { Virtuoso } from 'react-virtuoso';
import { generateGoogleCalendarLink } from '@/utils/calendar-utils';
import { ImportWeaveDialog } from './import-weave-dialog';
import { ImportTasksDialog } from './import-json-dialog';

interface ProjectTasksProps {
    project: Project;
}

// Memoized Task Item
// Imported icons should be added at the top
// But since I am editing TaskItem block, I'll assume they will be available or I'll add them later.
// For now, let's use the icons passed or imported. I will handle imports in a separate call if needed.

const TaskItem = memo(({ 
    task, 
    projectId, 
    onToggle, 
    onDelete
}: { 
    task: ProjectTask, 
    projectId: string, 
    onToggle: (pid: string, tid: string, completed: boolean) => void, 
    onDelete: (pid: string, tid: string) => void
}) => {
    const handleAddToCalendar = () => {
        const link = generateGoogleCalendarLink(task.title, "UPH üzerinden oluşturuldu", task.dueDate);
        window.open(link, '_blank');
    };

    const handleEmailNotify = () => {
        const subject = encodeURIComponent(`Görev Ataması: ${task.title}`);
        const body = encodeURIComponent(`Merhaba,\n\n"${task.title}" görevi ile ilgili bir güncelleme var.\n\nDurum: ${task.status}\n\nİyi çalışmalar.`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    return (
        <div 
            className={`flex items-center justify-between p-3 border rounded-md transition-all hover:bg-muted/50 ${task.completed ? 'bg-muted/20' : 'bg-card'}`}
        >
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <Checkbox 
                    checked={task.completed} 
                    onCheckedChange={() => onToggle(projectId, task.id, task.completed)}
                />
                <div className="flex flex-col overflow-hidden">
                     <span className={`truncate ${task.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                        {task.title}
                    </span>
                    {task.dueDate && <span className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
            </div>
            <div className="flex items-center gap-1">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={handleAddToCalendar}
                    title="Google Takvim'e Ekle"
                >
                    <Calendar className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={handleEmailNotify}
                    title="E-posta ile Bildir"
                >
                    <Mail className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(projectId, task.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
});

TaskItem.displayName = 'TaskItem';

export function ProjectTasks({ project }: ProjectTasksProps) {
    const { addTask, toggleTask, deleteTask, getProjectTasks, fetchProjectTasks } = useProjectStore();
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        fetchProjectTasks(project.id);
    }, [project.id, fetchProjectTasks]);

    const tasks = getProjectTasks(project.id);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        await addTask(project.id, {
            title: newTaskTitle,
            completed: false,
            status: 'todo'
        });
        setNewTaskTitle('');
    };

    const handleToggle = useCallback((pid: string, tid: string, completed: boolean) => {
        toggleTask(pid, tid, completed);
    }, [toggleTask]);

    const handleDelete = useCallback((pid: string, tid: string) => {
        deleteTask(pid, tid);
    }, [deleteTask]);

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

    return (
        <Card className="h-[500px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Project Tasks</CardTitle>
                    <CardDescription>
                        {tasks.filter(t => t.completed).length || 0} of {tasks.length || 0} tasks completed
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <ImportTasksDialog projectId={project.id} />
                    <ImportWeaveDialog projectId={project.id} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col min-h-0">
                <form onSubmit={handleAddTask} className="flex gap-2">
                    <Input 
                        placeholder="Add a new task..." 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </form>

                <div className="flex-1 mt-4 min-h-0">
                    {sortedTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                            No tasks yet. Add one to get started!
                        </div>
                    ) : (
                        <Virtuoso
                            style={{ height: '100%' }}
                            totalCount={sortedTasks.length}
                            itemContent={(index) => (
                                <div className="pb-2">
                                    <TaskItem 
                                        task={sortedTasks[index]} 
                                        projectId={project.id} 
                                        onToggle={handleToggle} 
                                        onDelete={handleDelete} 
                                    />
                                </div>
                            )}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
