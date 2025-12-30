export type RAIDType = 'risk' | 'assumption' | 'issue' | 'dependency';
export type RAIDStatus = 'identified' | 'analyzed' | 'mitigating' | 'resolved' | 'closed';
export type RiskImpact = 1 | 2 | 3 | 4 | 5;
export type RiskProbability = 1 | 2 | 3 | 4 | 5;

export interface RAIDEntry {
  id: string;
  projectId: string;
  type: RAIDType;
  title: string;
  description: string;
  status: RAIDStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Specific to Risk
  impact?: RiskImpact;
  probability?: RiskProbability;
  score?: number; // impact * probability
  mitigationPlan?: string;
  contingencyPlan?: string;
  
  // Specific to Dependency
  dependsOnTaskId?: string;
  externalDependency?: string;
}

export interface EVMMetrics {
  projectId: string;
  date: string;
  PV: number; // Planned Value (BCWS)
  EV: number; // Earned Value (BCWP)
  AC: number; // Actual Cost (ACWP)
  CV: number; // Cost Variance (EV - AC)
  SV: number; // Schedule Variance (EV - PV)
  CPI: number; // Cost Performance Index (EV / AC)
  SPI: number; // Schedule Performance Index (EV / PV)
  EAC: number; // Estimate At Completion
  ETC: number; // Estimate To Complete
}

export interface ProjectRiskSummary {
  projectId: string;
  highRisksCount: number;
  openIssuesCount: number;
  criticalDependenciesCount: number;
  currentCPI: number;
  currentSPI: number;
}
