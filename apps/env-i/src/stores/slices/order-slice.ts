import { StoreSlice } from "../types";
import { RepositoryFactory } from "@/lib/repositories/factory";
import { Order, Proposal } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { logAudit } from "../audit-utils";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const inventoryRepo = RepositoryFactory.getInventoryRepository();

export const createOrderSlice: StoreSlice<any> = (set, get) => ({
  orders: [],
  proposals: [],
  loadingOrders: true,
  loadingProposals: true,
  hasMoreOrders: true,
  hasMoreProposals: true,
  lastOrder: null,
  lastProposal: null,

  syncOrders: (orders: Order[]) => {
      set({ orders: orders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), loadingOrders: false });
  },

  fetchOrders: async (initial = false) => {
    if (get().loadingOrders && !initial) return;
    if (initial) set({ orders: [], lastOrder: null, hasMoreOrders: true });
    set({ loadingOrders: true });

    try {
      const { data, lastDoc } = await inventoryRepo.getOrders(25, initial ? null : get().lastOrder);
      
      set(state => ({
        orders: initial ? data : [...state.orders, ...data],
        lastOrder: lastDoc,
        hasMoreOrders: data.length === 25,
      }));
    } catch (error) {
      console.error("Error fetching orders: ", error);
      toast({ title: "Hata", description: "Siparişler getirilirken bir hata oluştu.", variant: "destructive" });
    } finally {
      set({ loadingOrders: false });
    }
  },

  loadMoreOrders: () => get().fetchOrders(),

  addOrder: async (orderData: Omit<Order, 'id'>) => {
    try {
      const id = await inventoryRepo.addOrder(orderData);
      const newOrder = { id, ...orderData };
      set(state => ({ orders: [newOrder, ...state.orders] }));
      await logAudit('Sipariş Oluşturuldu', `Yeni sipariş oluşturuldu: #${orderData.orderNumber}`);
      toast({ title: "Başarılı", description: "Sipariş başarıyla oluşturuldu." });
    } catch (error) {
      console.error("Error adding order: ", error);
      toast({ title: "Hata", description: "Sipariş eklenirken bir hata oluştu.", variant: "destructive" });
    }
  },

  fetchProposals: async (initial = false) => {
    if (get().loadingProposals && !initial) return;
    if (initial) set({ proposals: [], lastProposal: null, hasMoreProposals: true });
    set({ loadingProposals: true });

    try {
      const { data, lastDoc } = await inventoryRepo.getProposals(25, initial ? null : get().lastProposal);

      set(state => ({
        proposals: initial ? data : [...state.proposals, ...data],
        lastProposal: lastDoc,
        hasMoreProposals: data.length === 25,
      }));
    } catch (error) {
      console.error("Error fetching proposals: ", error);
      toast({ title: "Hata", description: "Teklifler getirilirken bir hata oluştu.", variant: "destructive" });
    } finally {
      set({ loadingProposals: false });
    }
  },

  loadMoreProposals: () => get().fetchProposals(),

  addProposal: async (proposalData: Omit<Proposal, 'id' | 'pdfUrl'>, pdfFile: File) => {
    const storage = getStorage();
    const storageRef = ref(storage, `proposals/${pdfFile.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, pdfFile);
      const pdfUrl = await getDownloadURL(snapshot.ref);

      const finalProposalData = {
        ...proposalData,
        pdfUrl: pdfUrl,
      };

      const id = await inventoryRepo.addProposal(finalProposalData);
      const newProposal = { id, ...finalProposalData };

      set(state => ({ proposals: [newProposal, ...state.proposals] }));
      await logAudit('Teklif Oluşturuldu', `Yeni teklif oluşturuldu: #${proposalData.proposalNumber}`);
      toast({ title: "Başarılı", description: "Teklif başarıyla yüklendi ve kaydedildi." });

    } catch (error) {
      console.error("Error adding proposal: ", error);
      toast({ title: "Hata", description: "Teklif eklenirken bir hata oluştu.", variant: "destructive" });
    }
  },
});
