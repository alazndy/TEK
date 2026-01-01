export type ModuleCategory = 'Operations' | 'Engineering' | 'Finance' | 'HR' | 'Productivity' | 'Integration';
export type ModuleType = 'app' | 'addon' | 'integration';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  stripeCustomerId?: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: ModuleCategory;
  type: ModuleType;
  parentId?: string; // If this is an addon, which app does it belong to?
  price: number;
  currency: string;
  isPopular?: boolean;
  isNew?: boolean;
  features: string[]; // List of specific technical feature keys enabled
  version: string;
  url?: string; // Optional URL for launching the app
  
  // Rich Content for Promotion Pages
  longDescription?: string;
  benefits?: string[];
  gallery?: string[]; // URLs specifically for the store page carousel
}

export interface Purchase {
  id: string;
  userId: string;
  moduleId: string;
  moduleName: string;
  type: 'one-time' | 'subscription';
  status: 'active' | 'cancelled' | 'expired';
  purchaseDate: string;
  expiryDate?: string;
  amount: number;
  currency: string;
  stripeSubscriptionId?: string;
  stripePaymentIntentId?: string;
}

export interface InstalledModule {
  moduleId: string;
  installedAt: string;
  status: 'active' | 'expired' | 'disabled';
  autoRenew: boolean;
}

export interface CartItem {
  moduleId: string;
  module: Module;
  quantity: number;
}

// Maps specific technical feature keys to their required module/addon IDs
// This allows us to check checkAccess('flux_charts') -> checks if 'flux-analytics' is installed
export const FEATURE_TO_MODULE_MAP: Record<string, string> = {
  // UPH Core
  'uph_core': 'uph-core',
  
  // Flux Features (UPH Add-ons)
  'flux_core': 'flux-core',
  'flux_charts': 'flux-analytics',
  
  // Forge Features (UPH Add-ons)
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
