
import { StateCreator } from 'zustand';
import { EVMProjectMetrics } from '@/types/evm';
import { Project } from '@/types/project';
import { ProjectTask } from '@/types/project'; // Use Task type

export interface EVMSlice {
  evmMetrics: EVMProjectMetrics | null;
  calculateEVM: (project: Project, tasks: ProjectTask[]) => void;
}

export const createEVMSlice: StateCreator<EVMSlice> = (set, get) => ({
  evmMetrics: null,

  calculateEVM: (project: Project, tasks: ProjectTask[]) => {
    // 1. Budget At Completion (BAC) = Project Budget
    const BAC = project.budget || 0;

    // 2. Planned Value (PV) = Budget * % of Time Elapsed (Simplified)
    // In a real system, this would be sum of PV of all tasks scheduled to be done by today.
    const startDate = new Date(project.startDate).getTime();
    const deadline = project.deadline ? new Date(project.deadline).getTime() : startDate + (30 * 24 * 60 * 60 * 1000); // Default 30 days
    const now = Date.now();
    const totalDuration = Math.max(deadline - startDate, 1);
    const elapsed = Math.max(now - startDate, 0);
    const percentTimeElapsed = Math.min(elapsed / totalDuration, 1);
    
    // Simplification: We assume value creation is linear with time for PV
    const PV = BAC * percentTimeElapsed;

    // 3. Earned Value (EV) = Budget * % Completion of Tasks
    // Calculate based on task completion status
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const taskCompletionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    
    // Or use the manually set completionPercentage if available and robust
    const percentComplete = project.completionPercentage ? (project.completionPercentage / 100) : taskCompletionRate;
    
    const EV = BAC * percentComplete;

    // 4. Actual Cost (AC) = Project Spent amount
    const AC = project.spent || 0;

    // 5. Variances
    const SV = EV - PV;
    const CV = EV - AC;

    // 6. Indices (Guard against division by zero)
    const SPI = PV > 0 ? EV / PV : 1;
    const CPI = AC > 0 ? EV / AC : 1;

    // 7. Forecasting
    const EAC = CPI > 0 ? BAC / CPI : BAC;
    const ETC = EAC - AC;
    const VAC = BAC - EAC;

    const metrics: EVMProjectMetrics = {
      projectId: project.id,
      budgetAtCompletion: BAC,
      plannedValue: PV,
      earnedValue: EV,
      actualCost: AC,
      scheduleVariance: SV,
      costVariance: CV,
      schedulePerformanceIndex: SPI,
      costPerformanceIndex: CPI,
      estimateAtCompletion: EAC,
      estimateToComplete: ETC,
      varianceAtCompletion: VAC,
      lastUpdated: new Date().toISOString()
    };

    set({ evmMetrics: metrics });
  }
});
