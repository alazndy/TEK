import { StoreSlice } from "../types";
import { RepositoryFactory } from "@/lib/repositories/factory";
import { AuditLog, Warehouse, Settings } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

const inventoryRepo = RepositoryFactory.getInventoryRepository();

export const createCommonSlice: StoreSlice<any> = (set, get) => ({
  logs: [],
  loadingLogs: true,
  hasMoreLogs: true,
  lastLog: null,
  warehouses: [],
  loadingWarehouses: false,
  settings: null,
  loadingSettings: false,
  isSeeding: false,

  fetchLogs: async (initial = false) => {
    if (get().loadingLogs && !initial) return;
    if (initial) set({ logs: [], lastLog: null, hasMoreLogs: true });
    set({ loadingLogs: true });
    try {
      const { data, lastDoc } = await inventoryRepo.getAuditLogs(50, initial ? null : get().lastLog);
      
      set(state => ({
        logs: initial ? data : [...state.logs, ...data],
        lastLog: lastDoc,
        hasMoreLogs: data.length === 50,
      }));
    } catch (error) {
      console.error("Error fetching logs: ", error);
      toast({ title: "Hata", description: "Denetim kayıtları getirilirken bir hata oluştu.", variant: "destructive" });
    } finally {
      set({ loadingLogs: false });
    }
  },
  loadMoreLogs: () => get().fetchLogs(),

  fetchSettings: async () => {
      set({ loadingSettings: true });
      try {
          const settings = await inventoryRepo.getSettings();
          if (settings) {
              set({ settings });
          } else {
              const defaultSettings: Settings = { companyName: "Şirketim", currency: "TRY", googleDriveIntegration: false, slackIntegration: false };
              const id = await inventoryRepo.createSettings(defaultSettings);
              set({ settings: { id, ...defaultSettings } });
          }
      } catch (error) {
          console.error("Error fetching settings:", error);
      } finally {
          set({ loadingSettings: false });
      }
  },

  updateSettings: async (newSettings: Partial<Settings>) => {
      try {
          const currentSettings = get().settings;
          if (!currentSettings?.id) return;

          await inventoryRepo.updateSettings(currentSettings.id, newSettings);
          
          set({ settings: { ...currentSettings, ...newSettings } });
          
          toast({ title: "Başarılı", description: "Ayarlar güncellendi." });
      } catch (error) {
          console.error("Error updating settings:", error);
          toast({ title: "Hata", description: "Ayarlar güncellenemedi.", variant: "destructive" });
      }
  },

  fetchWarehouses: async () => {
    set({ loadingWarehouses: true });
    try {
      const warehouses = await inventoryRepo.getWarehouses();
      set({ warehouses });
    } catch (error) {
      console.error("Error fetching warehouses: ", error);
      toast({ title: "Hata", description: "Depolar getirilirken bir hata oluştu.", variant: "destructive" });
    } finally {
      set({ loadingWarehouses: false });
    }
  },

  addWarehouse: async (warehouseData: Omit<Warehouse, 'id'>) => {
    try {
      const id = await inventoryRepo.addWarehouse(warehouseData);
      const newWarehouse = { id, ...warehouseData };
      set(state => ({ warehouses: [...state.warehouses, newWarehouse] }));
      toast({ title: "Başarılı", description: "Yeni depo başarıyla eklendi." });
    } catch (error) {
      console.error("Error adding warehouse: ", error);
      toast({ title: "Hata", description: "Depo eklenirken bir hata oluştu.", variant: "destructive" });
    }
  },

  updateWarehouse: async (warehouseId: string, warehouseData: Partial<Warehouse>) => {
    try {
      await inventoryRepo.updateWarehouse(warehouseId, warehouseData);
      set(state => ({
        warehouses: state.warehouses.map(w => 
          w.id === warehouseId ? { ...w, ...warehouseData } : w
        )
      }));
      toast({ title: "Başarılı", description: "Depo güncellendi." });
    } catch (error) {
      console.error("Error updating warehouse: ", error);
      toast({ title: "Hata", description: "Depo güncellenirken bir hata oluştu.", variant: "destructive" });
    }
  },

  deleteWarehouse: async (warehouseId: string) => {
    try {
      await inventoryRepo.deleteWarehouse(warehouseId);
      set(state => ({ warehouses: state.warehouses.filter(w => w.id !== warehouseId) }));
      toast({ title: "Başarılı", description: "Depo silindi." });
    } catch (error) {
      console.error("Error deleting warehouse: ", error);
      toast({ title: "Hata", description: "Depo silinirken bir hata oluştu.", variant: "destructive" });
    }
  },

  migrateToDefaultWarehouse: async () => {
     toast({ title: "Bilgi", description: "Bu işlem şimdilik devre dışı." });
  },

  seedDatabase: async () => {
      set({ isSeeding: true });
      set({ isSeeding: false });
      toast({ title: "Bilgi", description: "Seed işlemi DataStore üzerinden yapılmalıdır." });
  }
});
