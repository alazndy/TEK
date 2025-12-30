import { create } from 'zustand';
import { offlineStorage } from '@/lib/offline-db';
import { toast } from 'sonner';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  
  // Actions
  initialize: () => void;
  syncPendingChanges: () => Promise<void>;
  enqueueAction: (module: string, action: 'create' | 'update' | 'delete', data: any) => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: typeof window !== 'undefined' ? window.navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,

  initialize: () => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      set({ isOnline: true });
      toast.info('İnternet bağlantısı geri geldi. Eşitleme başlatılıyor...');
      get().syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      set({ isOnline: false });
      toast.warning('Çevrimdışı moddasınız. Değişiklikler yerel olarak kaydedilecek.');
    });

    // Check initial queue count
    offlineStorage.getAll('sync_queue').then(items => {
      set({ pendingCount: items.length });
    });
  },

  enqueueAction: async (module, action, data) => {
    const id = Math.random().toString(36).substr(2, 9);
    const entry = {
      id,
      module,
      action,
      data,
      timestamp: Date.now()
    };

    await offlineStorage.save('sync_queue', entry);
    set(state => ({ pendingCount: state.pendingCount + 1 }));

    if (get().isOnline) {
      get().syncPendingChanges();
    }
  },

  syncPendingChanges: async () => {
    const { isSyncing, isOnline } = get();
    if (isSyncing || !isOnline) return;

    set({ isSyncing: true });

    try {
      const queue = await offlineStorage.getAll('sync_queue');
      
      // Sort by timestamp (LWW approach)
      const sortedQueue = queue.sort((a, b) => a.timestamp - b.timestamp);

      for (const item of sortedQueue) {
        // Simulate API call
        console.log(`Syncing ${item.action} on ${item.module}:`, item.data);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Remove from local queue
        await offlineStorage.delete('sync_queue', item.id);
        set(state => ({ pendingCount: Math.max(0, state.pendingCount - 1) }));
      }

      if (queue.length > 0) {
        toast.success('Tüm değişiklikler başarıyla eşitledi.');
      }
    } catch (error) {
        console.error('Sync failed:', error);
        toast.error('Eşitleme sırasında bir hata oluştu.');
    } finally {
        set({ isSyncing: false });
    }
  }
}));
