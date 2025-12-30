// EVM (Earned Value Management) Types for UPH

/**
 * Earned Value Management (EVM) - Proje performans ölçümü
 * 
 * Temel Metrikler:
 * - PV (Planned Value): Planlanan değer
 * - EV (Earned Value): Kazanılan değer
 * - AC (Actual Cost): Gerçek maliyet
 * 
 * Performans Endeksleri:
 * - CPI (Cost Performance Index): EV / AC
 * - SPI (Schedule Performance Index): EV / PV
 * 
 * Varyanslar:
 * - CV (Cost Variance): EV - AC
 * - SV (Schedule Variance): EV - PV
 */

export interface EVMMetrics {
  // Base values
  plannedValue: number;      // PV - Planlanan Değer
  earnedValue: number;       // EV - Kazanılan Değer
  actualCost: number;        // AC - Gerçek Maliyet
  
  // At completion
  budgetAtCompletion: number; // BAC - Tamamlanma Bütçesi
  
  // Calculated metrics
  costVariance: number;       // CV = EV - AC
  scheduleVariance: number;   // SV = EV - PV
  costPerformanceIndex: number;    // CPI = EV / AC
  schedulePerformanceIndex: number; // SPI = EV / PV
  
  // Forecasts
  estimateAtCompletion: number;     // EAC = BAC / CPI
  estimateToComplete: number;       // ETC = EAC - AC
  varianceAtCompletion: number;     // VAC = BAC - EAC
  toCompletePerformanceIndex: number; // TCPI = (BAC - EV) / (BAC - AC)
}

export interface EVMDataPoint {
  date: string;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
}

export interface ProjectEVM {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  budgetAtCompletion: number;
  currency: string;
  
  // Current metrics
  currentMetrics: EVMMetrics;
  
  // Historical data for chart
  history: EVMDataPoint[];
  
  // Status
  status: 'on_track' | 'at_risk' | 'behind' | 'critical';
  lastUpdated: Date;
}

// Status thresholds
export const EVM_STATUS_THRESHOLDS = {
  on_track: { cpiMin: 0.95, spiMin: 0.95 },
  at_risk: { cpiMin: 0.85, spiMin: 0.85 },
  behind: { cpiMin: 0.75, spiMin: 0.75 },
  critical: { cpiMin: 0, spiMin: 0 },
};

// Status colors
export const EVM_STATUS_COLORS: Record<string, string> = {
  on_track: '#22c55e',
  at_risk: '#f59e0b',
  behind: '#f97316',
  critical: '#ef4444',
};

export const EVM_STATUS_LABELS: Record<string, string> = {
  on_track: 'Yolunda',
  at_risk: 'Risk Altında',
  behind: 'Geride',
  critical: 'Kritik',
};

// Helper functions
export function calculateEVMMetrics(
  pv: number,
  ev: number,
  ac: number,
  bac: number
): EVMMetrics {
  const cv = ev - ac;
  const sv = ev - pv;
  const cpi = ac > 0 ? ev / ac : 1;
  const spi = pv > 0 ? ev / pv : 1;
  const eac = cpi > 0 ? bac / cpi : bac;
  const etc = eac - ac;
  const vac = bac - eac;
  const tcpi = (bac - ac) > 0 ? (bac - ev) / (bac - ac) : 1;

  return {
    plannedValue: pv,
    earnedValue: ev,
    actualCost: ac,
    budgetAtCompletion: bac,
    costVariance: cv,
    scheduleVariance: sv,
    costPerformanceIndex: cpi,
    schedulePerformanceIndex: spi,
    estimateAtCompletion: eac,
    estimateToComplete: etc,
    varianceAtCompletion: vac,
    toCompletePerformanceIndex: tcpi,
  };
}

export function determineEVMStatus(cpi: number, spi: number): ProjectEVM['status'] {
  const minIndex = Math.min(cpi, spi);
  
  if (minIndex >= EVM_STATUS_THRESHOLDS.on_track.cpiMin) return 'on_track';
  if (minIndex >= EVM_STATUS_THRESHOLDS.at_risk.cpiMin) return 'at_risk';
  if (minIndex >= EVM_STATUS_THRESHOLDS.behind.cpiMin) return 'behind';
  return 'critical';
}
