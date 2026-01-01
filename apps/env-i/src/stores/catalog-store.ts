
import { create } from 'zustand';
import { CatalogItem } from '@/lib/types';
import { db } from "@/lib/firebase";
import { collection, getDocs, writeBatch, doc, query, limit, orderBy, deleteDoc } from "firebase/firestore";
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
        const q = query(collection(db, "catalog_items"), orderBy("model"), limit(1000)); // Initial limit to prevent huge reads
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => doc.data() as CatalogItem);
        set({ items, hasInitialized: true });
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
          // Process in chunks of 500 (Firestore batch limit)
          const chunkSize = 450; 
          for (let i = 0; i < newItems.length; i += chunkSize) {
              const chunk = newItems.slice(i, i + chunkSize);
              const batch = writeBatch(db);
              
              chunk.forEach(item => {
                  // Create a safe ID from model/manufacturer to prevent duplicates
                  const safeId = `${item.manufacturer}-${item.model}`.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
                  const docRef = doc(db, "catalog_items", safeId);
                  batch.set(docRef, { ...item, id: safeId, updatedAt: new Date().toISOString() });
              });

              await batch.commit();
          }

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
          // Delete in batches
          const q = query(collection(db, "catalog_items"), limit(450));
          let snapshot = await getDocs(q);
          
          while (!snapshot.empty) {
              const batch = writeBatch(db);
              snapshot.docs.forEach(doc => {
                  batch.delete(doc.ref);
              });
              await batch.commit();
              snapshot = await getDocs(q);
          }
          
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
