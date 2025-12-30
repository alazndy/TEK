import { WeaveDesign } from '@/types/project';
import { Product } from '@/types/inventory';

// Weave Types (Simplified for what we need)
interface WeaveProjectData {
  pages: {
    instances: {
      templateId: string;
      id: string;
    }[];
  }[];
  templates: {
    id: string;
    name: string;
    modelNumber?: string;
    envInventoryId?: string;
  }[];
}

export interface BOMItem {
  id: string; // Template ID or Inventory ID
  name: string;
  modelNumber?: string;
  quantity: number;
  matchedInventoryId?: string; // If found in UPH Inventory
  status: 'matched' | 'unmatched';
}

export const BOMService = {
  parseWeaveDesign(design: WeaveDesign, inventory: Product[]): BOMItem[] {
    if (!design.projectData) return [];

    try {
      const data: WeaveProjectData = JSON.parse(design.projectData);
      const counts = new Map<string, number>();

      // 1. Count Instances
      data.pages.forEach(page => {
        page.instances.forEach(instance => {
          counts.set(instance.templateId, (counts.get(instance.templateId) || 0) + 1);
        });
      });

      // 2. Map to Templates & Inventory
      const bom: BOMItem[] = [];
      
      counts.forEach((qty, templateId) => {
        const template = data.templates.find(t => t.id === templateId);
        if (!template) return;

        // Try to match with Inventory
        // Strategy 1: Direct ID match (if `envInventoryId` exists)
        // Strategy 2: Fuzzy Name match (fallback)
        
        let matchedItem = inventory.find(p => p.id === template.envInventoryId);
        
        if (!matchedItem && template.modelNumber) {
           // Fallback: match by model number
           matchedItem = inventory.find(p => 
              p.modelNumber?.toLowerCase() === template.modelNumber?.toLowerCase()
           );
        }

        if (!matchedItem) {
            // Fallback: match by exact name
            matchedItem = inventory.find(p => p.name.toLowerCase() === template.name.toLowerCase());
        }

        bom.push({
          id: template.id,
          name: matchedItem ? matchedItem.name : template.name,
          modelNumber: matchedItem ? matchedItem.modelNumber : template.modelNumber,
          quantity: qty,
          matchedInventoryId: matchedItem?.id,
          status: matchedItem ? 'matched' : 'unmatched'
        });
      });

      return bom;

    } catch (error) {
      console.error("Failed to parse Weave Project Data", error);
      return [];
    }
  }
};
