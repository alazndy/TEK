// Reminder Types

export type ReminderType = 'deadline' | 'overdue' | 'milestone' | 'custom' | 'follow_up';
export type ReminderChannel = 'in_app' | 'email' | 'push' | 'slack';
export type ReminderStatus = 'pending' | 'sent' | 'dismissed' | 'snoozed';

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  targetType: 'project' | 'task' | 'invoice' | 'custom';
  targetId?: string;
  targetName?: string;
  title: string;
  message: string;
  triggerDate: Date;
  scheduledFor?: Date; // Alias for triggerDate
  repeatInterval?: 'daily' | 'weekly' | 'monthly' | 'none';
  repeatUntil?: Date;
  channels: ReminderChannel[];
  status: ReminderStatus;
  sentAt?: Date;
  snoozedUntil?: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderSettings {
  id?: string;
  userId: string;
  enabled?: boolean; // Master switch
  
  // Deadlines
  enableDeadlineReminders: boolean;
  deadlineReminderDays: number[]; // e.g., [1, 3, 7]
  deadlineWarningDays?: number[]; // Alias
  
  // Overdue
  enableOverdueReminders: boolean;
  overdueReminderFrequency: 'daily' | 'every_3_days' | 'weekly';
  overdueCheckInterval?: 'daily' | 'every_3_days' | 'weekly'; // Alias
  
  // Milestones
  enableMilestoneReminders: boolean;
  
  // Channels
  defaultChannels: ReminderChannel[];
  channels?: ReminderChannel[]; // Alias
  
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
}
