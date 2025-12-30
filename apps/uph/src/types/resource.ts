export type ResourceRole = 'engineer' | 'designer' | 'manager' | 'technician' | 'other';

export interface ResourceLoad {
  projectId: string;
  projectName: string;
  taskId?: string;
  hoursPerDay: number;
  startDate: string;
  endDate: string;
  utilizationPercentage: number; // calculated: (hoursPerDay / totalCapacity) * 100
}

export interface ResourceCapacity {
  userId: string;
  displayName: string;
  role: ResourceRole;
  avatarUrl?: string;
  standardDailyHours: number; // Default: 8
  weeklyWorkingDays: number[]; // [1, 2, 3, 4, 5] (Mon-Fri)
  exceptions: Array<{
    date: string;
    availableHours: number; // 0 for vacation
    reason?: string;
  }>;
  currentAssignments: ResourceLoad[];
}

export interface DailyCapacityPoint {
  date: string;
  totalCapacity: number;
  allocatedHours: number;
  availableHours: number;
  utilization: number; // percentage
  assignments: Array<{
    projectName: string;
    load: number;
  }>;
}

export interface ResourceHeatmapData {
  userId: string;
  displayName: string;
  dailyData: DailyCapacityPoint[];
}
