import { create } from 'zustand';
import { DataStoreState } from './types';
import { createProductSlice } from './slices/product-slice';
import { createOrderSlice } from './slices/order-slice';
import { createCommonSlice } from './slices/common-slice';

export const useDataStore = create<DataStoreState>((...a) => ({
  ...createProductSlice(...a),
  ...createOrderSlice(...a),
  ...createCommonSlice(...a),

  // Main Fetch All Action with proper error handling
  fetchAllData: async () => {
    const state = a[1](); // get()
    const actions = state; // actions are mixed in state; Zustand's pattern

    try {
      // Build an array of fetch promises for parallel execution
      const fetchPromises: Promise<void>[] = [];

      if (state.products.length === 0 && !state.loadingProducts) {
        fetchPromises.push(actions.fetchProducts(true));
      }
      if (state.equipment.length === 0 && !state.loadingEquipment) {
        fetchPromises.push(actions.fetchEquipment(true));
      }
      if (state.consumables.length === 0 && !state.loadingConsumables) {
        fetchPromises.push(actions.fetchConsumables(true));
      }
      if (state.orders.length === 0 && !state.loadingOrders) {
        fetchPromises.push(actions.fetchOrders(true));
      }
      if (state.proposals.length === 0 && !state.loadingProposals) {
        fetchPromises.push(actions.fetchProposals(true));
      }
      if (state.logs.length === 0 && !state.loadingLogs) {
        fetchPromises.push(actions.fetchLogs(true));
      }
      if (state.warehouses.length === 0 && !state.loadingWarehouses) {
        fetchPromises.push(actions.fetchWarehouses());
      }
      if (!state.settings && !state.loadingSettings) {
        fetchPromises.push(actions.fetchSettings());
      }

      // Execute all fetches in parallel
      await Promise.all(fetchPromises);
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
      // Individual slice errors are handled internally, this catches any unhandled ones
    }
  },
}));
