/**
 * RAID Types for UPH
 * Risks, Assumptions, Issues, Dependencies
 */

export type RAIDType = 'risk' | 'assumption' | 'issue' | 'dependency';

export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';
export type RiskProbability = 'rare' | 'unlikely' | 'possible' | 'likely' | 'certain';
export type RAIDStatus = 'open' | 'mitigating' | 'resolved' | 'accepted' | 'closed';

export interface RAIDItem {
  id: string;
  type: RAIDType;
  projectId?: string;
  
  // Core info
  title: string;
  description: string;
  
  // Risk specific
  impact?: RiskImpact;
  probability?: RiskProbability;
  riskScore?: number; // Calculated from impact * probability
  
  // Tracking
  status: RAIDStatus;
  owner?: string;
  mitigationPlan?: string;
  
  // Dependencies
  dependsOn?: string[]; // Other RAID IDs or external
  blockedBy?: string;
  
  // Dates
  identifiedDate: Date;
  targetDate?: Date;
  resolvedDate?: Date;
  
  // Meta
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Risk matrix values
export const IMPACT_VALUES: Record<RiskImpact, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export const PROBABILITY_VALUES: Record<RiskProbability, number> = {
  rare: 1,
  unlikely: 2,
  possible: 3,
  likely: 4,
  certain: 5,
};

// Colors
export const RAID_TYPE_COLORS: Record<RAIDType, string> = {
  risk: '#ef4444',
  assumption: '#8b5cf6',
  issue: '#f59e0b',
  dependency: '#3b82f6',
};

export const RAID_TYPE_LABELS: Record<RAIDType, string> = {
  risk: 'Risk',
  assumption: 'Varsayım',
  issue: 'Sorun',
  dependency: 'Bağımlılık',
};

export const STATUS_COLORS: Record<RAIDStatus, string> = {
  open: '#ef4444',
  mitigating: '#f59e0b',
  resolved: '#22c55e',
  accepted: '#6b7280',
  closed: '#1f2937',
};

// Risk score matrix colors
export function getRiskScoreColor(score: number): string {
  if (score >= 15) return '#dc2626'; // Critical red
  if (score >= 10) return '#f97316'; // High orange
  if (score >= 5) return '#eab308';  // Medium yellow
  return '#22c55e';                   // Low green
}

// Calculate risk score
export function calculateRiskScore(impact: RiskImpact, probability: RiskProbability): number {
  return IMPACT_VALUES[impact] * PROBABILITY_VALUES[probability];
}

// Risk matrix positions
export const RISK_MATRIX: { impact: RiskImpact; probability: RiskProbability }[][] = [
  // probability ↓, impact →
  [
    { impact: 'low', probability: 'certain' },
    { impact: 'medium', probability: 'certain' },
    { impact: 'high', probability: 'certain' },
    { impact: 'critical', probability: 'certain' },
  ],
  [
    { impact: 'low', probability: 'likely' },
    { impact: 'medium', probability: 'likely' },
    { impact: 'high', probability: 'likely' },
    { impact: 'critical', probability: 'likely' },
  ],
  [
    { impact: 'low', probability: 'possible' },
    { impact: 'medium', probability: 'possible' },
    { impact: 'high', probability: 'possible' },
    { impact: 'critical', probability: 'possible' },
  ],
  [
    { impact: 'low', probability: 'unlikely' },
    { impact: 'medium', probability: 'unlikely' },
    { impact: 'high', probability: 'unlikely' },
    { impact: 'critical', probability: 'unlikely' },
  ],
  [
    { impact: 'low', probability: 'rare' },
    { impact: 'medium', probability: 'rare' },
    { impact: 'high', probability: 'rare' },
    { impact: 'critical', probability: 'rare' },
  ],
];
