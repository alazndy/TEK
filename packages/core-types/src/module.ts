// Module Types - Shared across t-Market and all apps

export type ModuleCategory =
  | 'Operations'
  | 'Engineering'
  | 'Finance'
  | 'HR'
  | 'Productivity'
  | 'Integration'
  | 'Analytics';

export type ModuleType = 'app' | 'addon' | 'integration';

export interface Module {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  benefits?: string[];
  gallery?: string[];
  icon: string;
  category: ModuleCategory;
  type: ModuleType;
  parentId?: string;
  price: number;
  currency: string;
  features: string[];
  version: string;
  isPopular?: boolean;
  isNew?: boolean;
  url?: string;
}

export interface CartItem extends Module {
  quantity: number;
}
