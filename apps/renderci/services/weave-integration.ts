/**
 * Weave Integration Service
 * Connects Renderci renders to Weave PCB designs and BOMs
 */

import { RenderItem, WeaveIntegration } from '../types/project';

export interface WeaveProject {
  id: string;
  name: string;
  type: 'pcb' | 'schematic' | 'mechanical';
}

export interface WeaveBOM {
  id: string;
  projectId: string;
  name: string;
  components: WeaveComponent[];
}

export interface WeaveComponent {
  id: string;
  designator: string;
  partNumber: string;
  description: string;
  quantity: number;
  color?: string; // For overlay rendering
  bounds?: { x: number; y: number; width: number; height: number };
}

export interface WeaveRenderOverlay {
  components: {
    id: string;
    designator: string;
    color: string;
    bounds: { x: number; y: number; width: number; height: number };
  }[];
}

class WeaveIntegrationService {
  private baseUrl = 'http://localhost:3003'; // Weave base URL
  private apiVersion = 'v1';

  /**
   * Check if Weave is available
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
   * Get list of Weave projects
   */
  async getProjects(): Promise<WeaveProject[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/${this.apiVersion}/projects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    } catch (error) {
      console.error('Weave getProjects error:', error);
      return [];
    }
  }

  /**
   * Get BOM for a project
   */
  async getBOM(projectId: string): Promise<WeaveBOM | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/${this.apiVersion}/projects/${projectId}/bom`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch BOM');
      return response.json();
    } catch (error) {
      console.error('Weave getBOM error:', error);
      return null;
    }
  }

  /**
   * Get component overlay data for rendering
   */
  async getComponentOverlay(projectId: string): Promise<WeaveRenderOverlay | null> {
    try {
      const bom = await this.getBOM(projectId);
      if (!bom) return null;
      
      // Generate overlay from BOM components
      const overlay: WeaveRenderOverlay = {
        components: bom.components
          .filter(c => c.bounds) // Only components with position data
          .map(c => ({
            id: c.id,
            designator: c.designator,
            color: c.color || this.getDefaultColor(c.designator),
            bounds: c.bounds!
          }))
      };
      
      return overlay;
    } catch (error) {
      console.error('Weave getComponentOverlay error:', error);
      return null;
    }
  }

  /**
   * Get default color based on component designator
   */
  private getDefaultColor(designator: string): string {
    const prefix = designator.charAt(0).toUpperCase();
    const colorMap: Record<string, string> = {
      'R': '#ef4444', // Resistors - Red
      'C': '#3b82f6', // Capacitors - Blue
      'L': '#8b5cf6', // Inductors - Purple
      'U': '#22c55e', // ICs - Green
      'Q': '#f59e0b', // Transistors - Amber
      'D': '#ec4899', // Diodes - Pink
      'J': '#06b6d4', // Connectors - Cyan
      'SW': '#64748b', // Switches - Slate
    };
    return colorMap[prefix] || '#94a3b8';
  }

  /**
   * Send render back to Weave as project image
   */
  async attachRenderToProject(
    projectId: string,
    render: RenderItem,
    type: 'render' | '3d-view' | 'documentation' = 'render'
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/${this.apiVersion}/projects/${projectId}/images`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            type,
            url: render.resultUrl,
            name: `Renderci - ${type}`,
            metadata: {
              prompt: render.prompt,
              stylePreset: render.stylePreset,
              renderedAt: render.createdAt
            }
          })
        }
      );
      
      return response.ok;
    } catch (error) {
      console.error('Weave attachRenderToProject error:', error);
      return false;
    }
  }

  /**
   * Open Weave project in new tab
   */
  openInWeave(projectId: string): void {
    window.open(`${this.baseUrl}/projects/${projectId}`, '_blank');
  }
}

export const weaveIntegration = new WeaveIntegrationService();
