'use client';
import React from 'react';
import { useFocusStore } from '../stores/focus-store';
import { QuickEntry } from './quick-entry';
import { FocusTimer } from './focus-timer';
import { BreakOverlay } from './break-overlay';
import { StatsPanel } from './stats-panel';
import { Play, CheckCircle2, Clock, Trash2, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FocusModePage = () => {
    const { activeTaskId, isBreak } = useFocusStore();

    return (
        <div className="flex flex-col h-full min-h-screen p-6 bg-gradient-to-br from-background to-accent/5">
            {/* Break Overlay */}
            <BreakOverlay />
            
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    Focus Mode
                </h1>
                {/* Stats Summary inline could go here */}
            </header>

            {activeTaskId && !isBreak ? (
                <div className="flex-1 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                    <FocusTimer />
                </div>
            ) : !isBreak ? (
                <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 animate-in slide-in-from-bottom duration-500">
                    <div className="text-center mb-4">
                         <h2 className="text-2xl font-semibold mb-2">Akışa Geçmeye Hazır mısın?</h2>
                         <p className="text-muted-foreground">Bugünün en önemli görevini seç ve başlat.</p>
                    </div>

                    <QuickEntry />
                    
                    <TaskListComponent />
                    
                    <StatsPanel />
                </div>
            ) : null}
        </div>
    );
};

// Task List Component with postpone and actual time display
const TaskListComponent = () => {
    const { tasks, setActiveTask, toggleTaskComplete, removeTask, postponeTask } = useFocusStore();

    const pendingTasks = tasks.filter(t => !t.completed && !t.postponedTo);
    const completedTasks = tasks.filter(t => t.completed);

    if (tasks.length === 0) return (
        <div className="text-center py-12 text-muted-foreground">
            Henüz görev yok. Yukarıdan ekle!
        </div>
    );

    return (
        <div className="space-y-3">
            {pendingTasks.map(task => (
                <div key={task.id} className="group flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-md">
                    <button onClick={() => toggleTaskComplete(task.id)} className="text-muted-foreground hover:text-green-500 transition-colors">
                         <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                         </div>
                    </button>
                    
                    <div className="flex-1">
                        <h3 className="font-medium text-lg">{task.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> {task.estimatedMinutes} dk tahmini
                            </span>
                            {task.actualMinutes > 0 && (
                                <span className={task.actualMinutes > task.estimatedMinutes ? 'text-red-400' : 'text-green-400'}>
                                    • {task.actualMinutes} dk gerçek
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                            onClick={() => postponeTask(task.id)} 
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-orange-500"
                            title="Yarına ertele"
                        >
                            <CalendarPlus size={16} />
                        </Button>
                        
                        <Button 
                            onClick={() => removeTask(task.id)} 
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        >
                            <Trash2 size={16} />
                        </Button>
                        
                        <Button 
                            onClick={() => setActiveTask(task.id)} 
                            size="sm" 
                            className="rounded-full px-6"
                        >
                            <Play size={14} className="mr-2" /> Başla
                        </Button>
                    </div>
                </div>
            ))}
             
             {completedTasks.length > 0 && (
                 <div className="mt-8 pt-8 border-t border-dashed border-border/50">
                     <h4 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        Tamamlananlar ({completedTasks.length})
                     </h4>
                     <div className="space-y-2">
                         {completedTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-4 p-3 opacity-60 hover:opacity-80 transition-opacity">
                                <CheckCircle2 size={20} className="text-green-500" />
                                <div className="flex-1">
                                    <span className="line-through">{task.title}</span>
                                    {task.actualMinutes > 0 && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                            ({task.estimatedMinutes}dk → {task.actualMinutes}dk)
                                        </span>
                                    )}
                                </div>
                            </div>
                         ))}
                     </div>
                 </div>
             )}
        </div>
    );
};

