import { create } from 'zustand';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  where,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { StockAlert, AlertSettings, AlertType, AlertSeverity, Product } from '@/lib/types';

interface AlertState {
  alerts: StockAlert[];
  alertSettings: AlertSettings | null;
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

interface AlertActions {
  fetchAlerts: (includeResolved?: boolean) => Promise<void>;
  subscribeToAlerts: () => Unsubscribe;
  markAsRead: (alertId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  resolveAlert: (alertId: string, resolvedBy: string) => Promise<void>;
  
  fetchAlertSettings: () => Promise<void>;
  updateAlertSettings: (settings: Partial<AlertSettings>) => Promise<void>;
  
  // Alert generation
  checkLowStock: (products: Product[]) => Promise<void>;
  checkExpiringLots: () => Promise<void>;
  createAlert: (alert: Omit<StockAlert, 'id' | 'createdAt' | 'isRead' | 'isResolved'>) => Promise<string>;
  
  // Notification helpers
  sendSlackNotification: (alert: StockAlert) => Promise<void>;
  sendEmailNotification: (alert: StockAlert) => Promise<void>;
}

type AlertStore = AlertState & AlertActions;

const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  lowStockEnabled: true,
  lowStockThreshold: 10,
  outOfStockEnabled: true,
  expiryAlertEnabled: true,
  expiryDaysThreshold: 30,
  overstockEnabled: false,
  overstockMultiplier: 5,
  notificationChannels: {
    inApp: true,
    email: false,
    slack: false,
  },
};

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  alertSettings: null,
  loading: false,
  error: null,
  unreadCount: 0,

  fetchAlerts: async (includeResolved = false) => {
    set({ loading: true, error: null });
    try {
      let q;
      if (includeResolved) {
        q = query(
          collection(db, 'stockAlerts'),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'stockAlerts'),
          where('isResolved', '==', false),
          orderBy('createdAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
      })) as StockAlert[];
      
      const unreadCount = alerts.filter(a => !a.isRead && !a.isResolved).length;
      
      set({ alerts, unreadCount, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching alerts:', error);
    }
  },

  subscribeToAlerts: () => {
    const q = query(
      collection(db, 'stockAlerts'),
      where('isResolved', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
      })) as StockAlert[];
      
      const unreadCount = alerts.filter(a => !a.isRead).length;
      
      set({ alerts, unreadCount });
    });
  },

  markAsRead: async (alertId) => {
    try {
      await updateDoc(doc(db, 'stockAlerts', alertId), {
        isRead: true,
      });
      
      set(state => ({
        alerts: state.alerts.map(a => 
          a.id === alertId ? { ...a, isRead: true } : a
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      console.error('Error marking alert as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const unreadAlerts = get().alerts.filter(a => !a.isRead);
      
      await Promise.all(
        unreadAlerts.map(alert =>
          updateDoc(doc(db, 'stockAlerts', alert.id), { isRead: true })
        )
      );
      
      set(state => ({
        alerts: state.alerts.map(a => ({ ...a, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      console.error('Error marking all alerts as read:', error);
    }
  },

  resolveAlert: async (alertId, resolvedBy) => {
    try {
      const now = new Date();
      await updateDoc(doc(db, 'stockAlerts', alertId), {
        isResolved: true,
        resolvedAt: Timestamp.fromDate(now),
        resolvedBy,
      });
      
      set(state => ({
        alerts: state.alerts.map(a => 
          a.id === alertId 
            ? { ...a, isResolved: true, resolvedAt: now, resolvedBy } 
            : a
        ),
        unreadCount: state.alerts.find(a => a.id === alertId && !a.isRead)
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }));
    } catch (error: any) {
      console.error('Error resolving alert:', error);
    }
  },

  fetchAlertSettings: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'settings'));
      const settingsDoc = snapshot.docs.find(d => d.id === 'alerts');
      
      if (settingsDoc) {
        set({ alertSettings: settingsDoc.data() as AlertSettings });
      } else {
        set({ alertSettings: DEFAULT_ALERT_SETTINGS });
      }
    } catch (error: any) {
      console.error('Error fetching alert settings:', error);
      set({ alertSettings: DEFAULT_ALERT_SETTINGS });
    }
  },

  updateAlertSettings: async (settings) => {
    try {
      const currentSettings = get().alertSettings || DEFAULT_ALERT_SETTINGS;
      const newSettings = { ...currentSettings, ...settings };
      
      await updateDoc(doc(db, 'settings', 'alerts'), newSettings);
      
      set({ alertSettings: newSettings });
    } catch (error: any) {
      // If document doesn't exist, create it
      try {
        await addDoc(collection(db, 'settings'), {
          id: 'alerts',
          ...DEFAULT_ALERT_SETTINGS,
          ...settings,
        });
        set({ alertSettings: { ...DEFAULT_ALERT_SETTINGS, ...settings } });
      } catch (createError) {
        console.error('Error updating alert settings:', createError);
      }
    }
  },

  checkLowStock: async (products) => {
    const settings = get().alertSettings || DEFAULT_ALERT_SETTINGS;
    if (!settings.lowStockEnabled && !settings.outOfStockEnabled) return;
    
    const existingAlerts = get().alerts;
    
    for (const product of products) {
      const threshold = product.minStock || settings.lowStockThreshold;
      
      // Check for existing unresolved alert for this product
      const existingAlert = existingAlerts.find(
        a => a.productId === product.id && !a.isResolved
      );
      
      if (existingAlert) continue;
      
      if (settings.outOfStockEnabled && product.stock === 0) {
        await get().createAlert({
          type: 'out_of_stock',
          severity: 'critical',
          productId: product.id,
          productName: product.name,
          currentValue: 0,
          thresholdValue: threshold,
          message: `${product.name} stokta kalmadı!`,
        });
      } else if (settings.lowStockEnabled && product.stock <= threshold) {
        await get().createAlert({
          type: 'low_stock',
          severity: product.stock < threshold / 2 ? 'warning' : 'info',
          productId: product.id,
          productName: product.name,
          currentValue: product.stock,
          thresholdValue: threshold,
          message: `${product.name} düşük stokta: ${product.stock} adet kaldı (min: ${threshold})`,
        });
      }
    }
  },

  checkExpiringLots: async () => {
    // This would be called from a scheduled job or on app load
    // Implementation would check lots and create alerts for expiring items
    console.log('Checking expiring lots...');
  },

  createAlert: async (alertData) => {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'stockAlerts'), {
        ...alertData,
        isRead: false,
        isResolved: false,
        createdAt: Timestamp.fromDate(now),
      });
      
      const newAlert: StockAlert = {
        id: docRef.id,
        ...alertData,
        isRead: false,
        isResolved: false,
        createdAt: now,
      };
      
      set(state => ({
        alerts: [newAlert, ...state.alerts],
        unreadCount: state.unreadCount + 1,
      }));
      
      // Send notifications based on settings
      const settings = get().alertSettings;
      if (settings?.notificationChannels.slack) {
        await get().sendSlackNotification(newAlert);
      }
      if (settings?.notificationChannels.email) {
        await get().sendEmailNotification(newAlert);
      }
      
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating alert:', error);
      throw error;
    }
  },

  sendSlackNotification: async (alert) => {
    // TODO: Implement Slack webhook integration
    // This would call the Slack webhook URL from settings
    console.log('Sending Slack notification:', alert.message);
  },

  sendEmailNotification: async (alert) => {
    // TODO: Implement email notification
    // This would use SendGrid/Resend API
    console.log('Sending email notification:', alert.message);
  },
}));
