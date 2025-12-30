import { create } from 'zustand';
import { Notification } from '@/types/notification';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  subscribeToNotifications: (userId: string) => () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  subscribeToNotifications: (userId: string) => {
    set({ isLoading: true });
    
    // Subscribe to notifications for the specific user
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      const unreadCount = notifications.filter(n => !n.read).length;
      
      set({ notifications, unreadCount, isLoading: false });
    }, (error) => {
      console.error("Notification subscription error:", error);
      set({ isLoading: false });
    });

    return unsubscribe;
  },

  addNotification: async (notificationData) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
      // State updates automatically via listener
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) return;

    try {
      const batch = writeBatch(db);
      unreadNotifications.forEach(n => {
        const notifRef = doc(db, 'notifications', n.id);
        batch.update(notifRef, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }
}));
