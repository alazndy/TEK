// Time Tracking Types

export type TimeEntryStatus = 'running' | 'paused' | 'completed';

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  breaks: { start: Date; end?: Date }[];
  billable: boolean;
  hourlyRate?: number;
  tags?: string[];
  status: TimeEntryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface Timesheet {
  id: string;
  userId: string;
  userName?: string;
  weekStartDate: Date;
  weekEndDate: Date;
  entries: string[]; // TimeEntry IDs
  totalHours: number;
  billableHours: number;
  totalAmount: number;
  status: TimesheetStatus;
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  billableThisMonth: number;
  averageDaily: number;
}
