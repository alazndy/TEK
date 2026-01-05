import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  RenderProject, 
  RenderItem, 
  RenderVersion, 
  ProjectSettings,
  BatchQueue,
  BatchItem,
  BatchItemStatus
} from '../types/project';
import { v4 as uuid } from 'uuid';

interface ProjectState {
  // Projects
  projects: RenderProject[];
  activeProjectId: string | null;
  
  // Batch Queue
  batchQueue: BatchQueue;
  
  // Actions - Projects
  createProject: (name: string, description?: string) => RenderProject;
  updateProject: (id: string, updates: Partial<RenderProject>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  getActiveProject: () => RenderProject | null;
  
  // Actions - Renders
  addRenderToProject: (projectId: string, render: Omit<RenderItem, 'id' | 'createdAt' | 'versions'>) => RenderItem;
  addVersionToRender: (projectId: string, renderId: string, version: Omit<RenderVersion, 'id' | 'createdAt'>) => void;
  deleteRender: (projectId: string, renderId: string) => void;
  
  // Actions - Batch Queue
  addToBatch: (items: Omit<BatchItem, 'id' | 'status' | 'progress'>[]) => void;
  updateBatchItem: (id: string, updates: Partial<BatchItem>) => void;
  removeBatchItem: (id: string) => void;
  clearBatch: () => void;
  startBatch: () => void;
  pauseBatch: () => void;
  
  // Getters
  getProjectById: (id: string) => RenderProject | undefined;
  getRecentProjects: (limit?: number) => RenderProject[];
}

const defaultSettings: ProjectSettings = {
  defaultStylePreset: 'realistic',
  defaultResolution: '2K',
  autoSave: true,
  autoVersion: true,
  cloudSync: false,
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      batchQueue: {
        items: [],
        isRunning: false,
        currentIndex: 0,
        concurrency: 1,
      },
      
      // Project Actions
      createProject: (name: string, description?: string) => {
        const project: RenderProject = {
          id: uuid(),
          name,
          description,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          renders: [],
          settings: { ...defaultSettings },
          tags: [],
        };
        
        set((state: ProjectState) => ({ 
          projects: [project, ...state.projects],
          activeProjectId: project.id 
        }));
        
        return project;
      },
      
      updateProject: (id: string, updates: Partial<RenderProject>) => {
        set((state: ProjectState) => ({
          projects: state.projects.map(p => 
            p.id === id 
              ? { ...p, ...updates, updatedAt: Date.now() }
              : p
          )
        }));
      },
      
      deleteProject: (id: string) => {
        set((state: ProjectState) => ({
          projects: state.projects.filter(p => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId
        }));
      },
      
      setActiveProject: (id: string | null) => {
        set({ activeProjectId: id });
      },
      
      getActiveProject: () => {
        const state = get();
        return state.projects.find(p => p.id === state.activeProjectId) || null;
      },
      
      // Render Actions
      addRenderToProject: (projectId: string, renderData: Omit<RenderItem, 'id' | 'createdAt' | 'versions'>) => {
        const render: RenderItem = {
          id: uuid(),
          ...renderData,
          createdAt: Date.now(),
          versions: [],
        };
        
        set((state: ProjectState) => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { 
                  ...p, 
                  renders: [render, ...p.renders],
                  thumbnail: render.resultUrl,
                  updatedAt: Date.now() 
                }
              : p
          )
        }));
        
        return render;
      },
      
      addVersionToRender: (projectId: string, renderId: string, versionData: Omit<RenderVersion, 'id' | 'createdAt'>) => {
        const version: RenderVersion = {
          id: uuid(),
          ...versionData,
          createdAt: Date.now(),
        };
        
        set((state: ProjectState) => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? {
                  ...p,
                  renders: p.renders.map(r => 
                    r.id === renderId 
                      ? { ...r, versions: [...r.versions, version], resultUrl: version.url }
                      : r
                  ),
                  updatedAt: Date.now()
                }
              : p
          )
        }));
      },
      
      deleteRender: (projectId: string, renderId: string) => {
        set((state: ProjectState) => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { 
                  ...p, 
                  renders: p.renders.filter(r => r.id !== renderId),
                  updatedAt: Date.now()
                }
              : p
          )
        }));
      },
      
      // Batch Queue Actions
      addToBatch: (items: Omit<BatchItem, 'id' | 'status' | 'progress'>[]) => {
        const batchItems: BatchItem[] = items.map((item: any) => ({
          id: uuid(),
          ...item,
          status: 'pending' as BatchItemStatus,
          progress: 0,
        }));
        
        set((state: ProjectState) => ({
          batchQueue: {
            ...state.batchQueue,
            items: [...state.batchQueue.items, ...batchItems]
          }
        }));
      },
      
      updateBatchItem: (id: string, updates: Partial<BatchItem>) => {
        set((state: ProjectState) => ({
          batchQueue: {
            ...state.batchQueue,
            items: state.batchQueue.items.map(item => 
              item.id === id ? { ...item, ...updates } : item
            )
          }
        }));
      },
      
      removeBatchItem: (id: string) => {
        set((state: ProjectState) => ({
          batchQueue: {
            ...state.batchQueue,
            items: state.batchQueue.items.filter(item => item.id !== id)
          }
        }));
      },
      
      clearBatch: () => {
        set((state: ProjectState) => ({
          batchQueue: {
            ...state.batchQueue,
            items: [],
            currentIndex: 0,
            isRunning: false
          }
        }));
      },
      
      startBatch: () => {
        set((state: ProjectState) => ({
          batchQueue: { ...state.batchQueue, isRunning: true }
        }));
      },
      
      pauseBatch: () => {
        set((state: ProjectState) => ({
          batchQueue: { ...state.batchQueue, isRunning: false }
        }));
      },
      
      // Getters
      getProjectById: (id: string) => {
        return get().projects.find(p => p.id === id);
      },
      
      getRecentProjects: (limit = 5) => {
        return get().projects
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, limit);
      },
    }),
    {
      name: 'renderci-projects',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);
