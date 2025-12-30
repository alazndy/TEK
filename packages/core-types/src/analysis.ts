
export interface SpecificationItem {
  parameter: string;
  value: string;
  unit?: string;
  condition?: string;
  group?: string; 
  criticality?: 'Essential' | 'Desirable' | 'Optional';
  sourceReference?: string; 
}

export interface GeneralProvisions {
  warrantyConditions: string;
  maintenanceRequirements: string;
  installationAndCommissioning: string;
  trainingRequirements: string;
  deliveryAndLogistics: string;
  certificationRequirements: string[];
  otherTerms: string;
}

export interface MarketAnalysisResult {
  content: string; 
  sources: { title: string; uri: string }[]; 
}

export interface Product {
  id: string; 
  name: string;
  partNumber?: string;
  quantity?: string;
  category: string;
  description: string;
  specifications: SpecificationItem[];
  complianceStandards: string[];
  confidenceScore?: number; 
  marketAnalysis?: MarketAnalysisResult; 
}

export interface AnalysisResult {
  id: string; 
  version?: number; 
  fileName: string;
  timestamp: string;
  products: Product[];
  generalProvisions?: GeneralProvisions;
  summary: string;
}

export interface MarketSearchPreferences {
  region: string;
  priority: 'Price' | 'Quality' | 'Speed' | 'Balanced';
  additionalNotes?: string;
}
