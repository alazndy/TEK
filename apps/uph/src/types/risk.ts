
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type RiskStatus = 'Open' | 'Mitigated' | 'Closed' | 'Occurred';
export type RAIDType = 'risk' | 'assumption' | 'issue' | 'dependency';
export type RAIDStatus = 'identified' | 'analyzed' | 'mitigating' | 'resolved' | 'closed';

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
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: RAIDStatus;
  ownerId?: string;
  probability?: number;
  impact?: number;
  mitigationPlan?: string;
  createdAt: string;
  updatedAt: string; // Added updatedAt
  resolvedAt?: string;
}
