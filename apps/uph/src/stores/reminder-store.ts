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
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Reminder, ReminderSettings, ReminderStatus, ReminderType } from '@/types/reminder';

interface ReminderState {
  reminders: Reminder[];
  settings: ReminderSettings | null;
  loading: boolean;
  error: string | null;
  upcomingCount: number;
}

interface ReminderActions {
  fetchReminders: (userId: string, includeCompleted?: boolean) => Promise<void>;
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'sentAt'>) => Promise<string>;
  updateReminder: (id: string, data: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  
  markAsSent: (id: string) => Promise<void>;
  dismissReminder: (id: string) => Promise<void>;
  snoozeReminder: (id: string, until: Date) => Promise<void>;
  
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (userId: string, data: Partial<ReminderSettings>) => Promise<void>;
  
  // Auto-reminder generation
  createDeadlineReminders: (projectId: string, deadline: Date, title: string) => Promise<void>;
  createOverdueReminder: (taskId: string, taskTitle: string, daysOverdue: number) => Promise<void>;
  
  getRemindersByTarget: (targetType: string, targetId: string) => Reminder[];
  getDueReminders: () => Reminder[];
}

type ReminderStore = ReminderState & ReminderActions;

export const useReminderStore = create<ReminderStore>((set, get) => ({
  reminders: [],
  settings: null,
  loading: false,
  error: null,
  upcomingCount: 0,

  fetchReminders: async (userId, includeCompleted = false) => {
    set({ loading: true, error: null });
    try {
      let q;
      if (includeCompleted) {
        q = query(
          collection(db, 'reminders'),
          where('userId', '==', userId),
          orderBy('triggerDate', 'asc')
        );
      } else {
        q = query(
          collection(db, 'reminders'),
          where('userId', '==', userId),
          where('status', 'in', ['pending', 'snoozed']),
          orderBy('triggerDate', 'asc')
        );
      }
      
      const snapshot = await getDocs(q);
      const reminders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          triggerDate: data.triggerDate?.toDate() || new Date(),
          repeatUntil: data.repeatUntil?.toDate(),
          sentAt: data.sentAt?.toDate(),
          snoozedUntil: data.snoozedUntil?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as Reminder[];
      
      // Count upcoming (due in next 24 hours)
      const next24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const upcomingCount = reminders.filter(r => 
        r.status === 'pending' && new Date(r.triggerDate) <= next24h
      ).length;
      
      set({ reminders, upcomingCount, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching reminders:', error);
    }
  },

  addReminder: async (reminderData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const reminder = {
        ...reminderData,
        status: 'pending' as ReminderStatus,
        createdAt: now,
        updatedAt: now,
      };
      
      const docData: any = {
        ...reminder,
        triggerDate: Timestamp.fromDate(reminderData.triggerDate),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };
      
      if (reminderData.repeatUntil) {
        docData.repeatUntil = Timestamp.fromDate(reminderData.repeatUntil);
      }
      
      const docRef = await addDoc(collection(db, 'reminders'), docData);
      
      const newReminder: Reminder = { id: docRef.id, ...reminder };
      
      set(state => ({
        reminders: [...state.reminders, newReminder].sort(
          (a, b) => new Date(a.triggerDate).getTime() - new Date(b.triggerDate).getTime()
        ),
        loading: false,
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateReminder: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.fromDate(now),
      };
      
      if (data.triggerDate) updateData.triggerDate = Timestamp.fromDate(data.triggerDate);
      if (data.repeatUntil) updateData.repeatUntil = Timestamp.fromDate(data.repeatUntil);
      if (data.snoozedUntil) updateData.snoozedUntil = Timestamp.fromDate(data.snoozedUntil);
      
      await updateDoc(doc(db, 'reminders', id), updateData);
      
      set(state => ({
        reminders: state.reminders.map(r => 
          r.id === id ? { ...r, ...data, updatedAt: now } : r
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteReminder: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'reminders', id));
      
      set(state => ({
        reminders: state.reminders.filter(r => r.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  markAsSent: async (id) => {
    const now = new Date();
    await get().updateReminder(id, {
      status: 'sent',
      sentAt: now,
    });
  },

  dismissReminder: async (id) => {
    await get().updateReminder(id, {
      status: 'dismissed',
    });
  },

  snoozeReminder: async (id, until) => {
    await get().updateReminder(id, {
      status: 'snoozed',
      snoozedUntil: until,
    });
  },

  fetchSettings: async (userId) => {
    try {
      const q = query(
        collection(db, 'reminderSettings'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.docs.length > 0) {
        set({ settings: snapshot.docs[0].data() as ReminderSettings });
      } else {
        // Create default settings
        const defaultSettings: ReminderSettings = {
          userId,
          enableDeadlineReminders: true,
          deadlineReminderDays: [1, 3, 7],
          enableOverdueReminders: true,
          overdueReminderFrequency: 'daily',
          enableMilestoneReminders: true,
          defaultChannels: ['in_app'],
        };
        await addDoc(collection(db, 'reminderSettings'), defaultSettings);
        set({ settings: defaultSettings });
      }
    } catch (error: any) {
      console.error('Error fetching reminder settings:', error);
    }
  },

  updateSettings: async (userId, data) => {
    const q = query(
      collection(db, 'reminderSettings'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 0) {
      await updateDoc(doc(db, 'reminderSettings', snapshot.docs[0].id), data);
      set(state => ({
        settings: state.settings ? { ...state.settings, ...data } : null,
      }));
    }
  },

  createDeadlineReminders: async (projectId, deadline, title) => {
    const settings = get().settings;
    if (!settings?.enableDeadlineReminders) return;
    
    const userId = settings.userId;
    const days = settings.deadlineReminderDays || [1, 3, 7];
    
    for (const daysBefore of days) {
      const triggerDate = new Date(deadline);
      triggerDate.setDate(triggerDate.getDate() - daysBefore);
      
      // Don't create reminders in the past
      if (triggerDate > new Date()) {
        await get().addReminder({
          userId,
          type: 'deadline',
          targetType: 'project',
          targetId: projectId,
          targetName: title,
          title: `Yaklaşan Son Tarih`,
          message: `"${title}" projesinin son tarihi ${daysBefore} gün sonra.`,
          triggerDate,
          channels: settings.defaultChannels,
          priority: daysBefore === 1 ? 'high' : 'medium',
        });
      }
    }
  },

  createOverdueReminder: async (taskId, taskTitle, daysOverdue) => {
    const settings = get().settings;
    if (!settings?.enableOverdueReminders) return;
    
    await get().addReminder({
      userId: settings.userId,
      type: 'overdue',
      targetType: 'task',
      targetId: taskId,
      targetName: taskTitle,
      title: `Gecikmiş Görev`,
      message: `"${taskTitle}" görevi ${daysOverdue} gündür gecikmiş durumda.`,
      triggerDate: new Date(),
      channels: settings.defaultChannels,
      priority: 'high',
    });
  },

  getRemindersByTarget: (targetType, targetId) => {
    return get().reminders.filter(r => 
      r.targetType === targetType && r.targetId === targetId
    );
  },

  getDueReminders: () => {
    const now = new Date();
    return get().reminders.filter(r => {
      if (r.status !== 'pending') return false;
      
      const triggerTime = r.snoozedUntil || r.triggerDate;
      return new Date(triggerTime) <= now;
    });
  },
}));
