export type TimerState = 'idle' | 'running' | 'paused' | 'break';

export interface FocusTask {
  id: string;
  title: string;
  estimatedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  postponedTo?: Date;
}

export interface FocusSessionStats {
  totalFocusTime: number; // in seconds
  tasksCompleted: number;
  streak: number;
  todayFocusTime: number;
  todayTasksCompleted: number;
}

export interface FocusState {
  tasks: FocusTask[];
  activeTaskId: string | null;
  
  // Timer
  timerState: TimerState;
  timeLeft: number; // seconds
  initialDuration: number; // seconds
  isOvertime: boolean;
  
  // Break system
  isBreak: boolean;
  breakDuration: number;
  sessionsBeforeLongBreak: number;
  completedSessions: number;
  
  // Stats
  stats: FocusSessionStats;
  
  // Actions
  addTask: (title: string, minutes?: number) => void;
  toggleTaskComplete: (id: string) => void;
  setActiveTask: (id: string | null) => void;
  removeTask: (id: string) => void;
  reorderTasks: (tasks: FocusTask[]) => void;
  postponeTask: (id: string) => void;
  
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
  setDuration: (minutes: number) => void;
  
  // Break actions
  skipBreak: () => void;
  startBreak: () => void;
  
  // Export
  exportData: () => void;
  resetDailyStats: () => void;
}

