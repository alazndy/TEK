import { create } from 'zustand';
import { 
  ProjectEVM, 
  EVMMetrics, 
  EVMDataPoint,
  calculateEVMMetrics,
  determineEVMStatus
} from '@/types/evm';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { addDays, format, differenceInDays, parseISO } from 'date-fns';

interface EVMState {
  projectEVMs: ProjectEVM[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  // Actions
  fetchEVMData: () => Promise<void>;
  subscribeToEVM: () => void;
  unsubscribeAll: () => void;
  getProjectEVM: (projectId: string) => ProjectEVM | undefined;
  updateProjectEVM: (projectId: string, data: Partial<ProjectEVM>) => Promise<void>;
  
  // Calculations
  calculateFromProject: (
    projectId: string,
    budget: number,
    startDate: string,
    endDate: string,
    completionPercentage: number,
    spent: number
  ) => EVMMetrics;
  
  // Summary
  getPortfolioSummary: () => {
    totalBudget: number;
    totalEV: number;
    totalAC: number;
    avgCPI: number;
    avgSPI: number;
    projectsAtRisk: number;
  };
}

// Helper: Generate historical data points
function generateHistoricalData(
  startDate: string,
  endDate: string,
  bac: number,
  currentEV: number,
  currentAC: number
): EVMDataPoint[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const today = new Date();
  const totalDays = differenceInDays(end, start);
  const elapsedDays = differenceInDays(today, start);
  
  const dataPoints: EVMDataPoint[] = [];
  const weeksElapsed = Math.floor(elapsedDays / 7);
  
  for (let i = 0; i <= weeksElapsed; i++) {
    const date = addDays(start, i * 7);
    const progress = Math.min((i * 7) / totalDays, 1);
    const evProgress = Math.min(progress * 1.1, currentEV / bac); // Slight variation
    const acProgress = Math.min(progress * 1.15, currentAC / bac);
    
    dataPoints.push({
      date: format(date, 'yyyy-MM-dd'),
      plannedValue: Math.round(bac * progress),
      earnedValue: Math.round(bac * evProgress * (i / weeksElapsed || 1)),
      actualCost: Math.round(bac * acProgress * (i / weeksElapsed || 1)),
    });
  }
  
  return dataPoints;
}

export const useEVMStore = create<EVMState>((set, get) => ({
  projectEVMs: [],
  isLoading: false,
  error: null,
  unsubscribe: null,

  fetchEVMData: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await getDocs(collection(db, 'projectEVM'));
      const evmData = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          projectId: docSnap.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as ProjectEVM;
      });
      set({ projectEVMs: evmData, isLoading: false });
    } catch (error) {
      console.error('Error fetching EVM data:', error);
      set({ error: 'EVM verileri yüklenemedi', isLoading: false });
    }
  },

  subscribeToEVM: () => {
    const unsubscribe = onSnapshot(
      collection(db, 'projectEVM'),
      (snapshot) => {
        const evmData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            projectId: docSnap.id,
            ...data,
            lastUpdated: data.lastUpdated?.toDate() || new Date(),
          } as ProjectEVM;
        });
        set({ projectEVMs: evmData });
      },
      (error) => {
        console.error('EVM subscription error:', error);
        set({ error: 'EVM senkronizasyon hatası' });
      }
    );
    set({ unsubscribe });
  },

  unsubscribeAll: () => {
    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();
    set({ unsubscribe: null });
  },

  getProjectEVM: (projectId) => {
    return get().projectEVMs.find(e => e.projectId === projectId);
  },

  updateProjectEVM: async (projectId, data) => {
    try {
      const docRef = doc(db, 'projectEVM', projectId);
      await updateDoc(docRef, {
        ...data,
        lastUpdated: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating EVM:', error);
      throw error;
    }
  },

  calculateFromProject: (projectId, budget, startDate, endDate, completionPercentage, spent) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const today = new Date();
    
    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(today, start);
    const plannedProgress = Math.min(elapsedDays / totalDays, 1);
    
    const pv = budget * plannedProgress;
    const ev = budget * (completionPercentage / 100);
    const ac = spent;
    
    return calculateEVMMetrics(pv, ev, ac, budget);
  },

  getPortfolioSummary: () => {
    const { projectEVMs } = get();
    
    if (projectEVMs.length === 0) {
      return {
        totalBudget: 0,
        totalEV: 0,
        totalAC: 0,
        avgCPI: 1,
        avgSPI: 1,
        projectsAtRisk: 0,
      };
    }

    const totalBudget = projectEVMs.reduce((sum, p) => sum + p.budgetAtCompletion, 0);
    const totalEV = projectEVMs.reduce((sum, p) => sum + p.currentMetrics.earnedValue, 0);
    const totalAC = projectEVMs.reduce((sum, p) => sum + p.currentMetrics.actualCost, 0);
    const avgCPI = projectEVMs.reduce((sum, p) => sum + p.currentMetrics.costPerformanceIndex, 0) / projectEVMs.length;
    const avgSPI = projectEVMs.reduce((sum, p) => sum + p.currentMetrics.schedulePerformanceIndex, 0) / projectEVMs.length;
    const projectsAtRisk = projectEVMs.filter(p => p.status !== 'on_track').length;

    return { totalBudget, totalEV, totalAC, avgCPI, avgSPI, projectsAtRisk };
  },
}));

// Initialize EVM from existing project data
export async function initializeProjectEVM(
  projectId: string,
  projectName: string,
  budget: number,
  startDate: string,
  endDate: string,
  completionPercentage: number,
  spent: number
): Promise<void> {
  const metrics = useEVMStore.getState().calculateFromProject(
    projectId, budget, startDate, endDate, completionPercentage, spent
  );
  
  const history = generateHistoricalData(startDate, endDate, budget, metrics.earnedValue, metrics.actualCost);
  const status = determineEVMStatus(metrics.costPerformanceIndex, metrics.schedulePerformanceIndex);

  await addDoc(collection(db, 'projectEVM'), {
    projectId,
    projectName,
    startDate,
    endDate,
    budgetAtCompletion: budget,
    currency: 'TRY',
    currentMetrics: metrics,
    history,
    status,
    lastUpdated: Timestamp.fromDate(new Date()),
  });
}
