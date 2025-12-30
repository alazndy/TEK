import { create } from 'zustand';
import { 
  ResourceCapacity, 
  DailyCapacityPoint, 
  ResourceHeatmapData,
  ResourceLoad 
} from '@/types/resource';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { addDays, format, isWithinInterval, parseISO } from 'date-fns';

interface CapacityState {
  resources: ResourceCapacity[];
  isLoading: boolean;
  error: string | null;
  unsubscribeResources: Unsubscribe | null;
  
  // Actions
  fetchResources: () => Promise<void>;
  subscribeToResources: () => void;
  unsubscribeAll: () => void;
  addResource: (resource: Omit<ResourceCapacity, 'userId'>) => Promise<string>;
  updateResource: (userId: string, data: Partial<ResourceCapacity>) => Promise<void>;
  deleteResource: (userId: string) => Promise<void>;
  addAssignment: (userId: string, assignment: ResourceLoad) => Promise<void>;
  removeAssignment: (userId: string, projectId: string) => Promise<void>;
  
  // Computed
  calculateHeatmapData: (startDate: Date, days: number) => ResourceHeatmapData[];
  getBottlenecks: (startDate: Date, days: number) => any[];
  getReplacementSuggestions: (date: string, requiredHours: number) => ResourceCapacity[];
}

// Helper: Convert Firestore data
const convertResourceData = (data: Record<string, unknown>): Partial<ResourceCapacity> => {
  const result = { ...data };
  
  // Convert exceptions dates
  if (result.exceptions && Array.isArray(result.exceptions)) {
    result.exceptions = (result.exceptions as { date: unknown; availableHours: number; reason?: string }[]).map((e) => ({
      ...e,
      date: (e.date as any) instanceof Timestamp ? format((e.date as any).toDate(), 'yyyy-MM-dd') : e.date
    }));
  }
  
  // Convert assignment dates
  if (result.currentAssignments && Array.isArray(result.currentAssignments)) {
    result.currentAssignments = (result.currentAssignments as ResourceLoad[]).map((a) => ({
      ...a,
      startDate: (a.startDate as any) instanceof Timestamp ? format((a.startDate as any).toDate(), 'yyyy-MM-dd') : a.startDate,
      endDate: (a.endDate as any) instanceof Timestamp ? format((a.endDate as any).toDate(), 'yyyy-MM-dd') : a.endDate
    }));
  }
  
  return result as Partial<ResourceCapacity>;
};

