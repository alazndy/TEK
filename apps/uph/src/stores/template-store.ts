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
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ProjectTemplate, TaskTemplate, MilestoneTemplate, TemplateUsageLog } from '@/types/template';

interface TemplateState {
  templates: ProjectTemplate[];
  usageLogs: TemplateUsageLog[];
  loading: boolean;
  error: string | null;
}

interface TemplateActions {
  fetchTemplates: (userId?: string, isPublic?: boolean) => Promise<void>;
  addTemplate: (template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => Promise<string>;
  updateTemplate: (id: string, data: Partial<ProjectTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string, newName: string) => Promise<string>;
  
  createProjectFromTemplate: (templateId: string, projectData: {
    name: string;
    startDate: Date;
    userId: string;
    teamGroupId?: string;
  }) => Promise<{ tasks: TaskTemplate[]; milestones: MilestoneTemplate[] }>;
  
  createTemplateFromProject: (projectId: string, templateName: string, userId: string) => Promise<string>;
  
  logTemplateUsage: (templateId: string, templateName: string, projectId: string, projectName: string, userId: string) => Promise<void>;
  fetchUsageLogs: (templateId?: string) => Promise<void>;
  
  getTemplateById: (id: string) => ProjectTemplate | undefined;
  getTemplatesByCategory: (category: string) => ProjectTemplate[];
  getPopularTemplates: (limit?: number) => ProjectTemplate[];
  createTemplate: (template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => Promise<string>;
}

type TemplateStore = TemplateState & TemplateActions;

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  usageLogs: [],
  loading: false,
  error: null,

  fetchTemplates: async (userId, isPublic) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'projectTemplates'),
        orderBy('usageCount', 'desc')
      );
      
      const snapshot = await getDocs(q);
      let templates = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as ProjectTemplate[];
      
      // Client-side filtering
      if (userId) {
        templates = templates.filter(t => t.createdBy === userId || t.isPublic);
      }
      if (isPublic !== undefined) {
        templates = templates.filter(t => t.isPublic === isPublic);
      }
      
      set({ templates, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching templates:', error);
    }
  },

  addTemplate: async (templateData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const template = {
        ...templateData,
        usageCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'projectTemplates'), {
        ...template,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      const newTemplate: ProjectTemplate = { id: docRef.id, ...template };
      
      set(state => ({
        templates: [newTemplate, ...state.templates],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateTemplate: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      await updateDoc(doc(db, 'projectTemplates', id), {
        ...data,
        updatedAt: Timestamp.fromDate(now),
      });
      
      set(state => ({
        templates: state.templates.map(t => 
          t.id === id ? { ...t, ...data, updatedAt: now } : t
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteTemplate: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'projectTemplates', id));
      
      set(state => ({
        templates: state.templates.filter(t => t.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  duplicateTemplate: async (id, newName) => {
    const original = get().getTemplateById(id);
    if (!original) throw new Error('Template not found');
    
    const { id: _, createdAt, updatedAt, usageCount, ...templateData } = original;
    
    return await get().addTemplate({
      ...templateData,
      name: newName,
    });
  },

  createProjectFromTemplate: async (templateId, projectData) => {
    const template = get().getTemplateById(templateId);
    if (!template) throw new Error('Template not found');
    
    // Calculate task dates based on project start date
    const startDate = projectData.startDate;
    
    const tasks = template.tasks.map(task => ({
      ...task,
      id: crypto.randomUUID(),
      dueDate: task.daysOffset 
        ? new Date(startDate.getTime() + task.daysOffset * 24 * 60 * 60 * 1000)
        : undefined,
    }));
    
    const milestones = template.milestones.map(m => ({
      ...m,
      dueDate: new Date(startDate.getTime() + m.daysOffset * 24 * 60 * 60 * 1000),
    }));
    
    // Increment usage count
    await get().updateTemplate(templateId, {
      usageCount: template.usageCount + 1,
    });
    
    return { tasks, milestones };
  },

  createTemplateFromProject: async (projectId, templateName, userId) => {
    // This would need to fetch project data and create a template
    // Implementation depends on project store structure
    console.log('Creating template from project:', projectId);
    
    const now = new Date();
    const template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> = {
      name: templateName,
      description: `Template created from project`,
      category: 'Custom',
      defaultStatus: 'Planning',
      defaultPriority: 'Medium',
      tasks: [],
      materials: [],
      milestones: [],
      estimatedDuration: 30,
      tags: [],
      createdBy: userId,
      isPublic: false,
    };
    
    return await get().addTemplate(template);
  },

  logTemplateUsage: async (templateId, templateName, projectId, projectName, userId) => {
    try {
      const now = new Date();
      await addDoc(collection(db, 'templateUsageLogs'), {
        templateId,
        templateName,
        projectId,
        projectName,
        usedBy: userId,
        usedAt: Timestamp.fromDate(now),
      });
    } catch (error: any) {
      console.error('Error logging template usage:', error);
    }
  },

  fetchUsageLogs: async (templateId) => {
    try {
      let q;
      if (templateId) {
        q = query(
          collection(db, 'templateUsageLogs'),
          where('templateId', '==', templateId),
          orderBy('usedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'templateUsageLogs'),
          orderBy('usedAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      const usageLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        usedAt: doc.data().usedAt?.toDate() || new Date(),
      })) as TemplateUsageLog[];
      
      set({ usageLogs });
    } catch (error: any) {
      console.error('Error fetching usage logs:', error);
    }
  },

  getTemplateById: (id) => {
    return get().templates.find(t => t.id === id);
  },

  getTemplatesByCategory: (category) => {
    return get().templates.filter(t => t.category === category);
  },

  getPopularTemplates: (limit = 5) => {
    return [...get().templates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  },
  
  createTemplate: (template) => get().addTemplate(template),
}));
