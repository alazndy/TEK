import { create } from 'zustand';
import { GanttTask } from '@/types/gantt';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { addDays, format } from 'date-fns';

interface GanttState {
  tasks: GanttTask[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  // Actions
  fetchTasks: (projectId?: string) => Promise<void>;
  subscribeToTasks: (projectId?: string) => void;
  unsubscribeAll: () => void;
  addTask: (task: Omit<GanttTask, 'id' | 'order'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<GanttTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (taskIds: string[]) => Promise<void>;

  // Helpers
  getTasksByProject: (projectId: string) => GanttTask[];
  getTaskById: (id: string) => GanttTask | undefined;
}

// Helper: Convert Firestore timestamps
const convertTask = (doc: any): GanttTask => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    startDate: data.startDate?.toDate ? format(data.startDate.toDate(), 'yyyy-MM-dd') : data.startDate,
    endDate: data.endDate?.toDate ? format(data.endDate.toDate(), 'yyyy-MM-dd') : data.endDate,
  };
};

export const useGanttStore = create<GanttState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  unsubscribe: null,

  fetchTasks: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      let q;
      if (projectId) {
        q = query(
          collection(db, 'ganttTasks'),
          where('projectId', '==', projectId),
          orderBy('order', 'asc')
        );
      } else {
        q = query(collection(db, 'ganttTasks'), orderBy('order', 'asc'));
      }

      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map(convertTask);
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Error fetching Gantt tasks:', error);
      set({ error: 'Görevler yüklenirken hata oluştu', isLoading: false });
    }
  },

  subscribeToTasks: (projectId) => {
    let q;
    if (projectId) {
      q = query(
        collection(db, 'ganttTasks'),
        where('projectId', '==', projectId),
        orderBy('order', 'asc')
      );
    } else {
      q = query(collection(db, 'ganttTasks'), orderBy('order', 'asc'));
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const tasks = snapshot.docs.map(convertTask);
        set({ tasks });
      },
      (error) => {
        console.error('Gantt subscription error:', error);
        set({ error: 'Görev senkronizasyon hatası' });
      }
    );

    set({ unsubscribe: unsub });
  },

  unsubscribeAll: () => {
    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();
    set({ unsubscribe: null });
  },

  addTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const { tasks } = get();
      const maxOrder = Math.max(...tasks.map(t => t.order), 0);

      const docRef = await addDoc(collection(db, 'ganttTasks'), {
        ...taskData,
        order: maxOrder + 1,
        startDate: Timestamp.fromDate(new Date(taskData.startDate)),
        endDate: Timestamp.fromDate(new Date(taskData.endDate)),
      });

      set({ isLoading: false });
      return docRef.id;
    } catch (error) {
      console.error('Error adding Gantt task:', error);
      set({ error: 'Görev eklenirken hata oluştu', isLoading: false });
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const updateData: any = { ...updates };

      // Convert dates to Timestamps
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(new Date(updates.endDate));
      }

      await updateDoc(doc(db, 'ganttTasks', id), updateData);
    } catch (error) {
      console.error('Error updating Gantt task:', error);
      set({ error: 'Görev güncellenirken hata oluştu' });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await deleteDoc(doc(db, 'ganttTasks', id));
    } catch (error) {
      console.error('Error deleting Gantt task:', error);
      set({ error: 'Görev silinirken hata oluştu' });
      throw error;
    }
  },

  reorderTasks: async (taskIds) => {
    try {
      const batch = taskIds.map((id, index) => 
        updateDoc(doc(db, 'ganttTasks', id), { order: index })
      );
      await Promise.all(batch);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      throw error;
    }
  },

  getTasksByProject: (projectId) => {
    return get().tasks.filter(t => t.projectId === projectId);
  },

  getTaskById: (id) => {
    return get().tasks.find(t => t.id === id);
  },
}));

// Create sample tasks for demo
export const createSampleGanttTasks = async (projectId: string) => {
  const { addTask } = useGanttStore.getState();
  const today = new Date();

  const sampleTasks = [
    {
      projectId,
      title: 'Proje Başlangıcı',
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
      progress: 100,
      status: 'done' as const,
      priority: 'high' as const,
      isMilestone: true,
    },
    {
      projectId,
      title: 'Gereksinim Analizi',
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(addDays(today, 5), 'yyyy-MM-dd'),
      progress: 80,
      status: 'in-progress' as const,
      priority: 'high' as const,
    },
    {
      projectId,
      title: 'Tasarım Aşaması',
      startDate: format(addDays(today, 6), 'yyyy-MM-dd'),
      endDate: format(addDays(today, 15), 'yyyy-MM-dd'),
      progress: 20,
      status: 'in-progress' as const,
      priority: 'medium' as const,
      dependencies: [],
    },
    {
      projectId,
      title: 'Geliştirme',
      startDate: format(addDays(today, 10), 'yyyy-MM-dd'),
      endDate: format(addDays(today, 30), 'yyyy-MM-dd'),
      progress: 0,
      status: 'todo' as const,
      priority: 'high' as const,
    },
    {
      projectId,
      title: 'Test & QA',
      startDate: format(addDays(today, 25), 'yyyy-MM-dd'),
      endDate: format(addDays(today, 35), 'yyyy-MM-dd'),
      progress: 0,
      status: 'todo' as const,
      priority: 'medium' as const,
    },
    {
      projectId,
      title: 'Deployment',
      startDate: format(addDays(today, 36), 'yyyy-MM-dd'),
      endDate: format(addDays(today, 38), 'yyyy-MM-dd'),
      progress: 0,
      status: 'todo' as const,
      priority: 'high' as const,
    },
    {
      projectId,
      title: 'Proje Tamamlandı',
      startDate: format(addDays(today, 40), 'yyyy-MM-dd'),
      endDate: format(addDays(today, 40), 'yyyy-MM-dd'),
      progress: 0,
      status: 'todo' as const,
      priority: 'high' as const,
      isMilestone: true,
    },
  ];

  for (const task of sampleTasks) {
    await addTask(task);
  }
};
