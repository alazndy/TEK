
import { Project, ProjectTask, ProjectFile, WeaveDesign, PCBDesign, ThreeDModel, Subtask, TaskComment } from '@/types/project';

export interface IProjectRepository {
    all(): Promise<Project[]>;
    getById(id: string): Promise<Project | null>;
    create(data: Omit<Project, 'id'>): Promise<string>;
    update(id: string, data: Partial<Project>): Promise<void>;
    delete(id: string): Promise<void>;
    
    // Sub-collections or specialized queries
    getTasks(projectId: string): Promise<ProjectTask[]>;
    addTask(projectId: string, data: Omit<ProjectTask, 'id'>): Promise<string>;
    updateTask(projectId: string, taskId: string, data: Partial<ProjectTask>): Promise<void>;
    deleteTask(projectId: string, taskId: string): Promise<void>;

    // Subtasks & Comments (can be part of updateTask if stored in array, but separate methods help)
    updateSubtasks(projectId: string, taskId: string, subtasks: Subtask[]): Promise<void>;
    updateComments(projectId: string, taskId: string, comments: TaskComment[]): Promise<void>;

    syncReadme(projectId: string, content: string): Promise<void>;
}

export interface IInventoryRepository {
    // To be defined for ENV-I/UPH Shared use
    all(): Promise<any[]>;
    // ...
}
