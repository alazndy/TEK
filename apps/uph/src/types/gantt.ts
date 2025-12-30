// Gantt Chart Types for UPH

export interface GanttTask {
  id: string;
  projectId: string;
  title: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  progress: number;  // 0-100
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assigneeId?: string;
  assigneeName?: string;
  dependencies?: string[]; // Array of task IDs this task depends on
  priority: 'low' | 'medium' | 'high';
  color?: string;
  isMilestone?: boolean;
  parentId?: string; // For subtasks
  order: number;
}

export interface GanttDependency {
  fromId: string;
  toId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}

export interface GanttViewConfig {
  viewMode: 'day' | 'week' | 'month' | 'quarter';
  startDate: Date;
  endDate: Date;
  showDependencies: boolean;
  showProgress: boolean;
  showToday: boolean;
  rowHeight: number;
  columnWidth: number;
}

export interface GanttDragEvent {
  taskId: string;
  newStartDate: string;
  newEndDate: string;
}

export interface GanttResizeEvent {
  taskId: string;
  edge: 'start' | 'end';
  newDate: string;
}

// Color mapping for task status
export const GANTT_STATUS_COLORS: Record<string, string> = {
  'todo': '#64748b',      // slate
  'in-progress': '#3b82f6', // blue
  'review': '#f59e0b',     // amber
  'done': '#22c55e',       // green
};

// Color mapping for priority
export const GANTT_PRIORITY_COLORS: Record<string, string> = {
  'low': '#94a3b8',
  'medium': '#eab308',
  'high': '#ef4444',
};
