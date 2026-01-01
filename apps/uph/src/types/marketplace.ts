export type ModuleCategory = 'Operations' | 'Engineering' | 'Finance' | 'HR' | 'Productivity' | 'Integration';
export type ModuleType = 'app' | 'addon' | 'integration';

export interface MarketplaceModule {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: ModuleCategory;
  type: ModuleType;
  parentId?: string; // If this is an addon, which app does it belong to?
  price: number;
  isPopular?: boolean;
  isNew?: boolean;
  features: string[]; // List of specific technical feature keys enabled
  version: string;
}

export interface InstalledModule {
  moduleId: string;
  installedAt: string;
  status: 'active' | 'expired' | 'disabled';
  autoRenew: boolean;
}

// Maps specific technical feature keys to their required module/addon IDs
// This allows us to check checkAccess('flux_charts') -> checks if 'flux-analytics' is installed
export const FEATURE_TO_MODULE_MAP: Record<string, string> = {
  // Flux Features
  'flux_core': 'flux-core',
  'flux_charts': 'flux-analytics',
  
  // Forge Features
  'forge_core': 'forge-core',
  'forge_3d': 'forge-3d',

  // ENV-I Features
  'envi_access': 'envi-core',
  'envi_evm_pro': 'envi-evm',

  // Weave Features
  'weave_access': 'weave-core',
  'weave_risk_ai': 'weave-risk',

  // Renderci Features
  'renderci_access': 'renderci-core',
  'renderci_gpu': 'renderci-kluster',

  // T-SA Features
  'tsa_access': 'tsa-core',

  // Integrations
  'flux_forge_sync': 'smart-link',
  'envi_weave_sync': 'eco-sync'
};
