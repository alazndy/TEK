export type ForgeJobStatus = 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
export type ForgeJobPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ForgeJob {
    id: string;
    projectId: string; // References a project
    project: string; // Denormalized name for display
    status: ForgeJobStatus;
    progress: number; // 0-100
    step: string; // e.g., "Cutting", "Assembly"
    priority: ForgeJobPriority;
    technicianId?: string;
    technician?: string;
    add_date: string;
    deadline?: string;
}

export interface ForgeStats {
    activeJobs: number;
    efficiency: number; // Percentage
    delays: number;
    completedThisMonth: number;
}
