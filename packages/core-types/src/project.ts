// Project Types - UPH & ENV-I shared types

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  endDate?: string;
  ownerId: string;
  tenantId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: Priority;
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}
