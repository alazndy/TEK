
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type RiskStatus = 'Open' | 'Mitigated' | 'Closed' | 'Occurred';
export type RAIDType = 'Risk' | 'Assumption' | 'Issue' | 'Dependency';

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: string; // e.g., 'Technical', 'Financial', 'Resource'
  probability: number; // 1-5
  impact: number;      // 1-5
  severity: number;    // Calculated: probability * impact
  level: RiskLevel;
  status: RiskStatus;
  ownerId: string;
  mitigationStrategy?: string;
  contingencyPlan?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RAIDEntry {
  id: string;
  projectId: string;
  type: RAIDType;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Closed';
  ownerId?: string;
  createdAt: string;
  resolvedAt?: string;
}
