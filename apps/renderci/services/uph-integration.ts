/**
 * UPH Integration Service
 * Connects Renderci renders to UPH projects and tasks
 */

import { RenderProject, RenderItem, UPHIntegration } from '../types/project';

export interface UPHProject {
  id: string;
  name: string;
  description?: string;
}

export interface UPHTask {
  id: string;
  projectId: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
}

export interface UPHAttachment {
  id: string;
  taskId: string;
  type: 'render' | 'reference' | 'document';
  url: string;
  name: string;
  createdAt: number;
}

class UPHIntegrationService {
  private baseUrl = 'http://localhost:3002'; // UPH base URL
  private apiVersion = 'v1';

  /**
   * Check if UPH is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get list of UPH projects
   */
  async getProjects(): Promise<UPHProject[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/${this.apiVersion}/projects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    } catch (error) {
      console.error('UPH getProjects error:', error);
      return [];
    }
  }

  /**
   * Get tasks for a specific project
   */
  async getTasks(projectId: string): Promise<UPHTask[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/${this.apiVersion}/projects/${projectId}/tasks`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    } catch (error) {
      console.error('UPH getTasks error:', error);
      return [];
    }
  }

  /**
   * Attach a render to a task
   */
  async attachRenderToTask(
    taskId: string,
    render: RenderItem,
    name?: string
  ): Promise<UPHAttachment | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/${this.apiVersion}/tasks/${taskId}/attachments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            type: 'render',
            url: render.resultUrl,
            name: name || `Render - ${new Date(render.createdAt).toLocaleDateString('tr-TR')}`,
            metadata: {
              sourceUrl: render.sourceUrl,
              prompt: render.prompt,
              stylePreset: render.stylePreset,
              renderedAt: render.createdAt
            }
          })
        }
      );
      
      if (!response.ok) throw new Error('Failed to attach render');
      return response.json();
    } catch (error) {
      console.error('UPH attachRenderToTask error:', error);
      return null;
    }
  }

  /**
   * Sync entire Renderci project to UPH
   */
  async syncProject(
    renderProject: RenderProject,
    uphProjectId: string
  ): Promise<{ success: boolean; syncedCount: number }> {
    let syncedCount = 0;
    
    try {
      // Get existing tasks in UPH project
      const tasks = await this.getTasks(uphProjectId);
      
      // Find or create a "Renders" task
      let renderTask = tasks.find(t => t.title === 'Renders');
      
      if (!renderTask) {
        const createResponse = await fetch(
          `${this.baseUrl}/api/${this.apiVersion}/projects/${uphProjectId}/tasks`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              title: 'Renders',
              description: `Renderci'den senkronize edilen renderlar - ${renderProject.name}`,
              status: 'in-progress'
            })
          }
        );
        
        if (createResponse.ok) {
          renderTask = await createResponse.json();
        }
      }
      
      if (renderTask) {
        // Attach all renders
        for (const render of renderProject.renders) {
          const attachment = await this.attachRenderToTask(renderTask.id, render);
          if (attachment) syncedCount++;
        }
      }
      
      return { success: true, syncedCount };
    } catch (error) {
      console.error('UPH syncProject error:', error);
      return { success: false, syncedCount };
    }
  }

  /**
   * Open render in UPH context
   */
  openInUPH(projectId?: string, taskId?: string): void {
    let url = this.baseUrl;
    if (projectId) url += `/projects/${projectId}`;
    if (taskId) url += `/tasks/${taskId}`;
    
    window.open(url, '_blank');
  }
}

export const uphIntegration = new UPHIntegrationService();
