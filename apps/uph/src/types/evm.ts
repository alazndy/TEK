
export interface EVMProjectMetrics {
  projectId: string;
  
  // Base Values
  budgetAtCompletion: number; // BAC (Total Budget)
  plannedValue: number;       // PV (Value of work planned to be done by now)
  earnedValue: number;        // EV (Value of work actually completed)
  actualCost: number;         // AC (Actual money spent)

  // Performance Indices
  scheduleVariance: number;   // SV = EV - PV
  costVariance: number;       // CV = EV - AC
  schedulePerformanceIndex: number; // SPI = EV / PV
  costPerformanceIndex: number;     // CPI = EV / AC

  // Forecasting
  estimateAtCompletion: number;     // EAC = BAC / CPI
  estimateToComplete: number;       // ETC = EAC - AC
  varianceAtCompletion: number;     // VAC = BAC - EAC
  
  lastUpdated: string;
}

export interface EVMSnapshot {
  id: string;
  projectId: string;
  date: string;
  metrics: EVMProjectMetrics;
}
