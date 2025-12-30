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
import type { TimeEntry, Timesheet, TimeStats, TimeEntryStatus, TimesheetStatus } from '@/types/time';

interface TimeState {
  entries: TimeEntry[];
  timesheets: Timesheet[];
  activeEntry: TimeEntry | null;
  stats: TimeStats | null;
  loading: boolean;
  error: string | null;
}

interface TimeActions {
  // Time Entries
  fetchEntries: (userId: string, projectId?: string, startDate?: Date, endDate?: Date) => Promise<void>;
  startTimer: (data: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'duration' | 'status' | 'breaks'>) => Promise<string>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  addManualEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'breaks'>) => Promise<string>;
  updateEntry: (id: string, data: Partial<TimeEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  
  // Timesheets
  fetchTimesheets: (userId: string) => Promise<void>;
  createTimesheet: (userId: string, weekStartDate: Date) => Promise<string>;
  submitTimesheet: (id: string) => Promise<void>;
  approveTimesheet: (id: string, approvedBy: string) => Promise<void>;
  rejectTimesheet: (id: string, reason: string) => Promise<void>;
  
  // Stats
  calculateStats: (userId: string) => Promise<void>;
  
  // Helpers
  getActiveEntry: () => TimeEntry | null;
  getEntriesByProject: (projectId: string) => TimeEntry[];
  getTotalHoursToday: (userId: string) => number;
  createManualEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'breaks'>) => Promise<string>;
}

type TimeStore = TimeState & TimeActions;

