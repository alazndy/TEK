export type ECRStatus = 'open' | 'under_review' | 'approved' | 'rejected' | 'closed';
export type ECOStatus = 'open' | 'hold' | 'released' | 'scheduled' | 'implemented' | 'cancelled';
export type ECOPriority = 'low' | 'routine' | 'high' | 'urgent';
export type EffectivityType = 'date' | 'unit';
export type DispositionCode = 'scrap' | 'use_as_is' | 'rework';

export interface ECR {
  id: string;
  projectId?: string; // Optional: links ECR to a specific project
  identifier: string; // ECR-2025-001
  title: string;
  description: string;
  status: ECRStatus;
  priority: ECOPriority;
  requestorId: string;
  departmentId: string;
  createdAt: Date;
  updatedAt: Date;
  impactAnalysis?: {
    technicalFesibility: string;
    financialImpact: number;
    inventoryImpact: string;
  };
}

export interface RevisedItem {
  id: string;
  itemId: string;
  itemName: string;
  currentRevision: string;
  newRevision: string;
  effectivityType: EffectivityType;
  effectiveDate?: Date;
  fromUnitNumber?: string;
  toUnitNumber?: string;
  disposition: DispositionCode;
  wipUpdate: boolean;
}

export interface ECO {
  id: string;
  projectId?: string; // Optional: links ECO to a specific project
  identifier: string; // ECO-2025-001
  ecrId?: string; // Optional reference to originating ECR
  title: string;
  status: ECOStatus;
  priority: ECOPriority;
  approvalStatus: 'not_submitted' | 'requested' | 'approved' | 'rejected';
  requestorId: string;
  responsibleDept: string;
  mrpActive: boolean;
  revisedItems: RevisedItem[];
  createdAt: Date;
  updatedAt: Date;
  implementedAt?: Date;
}
