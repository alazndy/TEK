import { StoreSlice } from "../types";
import { RepositoryFactory } from "@/lib/repositories/factory";
import { Product, Equipment, Consumable } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { logAudit } from "../audit-utils"; 
import { categorizeProduct } from "@/lib/categorization-utils";

const inventoryRepo = RepositoryFactory.getInventoryRepository();

export const createProductSlice: StoreSlice<any> = (set, get) => ({ 
  products: [],
  equipment: [],
  consumables: [],
  loadingProducts: false,
  loadingEquipment: false,
  loadingConsumables: false,
  hasMoreProducts: true,
  hasMoreEquipment: true,
  hasMoreConsumables: true,
  lastProduct: null,
  lastEquipment: null,
  lastConsumable: null,
  
  // Search
  allProductsLoaded: false,
  searchResults: [],
  isSearching: false,

  syncProducts: (products: Product[]) => {
      set({ products: products.sort((a,b) => a.name.localeCompare(b.name)), loadingProducts: false });
  },

  fetchProducts: async (initial = false) => {
    if (get().loadingProducts && !initial) return;
    if (initial) set({ products: [], lastProduct: null, hasMoreProducts: true });
    set({ loadingProducts: true });
    try {
      const { data, lastDoc } = await inventoryRepo.getProducts(50, initial ? null : get().lastProduct);
      
      set(state => {
        const newData = initial ? data : [...state.products, ...data];
        // Ensure uniqueness by ID
        const uniqueData = Array.from(new Map(newData.map(item => [item.id, item])).values());
        
        return {
          products: uniqueData,
          lastProduct: lastDoc,
          hasMoreProducts: data.length === 50,
        };
      });
    } catch (error) {
      console.error("Error fetching products: ", error);
      toast({ title: "Hata", description: "Ürünler getirilirken bir hata oluştu.", variant: "destructive" });
    } finally {
      set({ loadingProducts: false });
    }
  },

  loadMoreProducts: () => get().fetchProducts(),

  addProduct: async (productData: Omit<Product, 'id' | 'history'>) => {
    // Auto-categorize if not provided or set to default "Diğer"
    if (!productData.productCategory || productData.productCategory === "Diğer") {
      productData.productCategory = categorizeProduct(productData.name, productData.description || "");
    }
    
    const tempId = 'temp-' + Date.now();
    const optimisticProduct = { id: tempId, ...productData } as Product;
    
    set(state => ({ products: [optimisticProduct, ...state.products].sort((a: Product, b: Product) => a.name.localeCompare(b.name)) }));
    toast({ title: "İşleniyor", description: `Ürün '${productData.name}' ekleniyor...`, duration: 2000 });

    try {
      const id = await inventoryRepo.addProduct(productData);
      
      const newProduct = { id, ...productData } as Product;
      set(state => ({ 
        products: state.products.map((p: Product) => p.id === tempId ? newProduct : p).sort((a: Product, b: Product) => a.name.localeCompare(b.name)) 
      }));

      logAudit('Ürün Eklendi', `Yeni ürün eklendi: '${productData.name}' (ID: ${id})`);
      toast({ title: "Başarılı", description: `Ürün '${productData.name}' başarıyla eklendi.` });
    } catch (error) {
      console.error("Error adding product: ", error);
      set(state => ({ products: state.products.filter((p: Product) => p.id !== tempId) }));
      toast({ title: "Hata", description: "Ürün eklenirken bir hata oluştu.", variant: "destructive" });
    }
  },

  updateProduct: async (productId: string, productData: Partial<Product>) => {
    const previousProducts = get().products;
    const cleanData = Object.fromEntries(
      Object.entries(productData).filter(([_, v]) => v !== undefined)
    );
    
    set(state => ({ 
      products: state.products.map((p: Product) => p.id === productId ? { ...p, ...cleanData } : p),
      searchResults: state.searchResults.map((p: any) => p.id === productId ? { ...p, ...cleanData } : p)
    }));
    toast({ title: "İşleniyor", description: "Ürün güncelleniyor...", duration: 1000 });

    try {
      await inventoryRepo.updateProduct(productId, cleanData);
      
      logAudit('Ürün Güncellendi', `Ürün güncellendi: '${productData.name}' (ID: ${productId})`);
      toast({ title: "Başarılı", description: `Ürün başarıyla güncellendi.` });
    } catch (error) {
      console.error("Error updating product: ", error);
      set({ products: previousProducts });
      toast({ title: "Hata", description: "Ürün güncellenirken bir hata oluştu.", variant: "destructive" });
    }
  },

  deleteProduct: async (productId: string, productName: string) => {
    const previousProducts = get().products;
    set(state => ({ products: state.products.filter((p: Product) => p.id !== productId) }));
    toast({ title: "İşleniyor", description: `Ürün '${productName}' siliniyor...`, duration: 1000 });

    try {
      await inventoryRepo.deleteProduct(productId);
      logAudit('Ürün Silindi', `Ürün silindi: '${productName}' (ID: ${productId})`);
      toast({ title: "Başarılı", description: `Ürün '${productName}' başarıyla silindi.` });
    } catch (error) {
      console.error("Error deleting product: ", error);
      set({ products: previousProducts });
      toast({ title: "Hata", description: "Ürün silinirken bir hata oluştu.", variant: "destructive" });
    }
  },
  
  fetchEquipment: async (initial = false) => {
    if (get().loadingEquipment && !initial) return;
    if (initial) set({ equipment: [], lastEquipment: null, hasMoreEquipment: true });
    set({ loadingEquipment: true });
    try {
      const { data, lastDoc } = await inventoryRepo.getEquipment(50, initial ? null : get().lastEquipment);

      set(state => {
        const newData = initial ? data : [...state.equipment, ...data];
        const uniqueData = Array.from(new Map(newData.map(item => [item.id, item])).values());
        
        return {
          equipment: uniqueData,
          lastEquipment: lastDoc,
          hasMoreEquipment: data.length === 50,
        };
      });
    } catch (error) {
      console.error("Error fetching equipment: ", error);
      toast({ title: "Hata", description: "Demirbaşlar getirilirken bir hata oluştu.", variant: "destructive" });
    } finally {
      set({ loadingEquipment: false });
    }
  },
  loadMoreEquipment: () => get().fetchEquipment(),
  addEquipment: async (equipmentData: Omit<Equipment, 'id'>) => {
    // Auto-categorize if not provided or set to default "Diğer"
    if (!equipmentData.productCategory || equipmentData.productCategory === "Diğer") {
      equipmentData.productCategory = categorizeProduct(equipmentData.name, equipmentData.description || "");
    }
    
     try {
      const id = await inventoryRepo.addEquipment(equipmentData);
      const newEquipment = { id, ...equipmentData } as Equipment;
      set(state => ({ equipment: [newEquipment, ...state.equipment].sort((a: Equipment,b: Equipment) => a.name.localeCompare(b.name)) }));
      await logAudit('Ekipman Eklendi', `Yeni demirbaş eklendi: '${equipmentData.name}' (ID: ${id})`);
      toast({ title: "Başarılı", description: `Demirbaş '${equipmentData.name}' başarıyla eklendi.` });
    } catch (error) {
      console.error("Error adding equipment: ", error);
      toast({ title: "Hata", description: "Demirbaş eklenirken bir hata oluştu.", variant: "destructive" });
    }
  },
  updateEquipment: async (equipmentId: string, equipmentData: Partial<Equipment>) => { 
      const previousEquipment = get().equipment;
      set(state => ({ 
        equipment: state.equipment.map((e: Equipment) => e.id === equipmentId ? { ...e, ...equipmentData } : e),
        searchResults: state.searchResults.map((e: any) => e.id === equipmentId ? { ...e, ...equipmentData } : e)
      }));
      try {
        await inventoryRepo.updateEquipment(equipmentId, equipmentData);
        logAudit('Ekipman Güncellendi', `Demirbaş güncellendi: '${equipmentData.name}' (ID: ${equipmentId})`);
        toast({ title: "Başarılı", description: "Demirbaş başarıyla güncellendi." });
      } catch (error) {
        console.error("Error updating equipment: ", error);
        set({ equipment: previousEquipment });
        toast({ title: "Hata", description: "Demirbaş güncellenirken bir hata oluştu.", variant: "destructive" });
      }
  },
  deleteEquipment: async (equipmentId: string, equipmentName: string) => { 
      const previousEquipment = get().equipment;
      set(state => ({ equipment: state.equipment.filter((e: Equipment) => e.id !== equipmentId) }));
      try {
          await inventoryRepo.deleteEquipment(equipmentId);
          logAudit('Ekipman Silindi', `Demirbaş silindi: '${equipmentName}' (ID: ${equipmentId})`);
          toast({ title: "Başarılı", description: "Demirbaş silindi." });
      } catch (error) {
          console.error("Error deleting equipment: ", error);
          set({ equipment: previousEquipment });
          toast({ title: "Hata", description: "Demirbaş silinemedi.", variant: "destructive" });
      }
  },

  fetchConsumables: async (initial = false) => {
    if (get().loadingConsumables && !initial) return;
    if (initial) set({ consumables: [], lastConsumable: null, hasMoreConsumables: true });
    set({ loadingConsumables: true });
    try {
      const { data, lastDoc } = await inventoryRepo.getConsumables(50, initial ? null : get().lastConsumable);
      
      set(state => {
        const newData = initial ? data : [...state.consumables, ...data];
        const uniqueData = Array.from(new Map(newData.map(item => [item.id, item])).values());
        
        return {
          consumables: uniqueData,
          lastConsumable: lastDoc,
          hasMoreConsumables: data.length === 50,
        };
      });
    } catch (error) {
      console.error("Error fetching consumables: ", error);
      toast({ title: "Hata", description: "Sarf malzemeler getirilirken bir hata oluştu.", variant: "destructive" });
    } finally {
      set({ loadingConsumables: false });
    }
  },
  loadMoreConsumables: () => get().fetchConsumables(),
  addConsumable: async (consumableData: Omit<Consumable, 'id'>) => {
    try {
      const id = await inventoryRepo.addConsumable(consumableData);
      const newConsumable = { id, ...consumableData } as Consumable;
      set(state => ({ consumables: [newConsumable, ...state.consumables].sort((a: Consumable,b: Consumable) => a.name.localeCompare(b.name)) }));
      await logAudit('Sarf Malzeme Eklendi', `Yeni sarf malzeme eklendi: '${consumableData.name}' (ID: ${id})`);
      toast({ title: "Başarılı", description: `Sarf malzeme '${consumableData.name}' başarıyla eklendi.` });
    } catch (error) {
      console.error("Error adding consumable: ", error);
      toast({ title: "Hata", description: "Sarf malzeme eklenirken bir hata oluştu.", variant: "destructive" });
    } 
  },
  updateConsumable: async (consumableId: string, consumableData: Partial<Consumable>) => {
      const previous = get().consumables;
      set(state => ({ 
        consumables: state.consumables.map((c: Consumable) => c.id === consumableId ? { ...c, ...consumableData } : c),
        searchResults: state.searchResults.map((c: any) => c.id === consumableId ? { ...c, ...consumableData } : c)
      }));
      try {
        await inventoryRepo.updateConsumable(consumableId, consumableData);
        logAudit('Sarf Malzeme Güncellendi', `Sarf malzeme güncellendi: '${consumableData.name}' (ID: ${consumableId})`);
        toast({ title: "Başarılı", description: "Sarf malzeme güncellendi." });
      } catch (error) {
        set({ consumables: previous });
        toast({ title: "Hata", description: "Sarf malzeme güncellenemedi.", variant: "destructive" });
      }
  },
  deleteConsumable: async (consumableId: string, consumableName: string) => {
      const previous = get().consumables;
      set(state => ({ consumables: state.consumables.filter((c: Consumable) => c.id !== consumableId) }));
      try {
        await inventoryRepo.deleteConsumable(consumableId);
        logAudit('Sarf Malzeme Silindi', `Sarf malzeme silindi: '${consumableName}' (ID: ${consumableId})`);
        toast({ title: "Başarılı", description: "Sarf malzeme silindi." });
      } catch (error) {
          set({ consumables: previous });
          toast({ title: "Hata", description: "Sarf malzeme silinemedi.", variant: "destructive" });
      }
  },


  // Search
  fetchAllProductsForSearch: async () => {
    const state = get();
    if (state.allProductsLoaded || state.loadingProducts) return;
    
    set({ loadingProducts: true });
    try {
      const allProducts = await inventoryRepo.getAllProductsForSearch();
      
      set({
        searchResults: [], 
        allProductsLoaded: true
      });
    } catch (error) {
      console.error("Error fetching all products for search:", error);
    } finally {
      set({ loadingProducts: false });
    }
  },

  searchProducts: async (searchTerm: string, category?: string) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) {
        set({ searchResults: [], isSearching: false });
        return;
      }

      set({ isSearching: true });
      
      // Ensure all products are loaded for a comprehensive search
      if (!get().allProductsLoaded) {
        await get().fetchAllProductsForSearch();
      }

      const allItems = [
        ...get().products,
        ...get().equipment,
        ...get().consumables
      ];

      const results = allItems.filter(item => {
        const matchesTerm = 
          item.name.toLowerCase().includes(term) || 
          (item.description || "").toLowerCase().includes(term) ||
          (item.barcode || "").toLowerCase().includes(term) ||
          (item.modelNumber || "").toLowerCase().includes(term) ||
          (item.partNumber || "").toLowerCase().includes(term) ||
          (item.manufacturer || "").toLowerCase().includes(term);
        
        const matchesCategory = !category || item.category === category;
        
        return matchesTerm && matchesCategory;
      });

      set({ searchResults: results });
  },
  clearSearch: () => set({ searchResults: [], isSearching: false }),

  // Helpers
  finishPhysicalCount: async (countedProducts: (Product & { countedStock?: number; initialStock: number })[]) => { 
      // Implementation omitted for brevity, assuming standard update logic
  },
  syncPricesFromCatalog: async (items: { model: string; price: number | null; currency: string }[]) => { return { synced: 0, notFound: 0 } },
  
  autoCategorizeAllProducts: async () => {
    set({ loadingProducts: true });
    try {
      const products = await inventoryRepo.getAllProductsForSearch();
      let updatedCount = 0;
      
      for (const product of products) {
        const newCategory = categorizeProduct(product.name, product.description || "");
        
        // Update if the category changed
        if (newCategory !== product.productCategory) {
          await inventoryRepo.updateProduct(product.id, { productCategory: newCategory });
          updatedCount++;
        }
      }
      
      if (updatedCount > 0) {
        toast({ title: "Başarılı", description: `${updatedCount} ürün otomatik olarak kategorize edildi ve veritabanı güncellendi.` });
        get().fetchProducts(true);
      } else {
        toast({ title: "Bilgi", description: "Kategorize edilecek yeni ürün bulunamadı." });
      }
    } catch (error) {
      console.error("Error auto-categorizing products:", error);
      toast({ title: "Hata", description: "Otomatik kategorizasyon sırasında bir hata oluştu.", variant: "destructive" });
    } finally {
      set({ loadingProducts: false });
    }
  }
});
