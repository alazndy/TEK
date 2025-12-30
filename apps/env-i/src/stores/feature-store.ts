import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface FeatureState {
  features: Feature[];
  toggleFeature: (id: string) => void;
  isFeatureEnabled: (id: string) => boolean;
}

const initialFeatures: Feature[] = [
  {
    id: 'asset-management',
    name: 'Varlık Yönetimi',
    description: 'Envanter, Ekipman ve Demirbaş yönetimi.',
    enabled: true,
  },
  {
    id: 'procurement',
    name: 'Tedarik Yönetimi',
    description: 'Tedarikçiler, Satın Alma ve Transferler.',
    enabled: true,
  },
  {
    id: 'commercial',
    name: 'Ticari',
    description: 'Siparişler ve Teklifler.',
    enabled: true,
  },
  {
    id: 'reporting',
    name: 'Raporlama',
    description: 'Raporlar ve Denetim Günlükleri.',
    enabled: true,
  },
  {
    id: 'warehouse-map',
    name: 'Depo Haritası',
    description: 'Görsel depo yerleşimi.',
    enabled: true,
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
        return feature ? feature.enabled : false; // Default false if not found
      },
    }),
    {
      name: 'envi-features',
    }
  )
);
