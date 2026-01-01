
export interface WeaveBOMItem {
  designator: string;
  component: string;
  package: string;
  quantity: number;
  supplier?: string;
  supplierPartNumber?: string;
}

export function parseWeaveBOM(jsonContent: string): WeaveBOMItem[] {
  try {
    const data = JSON.parse(jsonContent);
    
    // Handle array of components directly
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        designator: item.designator || item.ref || 'N/A',
        component: item.component || item.value || 'Unknown Component',
        package: item.package || item.footprint || 'Unknown Package',
        quantity: Number(item.quantity) || 1,
        supplier: item.supplier,
        supplierPartNumber: item.supplierPartNumber || item.mpn
      }));
    }

    // Handle Weave Project format (nested bom)
    if (data.bom && Array.isArray(data.bom)) {
        return data.bom.map((item: any) => ({
            designator: item.designator || item.ref || 'N/A',
            component: item.component || item.value || 'Unknown Component',
            package: item.package || item.footprint || 'Unknown Package',
            quantity: Number(item.quantity) || 1,
            supplier: item.supplier,
            supplierPartNumber: item.supplierPartNumber || item.mpn
          }));
    }

    throw new Error("Invalid Weave BOM format");
  } catch (error) {
    console.error("Failed to parse Weave BOM:", error);
    throw new Error("Failed to parse file");
  }
}
