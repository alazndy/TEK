import { StateCreator } from 'zustand';
import { Project } from '@/types/project';
import { RepositoryFactory } from '@/lib/repositories/factory';

const projectRepository = RepositoryFactory.getProjectRepository();

export interface ProjectSlice {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'userId' | 'spent' | 'completionPercentage' | 'files'>) => Promise<string>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  syncProjectReadme: (id: string) => Promise<void>;
  addCadDrawing: (projectId: string, drawing: import('@/types/project').CadDrawing) => Promise<void>;
  deleteCadDrawing: (projectId: string, drawingId: string) => Promise<void>;
}

export const createProjectSlice: StateCreator<ProjectSlice> = (set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
        let projects = await projectRepository.all();

        // Filter based on Team Group Membership
        try {
            // Get Current User and Groups from Auth Store
            const { useAuthStore } = await import('../auth-store');
            const { user, teamGroups } = useAuthStore.getState();

            if (user && user.role !== 'admin') {
                const myGroupIds = teamGroups
                    .filter(g => g.memberIds.includes(user.uid))
                    .map(g => g.id);

                projects = projects.filter(p => {
                    const isMyProject = p.userId === user.uid;
                    const isGroupProject = p.teamGroupId ? myGroupIds.includes(p.teamGroupId) : false;
                    return isMyProject || isGroupProject;
                });
            }
        } catch (e) {
            console.warn("Could not access Auth Store for filtering, showing all projects", e);
        }

        set({ projects });
    } catch (error: unknown) {
        console.error("Error fetching projects:", error);
    } finally {
        set({ isLoading: false });
    }
  },

  addProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
        const { user, teamGroups } = (await import('../auth-store')).useAuthStore.getState();
        
        // Calculate initial members (Owner + Team Group Members)
        let members = [user?.uid || 'anonymous'];
        if (projectData.teamGroupId) {
            const group = teamGroups.find(g => g.id === projectData.teamGroupId);
            if (group) {
                // Merge and deduplicate
                members = [...new Set([...members, ...group.memberIds])];
            }
        }

        const newProjectData = { 
            ...projectData, 
            userId: user?.uid || 'anonymous',
            members, // Persist access list
            logoUrl: projectData.logoUrl || '/logo.png',
            spent: 0, 
            completionPercentage: 0,
            isFavorite: false,
            files: [],
            color: projectData.color || '#3b82f6'
        };
        
        const id = await projectRepository.create(newProjectData);
        const newProject = { ...newProjectData, id } as Project;
        
        try {
            const { useActivityStore } = await import('../activity-store');
            useActivityStore.getState().addActivity({
                type: 'PROJECT_CREATED',
                title: 'New Project Created',
                description: `Project "${projectData.name}" created.`,
                metadata: { projectId: id }
            });
        } catch (e) {
            console.warn("Activity logging failed", e);
        }

        set(state => ({ 
            projects: [...state.projects, newProject], 
            isLoading: false 
        }));
        return id;
    } catch (error: unknown) {
        console.error("Error adding project:", error);
        set({ error: (error as Error).message || "Failed to add project", isLoading: false });
        throw error;
    }
  },

  updateProject: async (id, projectUpdate) => {
    set({ isLoading: true, error: null });
    try {
         await projectRepository.update(id, projectUpdate);
         set(state => ({
            projects: state.projects.map(p => p.id === id ? { ...p, ...projectUpdate } : p),
            isLoading: false
         }));
    } catch (error: unknown) {
         console.error("Error updating project:", error);
         set({ error: (error as Error).message || "Failed to update project", isLoading: false });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
        await projectRepository.delete(id);
        set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            isLoading: false
        }));
    } catch (error: unknown) {
        console.error("Error deleting project:", error);
        set({ error: (error as Error).message || "Failed to delete project", isLoading: false });
    }
  },

  getProject: (id: string) => get().projects.find((p) => p.id === id),

  syncProjectReadme: async (id) => {
    const project = get().projects.find(p => p.id === id);
    if (!project || !project.githubRepo) return;

    set({ isLoading: true });
    try {
        let readmeText = "";
        const repo = project.githubRepo;
        
        const tryFetch = async (branch: string) => {
            const url = `https://raw.githubusercontent.com/${repo}/${branch}/README.md`;
            const res = await fetch(url);
            if (res.ok) return await res.text();
            return null;
        };

        readmeText = await tryFetch('main') || await tryFetch('master') || "";

        if (readmeText) {
            await get().updateProject(id, { readmeContent: readmeText });
        }
    } catch (error) {
        console.error("Error syncing README:", error);
    } finally {
        set({ isLoading: false });
    }
  },

  addCadDrawing: async (projectId: string, drawing: import('@/types/project').CadDrawing) => {
    set({ isLoading: true });
    try {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) throw new Error('Project not found');

        const updatedDrawings = [...(project.cadDrawings || []), drawing];
        await projectRepository.update(projectId, { cadDrawings: updatedDrawings });
        
        set(state => ({
            projects: state.projects.map(p => 
                p.id === projectId ? { ...p, cadDrawings: updatedDrawings } : p
            ),
            isLoading: false
        }));
    } catch (error) {
        console.error("Error adding CAD drawing:", error);
        set({ error: "Failed to add CAD drawing", isLoading: false });
    }
  },

  deleteCadDrawing: async (projectId: string, drawingId: string) => {
    set({ isLoading: true });
    try {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) throw new Error('Project not found');

        const updatedDrawings = (project.cadDrawings || []).filter(d => d.id !== drawingId);
        await projectRepository.update(projectId, { cadDrawings: updatedDrawings });

        set(state => ({
            projects: state.projects.map(p => 
                p.id === projectId ? { ...p, cadDrawings: updatedDrawings } : p
            ),
            isLoading: false
        }));
    } catch (error) {
        console.error("Error deleting CAD drawing:", error);
        set({ error: "Failed to delete CAD drawing", isLoading: false });
    }
  }
});
