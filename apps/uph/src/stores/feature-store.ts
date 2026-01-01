import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FeatureCategory = 'engineering' | 'projects' | 'inventory' | 'risk' | 'finance' | 'team';

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  enabled: boolean;
  path?: string; // Route path if applicable
}

interface FeatureState {
  features: Feature[];
  toggleFeature: (id: string) => void;
  isFeatureEnabled: (id: string) => boolean;
}

const initialFeatures: Feature[] = [
  // Engineering Category
  {
    id: 'ecm',
    name: 'Mühendislik Değişim Yönetimi (ECM)',
    description: 'ECR ve ECO süreçlerini yönetin.',
    category: 'engineering',
    enabled: true,
    path: '/engineering'
  },
  {
    id: 'bom',
    name: 'Malzeme Listesi (BOM)',
    description: 'Ürün ağaçlarını ve revizyonlarını yönetin.',
    category: 'engineering',
    enabled: true,
    path: '/bom'
  },
  // Project Management Category
  {
    id: 'kanban',
    name: 'Kanban Tahtası',
    description: 'Görevleri görsel olarak takip edin.',
    category: 'projects',
    enabled: true,
    path: '/projects'
  },
  {
    id: 'gantt',
    name: 'Gantt Şeması',
    description: 'Proje zaman çizelgesini izleyin.',
    category: 'projects',
    enabled: true,
    path: '/gantt'
  },
  // Inventory Category
  {
    id: 'inventory',
    name: 'Envanter Sistemi',
    description: 'Stok ve depo yönetimini gerçekleştirin.',
    category: 'inventory',
    enabled: true,
    path: '/inventory'
  },
  // Risk & Compliance Category
  {
    id: 'risk-management',
    name: 'Risk Yönetimi (RAID)',
    description: 'Risk, Sorun ve Bağımlılıkları takip edin.',
    category: 'risk',
    enabled: true,
    path: '/analytics' // Temporarily mapped to analytics until RAID page exists
  },
  {
    id: 'audit-logs',
    name: 'Denetim Günlükleri',
    description: 'Sistem üzerindeki tüm değişiklikleri izleyin.',
    category: 'risk',
    enabled: true,
    path: '/settings'
  },
  // Finance Category
  {
    id: 'evm',
    name: 'Kazanılmış Değer Yönetimi (EVM)',
    description: 'Proje finansal performansını analiz edin.',
    category: 'finance',
    enabled: true,
    path: '/analytics/evm'
  }
];

export const useFeatureStore = create<FeatureState>()(
  persist(
    (set, get) => ({
      features: initialFeatures,
      
      toggleFeature: (id: string) =>
        set((state) => ({
          features: state.features.map((f) =>
            f.id === id ? { ...f, enabled: !f.enabled } : f
          ),
        })),

      isFeatureEnabled: (id: string) => {
        const feature = get().features.find((f) => f.id === id);
        return feature ? feature.enabled : false;
      },
    }),
    {
      name: 'uph-features',
    }
  )
);
