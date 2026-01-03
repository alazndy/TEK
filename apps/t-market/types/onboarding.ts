export type Industry = 
  | 'defense'
  | 'medical'
  | 'electronics'
  | 'energy'
  | 'automotive'
  | 'manufacturing'
  | 'software'
  | 'other';

export type TeamSize = '1-5' | '6-20' | '21-100' | '100+';

export type UserRole = 'owner' | 'manager' | 'engineer' | 'it' | 'other';

export type PainPoint = 
  | 'project-tracking'
  | 'inventory'
  | 'bom-management'
  | 'design-versioning'
  | 'compliance'
  | 'field-operations'
  | 'analytics'
  | 'collaboration';

export type CurrentTool = 'excel' | 'jira' | 'erp' | 'none' | 'other';

export type Priority = 'speed' | 'control' | 'compliance';

export type BudgetTier = 'free' | 'starter' | 'pro' | 'enterprise';

export interface OnboardingProfile {
  // Step 1: Basic Info
  companyName: string;
  industry: Industry;
  teamSize: TeamSize;
  userRole: UserRole;
  
  // Step 2: Needs
  painPoints: PainPoint[];
  currentTools: CurrentTool[];
  priority: Priority;
  
  // Step 3: Capacity
  monthlyProjects: number;
  activeUsers: number;
  budgetTier: BudgetTier;
}

export interface AppInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  monthlyPrice: number;
  features: string[];
  category: 'project' | 'inventory' | 'design' | 'analytics' | 'operations';
}

export interface PackageBundle {
  id: string;
  name: string;
  description: string;
  apps: string[]; // app IDs
  monthlyPricePerUser: number;
  trialDays: number;
  highlight?: string;
  recommended?: boolean;
}

export interface RecommendationResult {
  packages: PackageBundle[];
  individualApps: AppInfo[];
  matchScore: number;
  reasoning: string;
}
