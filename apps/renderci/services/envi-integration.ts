/**
 * ENV-I Integration Service
 * Connects Renderci renders to ENV-I inventory assets
 */

import { RenderItem, ENVIIntegration } from '../types/project';

export interface ENVIAsset {
  id: string;
  name: string;
  sku: string;
  category: string;
  location?: string;
  imageUrl?: string;
}

export interface ENVIAssetImage {
  id: string;
  assetId: string;
  url: string;
  type: 'product' | 'render' | 'documentation' | 'inspection';
  isPrimary: boolean;
  createdAt: number;
}

export interface ENVISearchResult {
  assets: ENVIAsset[];
  total: number;
}

class ENVIIntegrationService {
  private baseUrl = 'http://localhost:3001'; // ENV-I base URL
  private apiVersion = 'v1';

  /**
   * Check if ENV-I is available
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
   * Search assets in ENV-I
   */
  async searchAssets(query: string, category?: string): Promise<ENVISearchResult> {
    try {
      const params = new URLSearchParams({ query });
      if (category) params.append('category', category);
      
      const response = await fetch(
        `${this.baseUrl}/api/${this.apiVersion}/assets/search?${params}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );
      
      if (!response.ok) throw new Error('Failed to search assets');
      return response.json();
    } catch (error) {
      console.error('ENVI searchAssets error:', error);
      return { assets: [], total: 0 };
    }
  }

  /**
   * Get asset by ID
   */
  async getAsset(assetId: string): Promise<ENVIAsset | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/${this.apiVersion}/assets/${assetId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );
      
      if (!response.ok) throw new Error('Failed to get asset');
      return response.json();
    } catch (error) {
      console.error('ENVI getAsset error:', error);
      return null;
    }
  }

  /**
   * Get assets that need renders
   */
  async getAssetsNeedingRenders(): Promise<ENVIAsset[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/${this.apiVersion}/assets?needsImage=true`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );
      
      if (!response.ok) throw new Error('Failed to get assets');
      return response.json();
    } catch (error) {
      console.error('ENVI getAssetsNeedingRenders error:', error);
      return [];
    }
  }

  /**
   * Attach render to asset as product image
   */
  async attachRenderToAsset(
    assetId: string,
    render: RenderItem,
    options: {
      type?: 'product' | 'render' | 'documentation' | 'inspection';
      isPrimary?: boolean;
    } = {}
  ): Promise<ENVIAssetImage | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/${this.apiVersion}/assets/${assetId}/images`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            url: render.resultUrl,
            type: options.type || 'render',
            isPrimary: options.isPrimary || false,
            metadata: {
              source: 'renderci',
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
      console.error('ENVI attachRenderToAsset error:', error);
      return null;
    }
  }

  /**
   * Auto-tag render based on asset metadata
   */
  async generateTagsFromAsset(assetId: string): Promise<string[]> {
    try {
      const asset = await this.getAsset(assetId);
      if (!asset) return [];
      
      // Generate tags from asset properties
      const tags: string[] = [];
      
      if (asset.category) tags.push(asset.category.toLowerCase());
      if (asset.sku) tags.push(`sku:${asset.sku}`);
      if (asset.name) {
        // Extract keywords from name
        const keywords = asset.name
          .toLowerCase()
          .split(/[\s\-_]+/)
          .filter(w => w.length > 2);
        tags.push(...keywords);
      }
      
      return [...new Set(tags)]; // Remove duplicates
    } catch (error) {
      console.error('ENVI generateTagsFromAsset error:', error);
      return [];
    }
  }

  /**
   * Batch update asset images
   */
  async batchAttachRenders(
    attachments: { assetId: string; render: RenderItem }[]
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;
    
    for (const { assetId, render } of attachments) {
      const result = await this.attachRenderToAsset(assetId, render);
      if (result) success++;
      else failed++;
    }
    
    return { success, failed };
  }

  /**
   * Open asset in ENV-I
   */
  openInENVI(assetId: string): void {
    window.open(`${this.baseUrl}/assets/${assetId}`, '_blank');
  }
}

export const enviIntegration = new ENVIIntegrationService();
