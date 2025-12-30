import { create } from 'zustand';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ForgeJob, ForgeStats } from '@/types/forge';

interface ForgeState {
  jobs: ForgeJob[];
  stats: ForgeStats;
  loading: boolean;
  error: string | null;
}

interface ForgeActions {
  fetchJobs: () => Promise<void>;
  addJob: (data: Omit<ForgeJob, 'id' | 'status' | 'progress' | 'add_date'>) => Promise<void>;
  updateJobProgress: (id: string, progress: number, step?: string) => Promise<void>;
  updateJobStatus: (id: string, status: ForgeJob['status']) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
}

type ForgeStore = ForgeState & ForgeActions;

const initialStats: ForgeStats = {
  activeJobs: 0,
  efficiency: 0,
  delays: 0,
  completedThisMonth: 0,
};

// Helper: Calculate stats from jobs
const calculateStats = (jobs: ForgeJob[]): ForgeStats => {
  const activeJobs = jobs.filter(j => j.status === 'In Progress' || j.status === 'Pending').length;
  const delays = jobs.filter(j => j.status === 'Delayed').length;
  const completed = jobs.filter(j => j.status === 'Completed').length;
  
  // Mock efficiency calculation based on completion rate vs delays
  const total = jobs.length || 1;
  const efficiency = Math.round(((total - delays) / total) * 100);

  return {
    activeJobs,
    efficiency,
    delays,
    completedThisMonth: completed, // Simplified: assumes all completed are this month
  };
};

export const useForgeStore = create<ForgeStore>((set, get) => ({
  jobs: [],
  stats: initialStats,
  loading: false,
  error: null,

  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'forge_jobs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const jobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Defaults
        add_date: doc.data().add_date || new Date().toISOString().split('T')[0],
        progress: doc.data().progress || 0,
        status: doc.data().status || 'Pending',
      })) as ForgeJob[];

      set({ 
        jobs, 
        stats: calculateStats(jobs),
        loading: false 
      });
    } catch (error: any) {
      console.warn('Fetching forge jobs failed, falling back to mock:', error);
      const mockJobs: ForgeJob[] = [
        { id: 'JOB-2023-001', projectId: 'p1', project: 'Fabrika Otomasyon', status: 'In Progress', progress: 65, step: 'Montaj', priority: 'High', technician: 'Ahmet Y.', add_date: '2023-12-01' },
    { id: 'JOB-2023-002', projectId: 'p2', project: 'Pano Taslağı v4', status: 'Pending', progress: 0, step: 'Hazırlık', priority: 'Medium', technician: '-', add_date: '2023-12-05' },
    { id: 'JOB-2023-003', projectId: 'p3', project: 'Saha Dağıtım Kutusu', status: 'Completed', progress: 100, step: 'Test', priority: 'High', technician: 'Mehmet K.', add_date: '2023-11-20' },
      ];
      set({ 
        jobs: mockJobs, 
        stats: calculateStats(mockJobs),
        loading: false 
      });
    }
  },

  addJob: async (data) => {
    set({ loading: true, error: null });
    try {
      const newJob = {
        ...data,
        status: 'Pending',
        progress: 0,
        step: 'Hazırlık',
        add_date: new Date().toISOString().split('T')[0],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'forge_jobs'), newJob);
      
      const jobWithId = { id: docRef.id, ...newJob } as ForgeJob;
      const updatedJobs = [jobWithId, ...get().jobs];
      
      set({ 
        jobs: updatedJobs,
        stats: calculateStats(updatedJobs),
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateJobProgress: async (id, progress, step) => {
    const currentJobs = get().jobs;
    const updatedJobs = currentJobs.map(j => 
      j.id === id ? { ...j, progress, step: step || j.step } : j
    );
    set({ jobs: updatedJobs, stats: calculateStats(updatedJobs) });

    try {
      await updateDoc(doc(db, 'forge_jobs', id), {
        progress,
        ...(step && { step }),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Failed to update job progress:', error);
      set({ jobs: currentJobs, stats: calculateStats(currentJobs) });
    }
  },

  updateJobStatus: async (id, status) => {
    const currentJobs = get().jobs;
    const updatedJobs = currentJobs.map(j => 
      j.id === id ? { ...j, status } : j
    );
    set({ jobs: updatedJobs, stats: calculateStats(updatedJobs) });

    try {
      await updateDoc(doc(db, 'forge_jobs', id), {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
       console.error('Failed to update job status:', error);
       set({ jobs: currentJobs, stats: calculateStats(currentJobs) });
    }
  },

  deleteJob: async (id) => {
    const currentJobs = get().jobs;
    const updatedJobs = currentJobs.filter(j => j.id !== id);
    set({ jobs: updatedJobs, stats: calculateStats(updatedJobs) });

    try {
      await deleteDoc(doc(db, 'forge_jobs', id));
    } catch (error) {
       console.error('Failed to delete job:', error);
       set({ jobs: currentJobs, stats: calculateStats(currentJobs) });
    }
  }
}));
