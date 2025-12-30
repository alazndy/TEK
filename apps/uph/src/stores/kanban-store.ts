import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { 
  collectionGroup, 
  getDocs, 
  query, 
  limit,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  writeBatch
} from 'firebase/firestore';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: Date;
  projectId: string; // Required for subcollection path
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: KanbanTask[];
}

interface KanbanState {
  columns: KanbanColumn[];
  isLoading: boolean;
  
  fetchGlobalTasks: () => Promise<void>;
  moveTask: (task: KanbanTask, toStatus: TaskStatus, newOrder: number) => Promise<void>;
  addTask: (projectId: string, task: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'projectId'>) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updates: Partial<KanbanTask>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  batchReorder: (tasks: KanbanTask[]) => Promise<void>;
}

const defaultColumns: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', tasks: [] },
  { id: 'todo', title: 'To Do', tasks: [] },
  { id: 'in-progress', title: 'In Progress', tasks: [] },
  { id: 'review', title: 'Review', tasks: [] },
  { id: 'done', title: 'Done', tasks: [] },
];

export const useKanbanStore = create<KanbanState>((set, get) => ({
  columns: defaultColumns,
  isLoading: false,

  batchReorder: async (updatedTasks) => {
    try {
      const batch = writeBatch(db);
      
      updatedTasks.forEach((task, index) => {
        const taskRef = doc(db, 'projects', task.projectId, 'tasks', task.id);
        batch.update(taskRef, { 
          order: index, 
          status: task.status, // Ensure status is synced if moved between columns
          updatedAt: new Date() 
        });
      });

      await batch.commit();
      
      // Optimistically update local state or refetch
      // For simplicity/safety, we refetch to ensure server state matches
      get().fetchGlobalTasks(); 
    } catch (error) {
      console.error("Error batch reordering tasks:", error);
    }
  },

  fetchGlobalTasks: async () => {
    set({ isLoading: true });
    try {
      // Fetch all tasks from all projects using collectionGroup
      // Requires 'tasks' subcollection to be named consistently
      // Added orderBy to get most recent tasks and filter out old garbage
      const q = query(collectionGroup(db, 'tasks'), orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      
      const tasks: KanbanTask[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // We need to know projectId. Firestore doc ref has parent path.
        // path: projects/{projectId}/tasks/{taskId}
        const projectId = doc.ref.parent.parent?.id || 'unknown';

        if (!data.title) return; // Skip malformed tasks

        tasks.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            status: data.status || 'todo',
            priority: data.priority || 'medium',
            projectId: projectId,
            order: data.order || 0,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        });
      });

      // Group by columns
      const newColumns = defaultColumns.map(col => ({
        ...col,
        tasks: tasks.filter(t => t.status === col.id).sort((a, b) => a.order - b.order)
      }));

      set({ columns: newColumns, isLoading: false });
    } catch (error) {
      console.error("Error fetching global tasks:", error);
    } finally {
        set({ isLoading: false });
    }
  },

  moveTask: async (task, toStatus, newOrder) => {
    // Optimistic Update
    // ... logic for optimistic update omitted for brevity, focusing on persistence
    
    try {
        const taskRef = doc(db, 'projects', task.projectId, 'tasks', task.id);
        await updateDoc(taskRef, {
            status: toStatus,
            order: newOrder,
            updatedAt: new Date()
        });
        
        // Refetch to ensure consistency or implement full optimistic update logic
        get().fetchGlobalTasks();
    } catch (error) {
        console.error("Error moving task:", error);
    }
  },

  addTask: async (projectId, taskData) => {
    try {
        await addDoc(collection(db, 'projects', projectId, 'tasks'), {
            ...taskData,
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        get().fetchGlobalTasks();
    } catch (error) {
        console.error("Error adding global task:", error);
    }
  },

  updateTask: async (projectId, taskId, updates) => {
      try {
        const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
        await updateDoc(taskRef, {
            ...updates,
            updatedAt: new Date()
        });
        get().fetchGlobalTasks();
      } catch (error) {
          console.error("Error updating task:", error);
      }
  },

  deleteTask: async (projectId, taskId) => {
      try {
        await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId));
        get().fetchGlobalTasks();
      } catch (error) {
          console.error("Error deleting task:", error);
      }
  }
}));
