import { create } from 'zustand';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FluxDevice, FluxStats } from '@/types/flux';
import { FluxIoTService } from '@/services/flux-iot-service';

interface FluxState {
  devices: FluxDevice[];
  stats: FluxStats;
  loading: boolean;
  error: string | null;
}

interface FluxActions {
  fetchDevices: () => Promise<void>;
  addDevice: (data: Omit<FluxDevice, 'id' | 'status' | 'load' | 'temp' | 'temperature' | 'uptime' | 'lastSeen'>) => Promise<void>;
  updateDeviceCondition: (id: string, data: Partial<FluxDevice>) => Promise<void>;
  refreshStats: () => void;
  deleteDevice: (id: string) => Promise<void>;
  
  // IoT
  isBrokerConnected: boolean;
  connectToBroker: (config: { url: string; username?: string; password?: string }) => void;
  disconnectFromBroker: () => void;
  handleDeviceMessage: (deviceId: string, data: Partial<FluxDevice>) => void;
}

type FluxStore = FluxState & FluxActions;

const initialStats: FluxStats = {
  onlineCount: 0,
  totalDevices: 0,
  totalPower: 0,
  avgTemp: 0,
  systemLoad: 0,
};

// Helper: Calculate stats from devices
const calculateStats = (devices: FluxDevice[]): FluxStats => {
  const onlineCount = devices.filter(d => d.status === 'Online').length;
  const totalItems = devices.length;
  if (totalItems === 0) return initialStats;

  const totalPower = devices.reduce((sum, d) => sum + (d.powerConsumption || 0), 0);
  const totalTemp = devices.reduce((sum, d) => sum + (d.temp || d.temperature || 0), 0);
  const totalLoad = devices.reduce((sum, d) => sum + (d.load || 0), 0);

  return {
    onlineCount,
    totalDevices: totalItems,
    totalPower: Math.round(totalPower * 100) / 100,
    avgTemp: Math.round(totalTemp / totalItems),
    systemLoad: Math.round(totalLoad / totalItems),
  };
};

export const useFluxStore = create<FluxStore>((set, get) => ({
  devices: [],
  stats: initialStats,
  loading: false,
  error: null,
  isBrokerConnected: false,

  fetchDevices: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'flux_devices'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const devices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure defaults for optional fields if missing in DB
        temp: doc.data().temperature || doc.data().temp || 0,
        load: doc.data().load || 0,
        status: doc.data().status || 'Offline',
        uptime: doc.data().uptime || '0m',
        lastSeen: doc.data().lastSeen || 'Just now'
      })) as FluxDevice[];

      set({ 
        devices, 
        stats: calculateStats(devices),
        loading: false 
      });
    } catch (error: any) {
      // Fallback to mock data if DB is empty or fails (for demo purposes)
      console.warn('Fetching flux devices failed, falling back to mock:', error);
      const mockDevices: FluxDevice[] = [
        { id: 'DEV-001', name: 'Ana Dağıtım Panosu', location: 'Blok A', status: 'Online', temp: 34, load: 45, uptime: '12d 4h', lastSeen: 'Just now' },
        { id: 'DEV-002', name: 'HVAC Kontrol Ünitesi', location: 'Çatı Katı', status: 'Online', temp: 28, load: 40, uptime: '45d 1h', lastSeen: '1m ago' },
        { id: 'DEV-003', name: 'UPS Sistemi', location: 'Server Odası', status: 'Warning', temp: 42, load: 85, uptime: '2d 12h', lastSeen: '30s ago' },
      ];
      set({ 
        devices: mockDevices, 
        stats: calculateStats(mockDevices),
        loading: false 
      });
    }
  },

  addDevice: async (data) => {
    set({ loading: true, error: null });
    try {
      const newDevice = {
        ...data,
        status: 'Online', // Initial status
        temp: 20 + Math.floor(Math.random() * 30), // Mock initial sensor data
        load: 10 + Math.floor(Math.random() * 50),
        uptime: '0m',
        lastSeen: 'Just now',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'flux_devices'), newDevice);
      
      const deviceWithId = { id: docRef.id, ...newDevice } as FluxDevice;
      
      const updatedDevices = [deviceWithId, ...get().devices];
      
      set({ 
        devices: updatedDevices,
        stats: calculateStats(updatedDevices),
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateDeviceCondition: async (id, data) => {
    // Optimistic update
    const currentDevices = get().devices;
    const updatedDevices = currentDevices.map(d => d.id === id ? { ...d, ...data } : d);
    set({ devices: updatedDevices, stats: calculateStats(updatedDevices) });

    try {
      await updateDoc(doc(db, 'flux_devices', id), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Failed to update device:', error);
      // Revert on failure
      set({ devices: currentDevices, stats: calculateStats(currentDevices) });
    }
  },

  deleteDevice: async (id) => {
    const currentDevices = get().devices;
    const updatedDevices = currentDevices.filter(d => d.id !== id);
    set({ devices: updatedDevices, stats: calculateStats(updatedDevices) });

    try {
      await deleteDoc(doc(db, 'flux_devices', id));
    } catch (error) {
       console.error('Failed to delete device:', error);
       set({ devices: currentDevices, stats: calculateStats(currentDevices) });
    }
  },

  refreshStats: () => {
    // Legacy random simulation (kept for fallback) if not connected to broker
    if (get().isBrokerConnected) return;

    const devices = get().devices.map(d => {
      if (d.status === 'Offline') return d;
      const fluctuation = Math.random() > 0.5 ? 1 : -1;
      let newTemp = (d.temp || 25) + (Math.random() * 0.5 * fluctuation);
      let newLoad = (d.load || 30) + (Math.random() * 1 * fluctuation);
      newLoad = Math.max(0, Math.min(100, newLoad));
      newTemp = Math.max(-10, Math.min(100, newTemp));
      return { ...d, temp: Math.round(newTemp * 10) / 10, load: Math.round(newLoad) };
    });
    set({ devices, stats: calculateStats(devices) });
  },

  // IoT Connectivity Actions


  connectToBroker: (config) => {
    const iotService = FluxIoTService.getInstance();
    
    // Subscribe to status changes
    iotService.onStatusChange((isConnected, error) => {
        set({ isBrokerConnected: isConnected, error: error || null });
    });

    iotService.onMessage((deviceId, data) => {
        get().handleDeviceMessage(deviceId, data);
    });

    iotService.connect(config);
  },

  disconnectFromBroker: () => {
    FluxIoTService.getInstance().disconnect();
    set({ isBrokerConnected: false });
  },

  handleDeviceMessage: (deviceId: string, data: Partial<FluxDevice>) => {
    const currentDevices = get().devices;
    const targetIndex = currentDevices.findIndex(d => d.id === deviceId);
    
    if (targetIndex !== -1) {
        const updatedDevices = [...currentDevices];
        updatedDevices[targetIndex] = { ...updatedDevices[targetIndex], ...data };
        set({ devices: updatedDevices, stats: calculateStats(updatedDevices) });
    }
  }

}));
