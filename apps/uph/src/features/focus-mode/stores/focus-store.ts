import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FocusState, FocusTask } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,
      timerState: 'idle',
      timeLeft: 25 * 60, // Default 25 min
      initialDuration: 25 * 60,
      isOvertime: false,
      isBreak: false,
      breakDuration: 5 * 60, // 5 min default break
      sessionsBeforeLongBreak: 4,
      completedSessions: 0,
      stats: {
        totalFocusTime: 0,
        tasksCompleted: 0,
        streak: 0,
        todayFocusTime: 0,
        todayTasksCompleted: 0,
      },

      addTask: (title, minutes = 25) => {
        const newTask: FocusTask = {
          id: uuidv4(),
          title,
          estimatedMinutes: minutes,
          actualMinutes: 0,
          completed: false,
          createdAt: new Date(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      toggleTaskComplete: (id) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === id);
          if (!task) return {};
          
          const actualMinutes = task.actualMinutes + Math.floor((state.initialDuration - state.timeLeft) / 60);
          
          const newTasks = state.tasks.map((t) =>
            t.id === id ? { 
              ...t, 
              completed: !t.completed, 
              completedAt: !t.completed ? new Date() : undefined,
              actualMinutes: !t.completed ? actualMinutes : t.actualMinutes
            } : t
          );
          
          // If active task is completed, stop timer and suggest break
          if (state.activeTaskId === id && !task.completed) {
            const newCompletedSessions = state.completedSessions + 1;
            const isLongBreak = newCompletedSessions % state.sessionsBeforeLongBreak === 0;
            
             return { 
                 tasks: newTasks, 
                 activeTaskId: null, 
                 timerState: 'idle',
                 isOvertime: false,
                 isBreak: true, // Suggest break
                 breakDuration: isLongBreak ? 15 * 60 : 5 * 60,
                 timeLeft: isLongBreak ? 15 * 60 : 5 * 60,
                 completedSessions: newCompletedSessions,
                 stats: {
                     ...state.stats,
                     tasksCompleted: state.stats.tasksCompleted + 1,
                     todayTasksCompleted: state.stats.todayTasksCompleted + 1
                 }
             };
          }
          
          return { tasks: newTasks };
        });
      },

      setActiveTask: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (task) {
          set({ 
            activeTaskId: id,
            timeLeft: task.estimatedMinutes * 60,
            initialDuration: task.estimatedMinutes * 60,
            isOvertime: false,
            isBreak: false
          });
        }
      },
      
      removeTask: (id) => set((state) => ({ 
        tasks: state.tasks.filter((t) => t.id !== id),
        activeTaskId: state.activeTaskId === id ? null : state.activeTaskId
      })),

      reorderTasks: (tasks) => set({ tasks }),
      
      postponeTask: (id) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, postponedTo: new Date(Date.now() + 24 * 60 * 60 * 1000) } : t
        ),
        activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
        timerState: state.activeTaskId === id ? 'idle' : state.timerState
      })),

      setDuration: (minutes) => set({ 
          timeLeft: minutes * 60, 
          initialDuration: minutes * 60,
          isOvertime: false 
      }),

      startTimer: () => set({ timerState: 'running' }),
      pauseTimer: () => set({ timerState: 'paused' }),
      stopTimer: () => set((state) => ({ 
          timerState: 'idle', 
          timeLeft: state.isBreak ? state.breakDuration : state.initialDuration,
          isOvertime: false
      })),
      
      skipBreak: () => set({ 
        isBreak: false, 
        timerState: 'idle',
        timeLeft: 25 * 60,
        initialDuration: 25 * 60
      }),
      
      startBreak: () => set(() => ({ 
        timerState: 'running',
        isBreak: true
      })),

      tick: () => set((state) => {
        if (state.timerState !== 'running') return {};

        // Break countdown
        if (state.isBreak) {
          if (state.timeLeft <= 0) {
            return { 
              isBreak: false, 
              timerState: 'idle',
              timeLeft: 25 * 60,
              initialDuration: 25 * 60
            };
          }
          return { timeLeft: state.timeLeft - 1 };
        }

        if (state.isOvertime) {
            // Count UP
            return {
                timeLeft: state.timeLeft + 1,
                stats: { 
                  ...state.stats, 
                  totalFocusTime: state.stats.totalFocusTime + 1,
                  todayFocusTime: state.stats.todayFocusTime + 1
                }
            };
        } else {
            // Count DOWN
            if (state.timeLeft <= 0) {
                // Switch to Overtime
                return { 
                    isOvertime: true, 
                    timeLeft: 1 
                };
            }
            return { 
                timeLeft: state.timeLeft - 1,
                stats: { 
                  ...state.stats, 
                  totalFocusTime: state.stats.totalFocusTime + 1,
                  todayFocusTime: state.stats.todayFocusTime + 1
                }
            };
        }
      }),
      
      exportData: () => {
        const state = get();
        const data = state.tasks.map(t => ({
          title: t.title,
          estimatedMinutes: t.estimatedMinutes,
          actualMinutes: t.actualMinutes,
          completed: t.completed,
          createdAt: t.createdAt,
          completedAt: t.completedAt
        }));
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focus-tasks-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      
      resetDailyStats: () => set((state) => ({
        stats: { ...state.stats, todayFocusTime: 0, todayTasksCompleted: 0 }
      }))
    }),
    {
      name: 'uph-focus-storage',
      partialize: (state) => ({ tasks: state.tasks, stats: state.stats, completedSessions: state.completedSessions }),
    }
  )
);

