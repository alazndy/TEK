import { StateCreator } from 'zustand';
import { ProjectTask, Project, Subtask, TaskComment } from '@/types/project';
import { RepositoryFactory } from '@/lib/repositories/factory';

const projectRepository = RepositoryFactory.getProjectRepository();

export interface TaskSlice {
  tasks: Record<string, ProjectTask[]>; // projectId -> tasks map
  
  fetchProjectTasks: (projectId: string) => Promise<void>;
  addTask: (projectId: string, task: Omit<ProjectTask, 'id'>) => Promise<void>;
  toggleTask: (projectId: string, taskId: string, currentCompleted: boolean) => Promise<void>;
  updateTaskStatus: (projectId: string, taskId: string, status: import('@/types/project').TaskStatus) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  
  // Subtasks & Comments
  addSubtask: (projectId: string, taskId: string, title: string) => Promise<void>;
  toggleSubtask: (projectId: string, taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (projectId: string, taskId: string, subtaskId: string) => Promise<void>;
  
  // Comments
  addComment: (projectId: string, taskId: string, text: string) => Promise<void>;
  deleteComment: (projectId: string, taskId: string, commentId: string) => Promise<void>;
  
  getProjectTasks: (projectId: string) => ProjectTask[];
  
  // Integrations
  syncGitHubIssues: (projectId: string) => Promise<void>;
}

export const createTaskSlice: StateCreator<TaskSlice> = (set, get) => ({
  tasks: {},

  getProjectTasks: (projectId) => get().tasks[projectId] || [],

  fetchProjectTasks: async (projectId) => {
      try {
          const projectTasks = await projectRepository.getTasks(projectId);
          
          set(state => ({
              tasks: {
                  ...state.tasks,
                  [projectId]: projectTasks
              }
          }));
      } catch (error) {
          console.error(`Error fetching tasks for project ${projectId}:`, error);
      }
  },

  addTask: async (projectId, task) => {
      try {
          const id = await projectRepository.addTask(projectId, task);
          const newTask: ProjectTask = { ...task, id };
          
          set(state => ({
              tasks: {
                  ...state.tasks,
                  [projectId]: [...(state.tasks[projectId] || []), newTask]
              }
          }));
      } catch (error: any) {
           console.error("Error adding task:", error);
      }
  },

  toggleTask: async (projectId, taskId, currentCompleted) => {
      try {
          await projectRepository.updateTask(projectId, taskId, { completed: !currentCompleted });
          
          set(state => ({
              tasks: {
                  ...state.tasks,
                  [projectId]: (state.tasks[projectId] || []).map(t => 
                      t.id === taskId ? { ...t, completed: !currentCompleted } : t
                  )
              }
          }));
      } catch (error: any) {
          console.error("Error toggling task:", error);
      }
  },

  updateTaskStatus: async (projectId, taskId, status) => {
      try {
          const updates = { status, completed: status === 'done' };
          await projectRepository.updateTask(projectId, taskId, updates);
          
          set(state => ({
              tasks: {
                  ...state.tasks,
                  [projectId]: (state.tasks[projectId] || []).map(t => 
                      t.id === taskId ? { ...t, ...updates } : t
                  )
              }
          }));
      } catch (error: any) {
          console.error("Error updating task status:", error);
      }
  },

  deleteTask: async (projectId, taskId) => {
      try {
           await projectRepository.deleteTask(projectId, taskId);
           
           set(state => ({
               tasks: {
                   ...state.tasks,
                   [projectId]: (state.tasks[projectId] || []).filter(t => t.id !== taskId)
               }
           }));
      } catch (error: any) {
          console.error("Error deleting task:", error);
      }
  },

  addSubtask: async (projectId, taskId, title) => {
      const task = get().tasks[projectId]?.find(t => t.id === taskId);
      if (!task) return;

      const newSubtask: Subtask = {
          id: Date.now().toString(),
          title,
          completed: false
      };
      const updatedSubtasks = [...(task.subtasks || []), newSubtask];

      try {
          await projectRepository.updateSubtasks(projectId, taskId, updatedSubtasks);
          set(state => ({
              tasks: {
                  ...state.tasks,
                  [projectId]: state.tasks[projectId].map(t => 
                      t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t
                  )
              }
          }));
      } catch (error: any) {
          console.error("Error adding subtask:", error);
      }
  },

  toggleSubtask: async (projectId, taskId, subtaskId) => {
      const task = get().tasks[projectId]?.find(t => t.id === taskId);
      if (!task || !task.subtasks) return;

      const updatedSubtasks = task.subtasks.map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
      );

      try {
          await projectRepository.updateSubtasks(projectId, taskId, updatedSubtasks);
          set(state => ({
              tasks: {
                  ...state.tasks,
                  [projectId]: state.tasks[projectId].map(t => 
                      t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t
                  )
              }
          }));
      } catch (error: any) {
          console.error("Error toggling subtask:", error);
      }
  },

  deleteSubtask: async (projectId, taskId, subtaskId) => {
      const task = get().tasks[projectId]?.find(t => t.id === taskId);
      if (!task || !task.subtasks) return;

      const updatedSubtasks = task.subtasks.filter(s => s.id !== subtaskId);

      try {
          await projectRepository.updateSubtasks(projectId, taskId, updatedSubtasks);
          set(state => ({
              tasks: {
                  ...state.tasks,
                  [projectId]: state.tasks[projectId].map(t => 
                      t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t
                  )
              }
          }));
      } catch (error: any) {
          console.error("Error deleting subtask:", error);
      }
  },

  addComment: async (projectId, taskId, text) => {
      const task = get().tasks[projectId]?.find(t => t.id === taskId);
      if (!task) return;

      const newComment: TaskComment = {
          id: Date.now().toString(),
          text,
          createdAt: new Date().toISOString(),
          userId: 'current-user', 
          userName: 'You'
      };
      const updatedComments = [...(task.comments || []), newComment];

      try {
          await projectRepository.updateComments(projectId, taskId, updatedComments);
          set(state => ({
              tasks: {
                  ...state.tasks,
                  [projectId]: state.tasks[projectId].map(t => 
                      t.id === taskId ? { ...t, comments: updatedComments } : t
                  )
              }
          }));
      } catch (error: any) {
          console.error("Error adding comment:", error);
      }
  },

  deleteComment: async (projectId, taskId, commentId) => {
      const task = get().tasks[projectId]?.find(t => t.id === taskId);
      if (!task || !task.comments) return;

      const updatedComments = task.comments.filter(c => c.id !== commentId);

      try {
          await projectRepository.updateComments(projectId, taskId, updatedComments);
          set(state => ({
              tasks: {
                  ...state.tasks,
                  [projectId]: state.tasks[projectId].map(t => 
                      t.id === taskId ? { ...t, comments: updatedComments } : t
                  )
              }
          }));
      } catch (error: any) {
          console.error("Error deleting comment:", error);
      }
  },

  syncGitHubIssues: async (projectId) => {
      console.log("Syncing GitHub issues for project:", projectId);
      
      const mockIssues = [
          { title: "Fix login page responsiveness", state: "open" },
          { title: "Update dependency versions", state: "open" },
          { title: "Refactor inventory search logic", state: "closed" }
      ];

      const currentTasks = get().tasks[projectId] || [];

      try {
          for (const issue of mockIssues) {
              if (currentTasks.some(t => t.title === issue.title)) continue;

              const newTask: Omit<ProjectTask, 'id'> = {
                  title: issue.title,
                  completed: issue.state === 'closed',
                  status: issue.state === 'closed' ? 'done' : 'todo',
                  dueDate: new Date(Date.now() + 86400000 * 7).toISOString() 
              };

              const id = await projectRepository.addTask(projectId, newTask);
              const taskWithId = { ...newTask, id };

              set(state => ({
                  tasks: {
                      ...state.tasks,
                      [projectId]: [...(state.tasks[projectId] || []), taskWithId]
                   }
              }));
          }
          console.log("GitHub sync complete");
      } catch (error) {
          console.error("Error syncing GitHub issues:", error);
      }
  }
});
