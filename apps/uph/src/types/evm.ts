
export interface EVMMetrics {
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  budgetAtCompletion: number;
  scheduleVariance: number;
  costVariance: number;
  schedulePerformanceIndex: number;
  costPerformanceIndex: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
  lastUpdated?: string;
}

export interface EVMDataPoint {
  date: string;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
}

export type EVMStatus = 'on_track' | 'at_risk' | 'behind' | 'over_budget' | 'critical';

export interface ProjectEVM {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  budgetAtCompletion: number;
  currency: string;
  currentMetrics: EVMMetrics;
  history: EVMDataPoint[];
  status: EVMStatus;
  lastUpdated: any; // Timestamp or Date
}

export interface EVMProjectMetrics extends EVMMetrics {
  projectId: string;
}

export interface EVMSnapshot {
  id: string;
  projectId: string;
  date: string;
  metrics: EVMProjectMetrics;
}

export function calculateEVMMetrics(pv: number, ev: number, ac: number, bac: number): EVMMetrics {
  const cpi = ac > 0 ? ev / ac : 1;
  const spi = pv > 0 ? ev / pv : 1;
  const eac = cpi > 0 ? bac / cpi : bac;

  return {
    plannedValue: pv,
    earnedValue: ev,
    actualCost: ac,
    budgetAtCompletion: bac,
    scheduleVariance: ev - pv,
    costVariance: ev - ac,
    schedulePerformanceIndex: spi,
    costPerformanceIndex: cpi,
    estimateAtCompletion: eac,
    estimateToComplete: eac - ac,
    varianceAtCompletion: bac - eac
  };
}

export function determineEVMStatus(cpi: number, spi: number): EVMStatus {
  if (cpi < 0.8 || spi < 0.8) return 'critical';
  if (cpi < 0.9 || spi < 0.9) return 'at_risk';
  if (spi < 1) return 'behind';
  if (cpi < 1) return 'over_budget';
  return 'on_track';
}

export const EVM_STATUS_COLORS: Record<EVMStatus, string> = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  behind: 'bg-orange-500',
  over_budget: 'bg-orange-500',
  critical: 'bg-red-500'
};

export const EVM_STATUS_LABELS: Record<EVMStatus, string> = {
  on_track: 'Yolunda',
  at_risk: 'Riskli',
  behind: 'Gecikmede',
  over_budget: 'Bütçe Aşımı',
  critical: 'Kritik'
};
