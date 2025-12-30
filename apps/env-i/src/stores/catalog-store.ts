
import { create } from 'zustand';
import { CatalogItem } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { toast } from "@/hooks/use-toast";

interface CatalogState {
  items: CatalogItem[];
  loading: boolean;
  hasInitialized: boolean;
  fetchItems: (force?: boolean) => Promise<void>;
  uploadWithBatch: (items: CatalogItem[]) => Promise<void>;
  clearCatalog: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  items: [],
  loading: false,
  hasInitialized: false,

  fetchItems: async (force = false) => {
    if (get().hasInitialized && !force) return;
    
    set({ loading: true });
    try {
        const response = await apiClient.get('/marketplace/products'); // Using marketplace as catalog source
        set({ items: response.data, hasInitialized: true });
    } catch (error) {
        console.error("Error fetching catalog:", error);
        toast({ title: "Hata", description: "Katalog verisi çekilemedi.", variant: "destructive" });
    } finally {
        set({ loading: false });
    }
  },

  uploadWithBatch: async (newItems: CatalogItem[]) => {
      set({ loading: true });
      try {
          // Send all items to backend to handle batching
          await apiClient.post('/marketplace/products/batch', { items: newItems });

          // Refresh local state
          await get().fetchItems(true);
          toast({ title: "Başarılı", description: `${newItems.length} ürün kataloğa yüklendi.` });

      } catch (error) {
          console.error("Batch upload error:", error);
          toast({ title: "Hata", description: "Yükleme sırasında hata oluştu.", variant: "destructive" });
      } finally {
          set({ loading: false });
      }
  },

  clearCatalog: async () => {
      set({ loading: true });
      try {
          await apiClient.delete('/marketplace/products');
          
          set({ items: [] });
          toast({ title: "Başarılı", description: "Katalog temizlendi." });
      } catch (error) {
          console.error("Clear catalog error:", error);
          toast({ title: "Hata", description: "Silme sırasında hata oluştu.", variant: "destructive" });
      } finally {
          set({ loading: false });
      }
  }
}));
