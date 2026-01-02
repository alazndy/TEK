'use client';
import React, { useEffect } from 'react';
import { useFocusStore } from '../stores/focus-store';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { celebrateCompletion } from '../hooks/use-confetti';

// Helper to format MM:SS
const formatTime = (seconds: number) => {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const FocusTimer = () => {
    const { 
        timerState, timeLeft, initialDuration, isOvertime, activeTaskId, tasks,
        startTimer, pauseTimer, stopTimer, tick, toggleTaskComplete
    } = useFocusStore();

    const activeTask = tasks.find(t => t.id === activeTaskId);

    // Timer Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerState === 'running') {
            interval = setInterval(tick, 1000);
        }
        return () => clearInterval(interval);
    }, [timerState, tick]);

    // Progress Calculation
    const progress = isOvertime ? 100 : ((initialDuration - timeLeft) / initialDuration) * 100;

    const handleComplete = () => {
        if (activeTask) {
            celebrateCompletion(); // 🎉 Confetti!
            toggleTaskComplete(activeTask.id);
        }
    };

    if (!activeTask) return <div className="text-center text-muted-foreground mt-10">Lütfen başlamak için bir görev seçin.</div>;

    // Calculate elapsed minutes for display
    const elapsedMinutes = Math.ceil((initialDuration - timeLeft) / 60);

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md mx-auto relative overflow-hidden">
            {/* Background Progress Bar */}
            <div 
                className={cn("absolute bottom-0 left-0 h-2 transition-all duration-1000 ease-linear", isOvertime ? "bg-red-500" : "bg-primary")}
                style={{ width: `${progress}%` }}
            />

            <h2 className="text-2xl font-bold mb-2 text-center text-foreground">{activeTask.title}</h2>
            
            {/* Time Comparison */}
            <div className="text-sm text-muted-foreground mb-4">
                Tahmini: {activeTask.estimatedMinutes} dk • Geçen: {elapsedMinutes} dk
            </div>
            
            <div className={cn("text-8xl font-mono font-bold my-8 tabular-nums tracking-tighter", isOvertime ? "text-red-500 animate-pulse" : "text-foreground")}>
                {isOvertime ? '+' : ''}{formatTime(timeLeft)}
            </div>
            {isOvertime && <div className="text-red-400 font-bold mb-4 animate-bounce">⚠️ AŞIM SÜRESİ</div>}

            <div className="flex gap-4 items-center">
                {timerState === 'running' ? (
                    <Button onClick={pauseTimer} size="lg" variant="outline" className="h-16 w-16 rounded-full border-2">
                        <Pause size={32} />
                    </Button>
                ) : (
                    <Button onClick={startTimer} size="lg" className="h-16 w-16 rounded-full shadow-lg shadow-primary/25">
                        <Play size={32} className="ml-1" />
                    </Button>
                )}
                
                <Button onClick={stopTimer} size="icon" variant="ghost" className="h-12 w-12 rounded-full text-muted-foreground hover:text-destructive">
                    <Square size={20} />
                </Button>

                <Button 
                    onClick={handleComplete} 
                    className="h-12 px-6 rounded-full font-bold ml-4 bg-green-600 hover:bg-green-700"
                >
                    ✓ Tamamla
                </Button>
            </div>
        </div>
    );
};