export const useTimeStore = create<TimeStore>((set, get) => ({
  entries: [],
  timesheets: [],
  activeEntry: null,
  stats: null,
  loading: false,
  error: null,

  fetchEntries: async (userId, projectId, startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      let q = query(
        collection(db, 'timeEntries'),
        where('userId', '==', userId),
        orderBy('startTime', 'desc')
      );
      
      const snapshot = await getDocs(q);
      let entries = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          breaks: (data.breaks || []).map((b: any) => ({
            start: b.start?.toDate(),
            end: b.end?.toDate(),
          })),
        };
      }) as TimeEntry[];
      
      // Client-side filtering
      if (projectId) {
        entries = entries.filter(e => e.projectId === projectId);
      }
      if (startDate) {
        entries = entries.filter(e => new Date(e.startTime) >= startDate);
      }
      if (endDate) {
        entries = entries.filter(e => new Date(e.startTime) <= endDate);
      }
      
      // Find active entry
      const activeEntry = entries.find(e => e.status === 'running' || e.status === 'paused');
      
      set({ entries, activeEntry, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching time entries:', error);
    }
  },

  startTimer: async (data) => {
    set({ loading: true, error: null });
    try {
      // Stop any running timer first
      const current = get().activeEntry;
      if (current) {
        await get().stopTimer();
      }
      
      const now = new Date();
      const entry: Omit<TimeEntry, 'id'> = {
        ...data,
        startTime: now,
        duration: 0,
        breaks: [],
        status: 'running',
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'timeEntries'), {
        ...entry,
        startTime: Timestamp.fromDate(now),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      const newEntry: TimeEntry = {
        id: docRef.id,
        ...entry,
      };
      
      set(state => ({
        entries: [newEntry, ...state.entries],
        activeEntry: newEntry,
        loading: false,
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  pauseTimer: async () => {
    const active = get().activeEntry;
    if (!active || active.status !== 'running') return;
    
    const now = new Date();
    const newBreaks = [...active.breaks, { start: now }];
    
    await updateDoc(doc(db, 'timeEntries', active.id), {
      status: 'paused',
      breaks: newBreaks.map(b => ({
        start: Timestamp.fromDate(b.start),
        end: b.end ? Timestamp.fromDate(b.end) : null,
      })),
      updatedAt: Timestamp.fromDate(now),
    });
    
    const updatedEntry = { ...active, status: 'paused' as TimeEntryStatus, breaks: newBreaks };
    
    set(state => ({
      activeEntry: updatedEntry,
      entries: state.entries.map(e => e.id === active.id ? updatedEntry : e),
    }));
  },

  resumeTimer: async () => {
    const active = get().activeEntry;
    if (!active || active.status !== 'paused') return;
    
    const now = new Date();
    const newBreaks = active.breaks.map((b, i) => 
      i === active.breaks.length - 1 ? { ...b, end: now } : b
    );
    
    await updateDoc(doc(db, 'timeEntries', active.id), {
      status: 'running',
      breaks: newBreaks.map(b => ({
        start: Timestamp.fromDate(b.start),
        end: b.end ? Timestamp.fromDate(b.end) : null,
      })),
      updatedAt: Timestamp.fromDate(now),
    });
    
    const updatedEntry = { ...active, status: 'running' as TimeEntryStatus, breaks: newBreaks };
    
    set(state => ({
      activeEntry: updatedEntry,
      entries: state.entries.map(e => e.id === active.id ? updatedEntry : e),
    }));
  },

  stopTimer: async () => {
    const active = get().activeEntry;
    if (!active) return;
    
    const now = new Date();
    
    // Calculate total duration
    let totalMs = now.getTime() - new Date(active.startTime).getTime();
    
    // Subtract break time
    for (const b of active.breaks) {
      const breakEnd = b.end || now;
      totalMs -= breakEnd.getTime() - new Date(b.start).getTime();
    }
    
    const duration = Math.round(totalMs / 60000); // Convert to minutes
    
    // Close any open break
    const finalBreaks = active.breaks.map(b => 
      b.end ? b : { ...b, end: now }
    );
    
    await updateDoc(doc(db, 'timeEntries', active.id), {
      status: 'completed',
      endTime: Timestamp.fromDate(now),
      duration,
      breaks: finalBreaks.map(b => ({
        start: Timestamp.fromDate(b.start),
        end: b.end ? Timestamp.fromDate(b.end) : Timestamp.fromDate(now),
      })),
      updatedAt: Timestamp.fromDate(now),
    });
    
    const completedEntry: TimeEntry = {
      ...active,
      status: 'completed',
      endTime: now,
      duration,
      breaks: finalBreaks,
    };
    
    set(state => ({
      activeEntry: null,
      entries: state.entries.map(e => e.id === active.id ? completedEntry : e),
    }));
  },

  addManualEntry: async (data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const entry: Omit<TimeEntry, 'id'> = {
        ...data,
        breaks: [],
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'timeEntries'), {
        ...entry,
        startTime: Timestamp.fromDate(data.startTime),
        endTime: data.endTime ? Timestamp.fromDate(data.endTime) : null,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      const newEntry: TimeEntry = {
        id: docRef.id,
        ...entry,
      };
      
      set(state => ({
        entries: [newEntry, ...state.entries],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateEntry: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.fromDate(now),
      };
      
      if (data.startTime) updateData.startTime = Timestamp.fromDate(data.startTime);
      if (data.endTime) updateData.endTime = Timestamp.fromDate(data.endTime);
      
      await updateDoc(doc(db, 'timeEntries', id), updateData);
      
      set(state => ({
        entries: state.entries.map(e => e.id === id ? { ...e, ...data, updatedAt: now } : e),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteEntry: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'timeEntries', id));
      
      set(state => ({
        entries: state.entries.filter(e => e.id !== id),
        activeEntry: state.activeEntry?.id === id ? null : state.activeEntry,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchTimesheets: async (userId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'timesheets'),
        where('userId', '==', userId),
        orderBy('weekStartDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const timesheets = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          weekStartDate: data.weekStartDate?.toDate() || new Date(),
          weekEndDate: data.weekEndDate?.toDate() || new Date(),
          submittedAt: data.submittedAt?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as Timesheet[];
      
      set({ timesheets, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching timesheets:', error);
    }
  },

  createTimesheet: async (userId, weekStartDate) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      
      // Get entries for this week
      const entries = get().entries.filter(e => {
        const entryDate = new Date(e.startTime);
        return entryDate >= weekStartDate && entryDate <= weekEndDate;
      });
      
      const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
      const billableMinutes = entries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0);
      const totalAmount = entries
        .filter(e => e.billable && e.hourlyRate)
        .reduce((sum, e) => sum + (e.duration / 60) * (e.hourlyRate || 0), 0);
      
      const timesheet: Omit<Timesheet, 'id'> = {
        userId,
        weekStartDate,
        weekEndDate,
        entries: entries.map(e => e.id),
        totalHours: Math.round(totalMinutes / 60 * 100) / 100,
        billableHours: Math.round(billableMinutes / 60 * 100) / 100,
        totalAmount,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'timesheets'), {
        ...timesheet,
        weekStartDate: Timestamp.fromDate(weekStartDate),
        weekEndDate: Timestamp.fromDate(weekEndDate),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      const newTimesheet: Timesheet = { id: docRef.id, ...timesheet };
      
      set(state => ({
        timesheets: [newTimesheet, ...state.timesheets],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  submitTimesheet: async (id) => {
    const now = new Date();
    await updateDoc(doc(db, 'timesheets', id), {
      status: 'submitted',
      submittedAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    
    set(state => ({
      timesheets: state.timesheets.map(t => 
        t.id === id ? { ...t, status: 'submitted' as TimesheetStatus, submittedAt: now } : t
      ),
    }));
  },

  approveTimesheet: async (id, approvedBy) => {
    const now = new Date();
    await updateDoc(doc(db, 'timesheets', id), {
      status: 'approved',
      approvedBy,
      approvedAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    
    set(state => ({
      timesheets: state.timesheets.map(t => 
        t.id === id ? { ...t, status: 'approved' as TimesheetStatus, approvedBy, approvedAt: now } : t
      ),
    }));
  },

  rejectTimesheet: async (id, reason) => {
    const now = new Date();
    await updateDoc(doc(db, 'timesheets', id), {
      status: 'rejected',
      rejectionReason: reason,
      updatedAt: Timestamp.fromDate(now),
    });
    
    set(state => ({
      timesheets: state.timesheets.map(t => 
        t.id === id ? { ...t, status: 'rejected' as TimesheetStatus, rejectionReason: reason } : t
      ),
    }));
  },

  calculateStats: async (userId) => {
    const entries = get().entries.filter(e => e.userId === userId && e.status === 'completed');
    const now = new Date();
    
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const todayMinutes = entries
      .filter(e => new Date(e.startTime) >= startOfToday)
      .reduce((sum, e) => sum + e.duration, 0);
    
    const weekMinutes = entries
      .filter(e => new Date(e.startTime) >= startOfWeek)
      .reduce((sum, e) => sum + e.duration, 0);
    
    const monthMinutes = entries
      .filter(e => new Date(e.startTime) >= startOfMonth)
      .reduce((sum, e) => sum + e.duration, 0);
    
    const billableMonthMinutes = entries
      .filter(e => new Date(e.startTime) >= startOfMonth && e.billable)
      .reduce((sum, e) => sum + e.duration, 0);
    
    const daysInMonth = now.getDate();
    const averageDaily = monthMinutes / daysInMonth;
    
    set({
      stats: {
        today: Math.round(todayMinutes / 60 * 100) / 100,
        thisWeek: Math.round(weekMinutes / 60 * 100) / 100,
        thisMonth: Math.round(monthMinutes / 60 * 100) / 100,
        billableThisMonth: Math.round(billableMonthMinutes / 60 * 100) / 100,
        averageDaily: Math.round(averageDaily / 60 * 100) / 100,
      },
    });
  },

  getActiveEntry: () => get().activeEntry,

  getEntriesByProject: (projectId) => {
    return get().entries.filter(e => e.projectId === projectId);
  },

  getTotalHoursToday: (userId) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const minutes = get().entries
      .filter(e => 
        e.userId === userId && 
        e.status === 'completed' &&
        new Date(e.startTime) >= startOfToday
      )
      .reduce((sum, e) => sum + e.duration, 0);
    
    return Math.round(minutes / 60 * 100) / 100;
  },

  createManualEntry: (entry) => get().addManualEntry(entry),
}));
