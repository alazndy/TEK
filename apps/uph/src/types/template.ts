// Project Template Types

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  estimatedHours?: number;
  dependencies?: string[]; // Other task template IDs
  assigneeRole?: string; // Role to assign when created
  checklistItems?: string[];
  daysOffset?: number; // Days after project start
  tags?: string[];
}

export interface MaterialTemplate {
  itemId?: string; // Optional link to inventory item
  name: string;
  quantity: number;
  estimatedCost: number;
  category?: string;
}

export interface MilestoneTemplate {
  id: string;
  name: string;
  daysOffset: number; // Days after project start
  description?: string;
  deliverables?: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  category: string; // e.g., "Yazılım", "Donanım", "Mekanik"
  defaultStatus: 'Planning' | 'Active';
  defaultPriority: 'Low' | 'Medium' | 'High';
  tasks: TaskTemplate[];
  materials: MaterialTemplate[];
  milestones: MilestoneTemplate[];
  estimatedDuration: number; // in days
  estimatedBudget?: number;
  tags: string[];
  createdBy: string;
  isPublic: boolean; // Shared with team
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateUsageLog {
  id: string;
  templateId: string;
  templateName: string;
  projectId: string;
  projectName: string;
  usedBy: string;
  usedAt: Date;
}