export const useResourceStore = create<CapacityState>((set, get) => ({
  resources: [],
  isLoading: false,
  error: null,
  unsubscribeResources: null,

  // Fetch resources (one-time)
  fetchResources: async () => {
    set({ isLoading: true, error: null });
    try {
      const resourcesQuery = query(collection(db, 'resources'), orderBy('displayName'));
      const snapshot = await getDocs(resourcesQuery);
      const resources = snapshot.docs.map(doc => ({
        userId: doc.id,
        ...convertResourceData(doc.data())
      })) as ResourceCapacity[];
      
      set({ resources, isLoading: false });
    } catch (error) {
      console.error('Error fetching resources:', error);
      set({ error: 'Kaynaklar yüklenirken hata oluştu', isLoading: false });
    }
  },

  // Subscribe to resources (real-time)
  subscribeToResources: () => {
    const resourcesQuery = query(collection(db, 'resources'), orderBy('displayName'));
    const unsubscribe = onSnapshot(resourcesQuery,
      (snapshot) => {
        const resources = snapshot.docs.map(doc => ({
          userId: doc.id,
          ...convertResourceData(doc.data())
        })) as ResourceCapacity[];
        set({ resources });
      },
      (error) => {
        console.error('Resource subscription error:', error);
        set({ error: 'Kaynak senkronizasyon hatası' });
      }
    );
    set({ unsubscribeResources: unsubscribe });
  },

  // Unsubscribe
  unsubscribeAll: () => {
    const { unsubscribeResources } = get();
    if (unsubscribeResources) unsubscribeResources();
    set({ unsubscribeResources: null });
  },

  // Add resource
  addResource: async (resourceData) => {
    set({ isLoading: true, error: null });
    try {
      const docRef = await addDoc(collection(db, 'resources'), {
        ...resourceData,
        currentAssignments: resourceData.currentAssignments || [],
        exceptions: resourceData.exceptions || []
      });
      set({ isLoading: false });
      return docRef.id;
    } catch (error) {
      console.error('Error adding resource:', error);
      set({ error: 'Kaynak eklenirken hata oluştu', isLoading: false });
      throw error;
    }
  },

  // Update resource
  updateResource: async (userId, data) => {
    try {
      const docRef = doc(db, 'resources', userId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating resource:', error);
      set({ error: 'Kaynak güncellenirken hata oluştu' });
      throw error;
    }
  },

  // Delete resource
  deleteResource: async (userId) => {
    try {
      await deleteDoc(doc(db, 'resources', userId));
    } catch (error) {
      console.error('Error deleting resource:', error);
      set({ error: 'Kaynak silinirken hata oluştu' });
      throw error;
    }
  },

  // Add assignment to resource
  addAssignment: async (userId, assignment) => {
    const resource = get().resources.find(r => r.userId === userId);
    if (!resource) throw new Error('Resource not found');
    
    const updatedAssignments = [...resource.currentAssignments, assignment];
    await get().updateResource(userId, { currentAssignments: updatedAssignments });
  },

  // Remove assignment from resource
  removeAssignment: async (userId, projectId) => {
    const resource = get().resources.find(r => r.userId === userId);
    if (!resource) throw new Error('Resource not found');
    
    const updatedAssignments = resource.currentAssignments.filter(a => a.projectId !== projectId);
    await get().updateResource(userId, { currentAssignments: updatedAssignments });
  },

  // Calculate heatmap data
  calculateHeatmapData: (startDate: Date, days: number) => {
    const { resources } = get();
    const heatmap: ResourceHeatmapData[] = [];

    resources.forEach(resource => {
      const dailyData: DailyCapacityPoint[] = [];

      for (let i = 0; i < days; i++) {
        const currentDate = addDays(startDate, i);
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        const dayOfWeek = currentDate.getDay();
        const isWorkingDay = resource.weeklyWorkingDays.includes(dayOfWeek);
        
        const exception = resource.exceptions.find(e => e.date === dateStr);
        
        const baseCapacity = isWorkingDay ? resource.standardDailyHours : 0;
        const actualCapacity = exception ? exception.availableHours : baseCapacity;

        let allocatedHours = 0;
        const dayAssignments: Array<{projectName: string, load: number}> = [];

        resource.currentAssignments.forEach(assignment => {
          const start = parseISO(assignment.startDate);
          const end = parseISO(assignment.endDate);

          if (isWithinInterval(currentDate, { start, end })) {
            allocatedHours += assignment.hoursPerDay;
            dayAssignments.push({
              projectName: assignment.projectName,
              load: assignment.hoursPerDay
            });
          }
        });

        const availableHours = Math.max(0, actualCapacity - allocatedHours);
        const utilization = actualCapacity > 0 ? (allocatedHours / actualCapacity) * 100 : 0;

        dailyData.push({
          date: dateStr,
          totalCapacity: actualCapacity,
          allocatedHours,
          availableHours,
          utilization,
          assignments: dayAssignments
        });
      }

      heatmap.push({
        userId: resource.userId,
        displayName: resource.displayName,
        dailyData
      });
    });

    return heatmap;
  },

  // Get bottlenecks
  getBottlenecks: (startDate, days) => {
    const heatmap = get().calculateHeatmapData(startDate, days);
    const bottlenecks: any[] = [];

    heatmap.forEach(h => {
      const overloads = h.dailyData.filter(d => d.utilization > 100);
      if (overloads.length > 0) {
        bottlenecks.push({
          userId: h.userId,
          displayName: h.displayName,
          daysOverloaded: overloads.length,
          dates: overloads.map(o => o.date)
        });
      }
    });

    return bottlenecks;
  },

  // Get replacement suggestions
  getReplacementSuggestions: (date, requiredHours) => {
    const { resources } = get();
    return resources.filter(resource => {
      const heatmap = get().calculateHeatmapData(parseISO(date), 1);
      const dayData = heatmap.find(h => h.userId === resource.userId)?.dailyData[0];
      return dayData && dayData.availableHours >= requiredHours;
    });
  }
}));
