import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Widget, WidgetType, WidgetCategory } from '@/lib/types';

interface DashboardState {
  widgets: Widget[];
  isEditing: boolean;
  toggleEditing: () => void;
  addWidget: (type: WidgetType, title: string, category: WidgetCategory) => void;
  removeWidget: (id: string) => void;
  updateWidgetOrder: (id: string, newOrder: number) => void;
  toggleWidgetVisibility: (id: string) => void;
  resetToDefault: () => void;
  setWidgets: (widgets: Widget[]) => void;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: '1', type: 'stat-inventory-value', title: 'Toplam Envanter Değeri', visible: true, order: 0, category: 'general' },
  { id: '2', type: 'stat-product-types', title: 'Toplam Ürün Çeşidi', visible: true, order: 1, category: 'general' },
  { id: '3', type: 'stat-low-stock', title: 'Düşük Stoklu Ürünler', visible: true, order: 2, category: 'inventory' },
  { id: '4', type: 'stat-pending-orders', title: 'Bekleyen Siparişler', visible: true, order: 3, category: 'commercial' },
  { id: '5', type: 'chart-sales-trend', title: 'Satış Trendleri', visible: true, order: 4, category: 'analysis' },
  { id: '6', type: 'chart-category-dist', title: 'Kategori Dağılımı', visible: true, order: 5, category: 'analysis' },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,
      isEditing: false,
      toggleEditing: () => set((state: DashboardState) => ({ isEditing: !state.isEditing })),
      addWidget: (type: WidgetType, title: string, category: WidgetCategory) => set((state: DashboardState) => ({
        widgets: [
          ...state.widgets,
          {
            id: Math.random().toString(36).substr(2, 9),
            type,
            title,
            visible: true,
            order: state.widgets.length,
            category: category || 'general'
          }
        ]
      })),
      removeWidget: (id: string) => set((state: DashboardState) => ({
        widgets: state.widgets.filter(w => w.id !== id)
      })),
      updateWidgetOrder: (id: string, newOrder: number) => set((state: DashboardState) => {
        const newWidgets = [...state.widgets];
        const widgetIndex = newWidgets.findIndex(w => w.id === id);
        if (widgetIndex === -1) return state;
        
        newWidgets[widgetIndex].order = newOrder;
        return { widgets: newWidgets.sort((a, b) => a.order - b.order) };
      }),
      toggleWidgetVisibility: (id: string) => set((state: DashboardState) => ({
        widgets: state.widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w)
      })),
      resetToDefault: () => set({ widgets: DEFAULT_WIDGETS }),
      setWidgets: (widgets: Widget[]) => set({ widgets }),
    }),
    {
      name: 'env-i-dashboard-storage',
    }
  )
);
