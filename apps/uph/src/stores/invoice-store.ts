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
import type { Invoice, InvoiceItem, InvoiceStatus, InvoiceSettings, PaymentRecord } from '@/types/invoice';
import { emailService } from '@/services/email-service';

interface InvoiceState {
  invoices: Invoice[];
  settings: InvoiceSettings | null;
  payments: PaymentRecord[];
  loading: boolean;
  error: string | null;
}

interface InvoiceActions {
  fetchInvoices: (userId: string, status?: InvoiceStatus) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'remindersSent'>) => Promise<string>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  
  updateStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  markAsPaid: (id: string, paymentMethod: string, reference?: string) => Promise<void>;
  sendReminder: (id: string) => Promise<void>;
  
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (userId: string, data: Partial<InvoiceSettings>) => Promise<void>;
  
  addPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => Promise<string>;
  fetchPayments: (invoiceId: string) => Promise<void>;
  
  generateInvoiceNumber: () => string;
  calculateTotals: (items: InvoiceItem[], discountPercent?: number, taxRate?: number) => {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
  };
  
  getInvoiceById: (id: string) => Invoice | undefined;
  getOverdueInvoices: () => Invoice[];
  getMonthlyRevenue: () => number;
}

type InvoiceStore = InvoiceState & InvoiceActions;

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  settings: null,
  payments: [],
  loading: false,
  error: null,

  fetchInvoices: async (userId, status) => {
    set({ loading: true, error: null });
    try {
      let q;
      if (status) {
        q = query(
          collection(db, 'invoices'),
          where('userId', '==', userId),
          where('status', '==', status),
          orderBy('issueDate', 'desc')
        );
      } else {
        q = query(
          collection(db, 'invoices'),
          where('userId', '==', userId),
          orderBy('issueDate', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      const invoices = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || new Date(),
          paidDate: data.paidDate?.toDate(),
          lastReminderDate: data.lastReminderDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as Invoice[];
      
      // Check for overdue invoices
      const now = new Date();
      const updatedInvoices = invoices.map(inv => {
        if (inv.status === 'sent' && new Date(inv.dueDate) < now) {
          // Update to overdue in Firestore
          updateDoc(doc(db, 'invoices', inv.id), { status: 'overdue' });
          return { ...inv, status: 'overdue' as InvoiceStatus };
        }
        return inv;
      });
      
      set({ invoices: updatedInvoices, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching invoices:', error);
    }
  },

  addInvoice: async (invoiceData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const invoice = {
        ...invoiceData,
        remindersSent: 0,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'invoices'), {
        ...invoice,
        issueDate: Timestamp.fromDate(invoiceData.issueDate),
        dueDate: Timestamp.fromDate(invoiceData.dueDate),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      const newInvoice: Invoice = { id: docRef.id, ...invoice };
      
      // Update next invoice number in settings
      const settings = get().settings;
      if (settings) {
        await get().updateSettings(invoiceData.userId, {
          nextInvoiceNumber: settings.nextInvoiceNumber + 1,
        });
      }
      
      set(state => ({
        invoices: [newInvoice, ...state.invoices],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateInvoice: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.fromDate(now),
      };
      
      if (data.issueDate) updateData.issueDate = Timestamp.fromDate(data.issueDate);
      if (data.dueDate) updateData.dueDate = Timestamp.fromDate(data.dueDate);
      if (data.paidDate) updateData.paidDate = Timestamp.fromDate(data.paidDate);
      
      await updateDoc(doc(db, 'invoices', id), updateData);
      
      set(state => ({
        invoices: state.invoices.map(inv => 
          inv.id === id ? { ...inv, ...data, updatedAt: now } : inv
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteInvoice: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'invoices', id));
      
      set(state => ({
        invoices: state.invoices.filter(inv => inv.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    await get().updateInvoice(id, { status });
  },

  markAsPaid: async (id, paymentMethod, reference) => {
    const now = new Date();
    await get().updateInvoice(id, {
      status: 'paid',
      paidDate: now,
      paymentMethod: paymentMethod as any,
      paymentReference: reference,
    });
    
    // Add payment record
    const invoice = get().getInvoiceById(id);
    if (invoice) {
      await get().addPayment({
        invoiceId: id,
        amount: invoice.total,
        currency: invoice.currency,
        paymentDate: now,
        paymentMethod: paymentMethod as any,
        reference,
      });
    }
  },

  sendReminder: async (id) => {
    const now = new Date();
    const invoice = get().getInvoiceById(id);
    if (!invoice) return;
    
    // Use the email service
    await emailService.sendInvoiceReminder(id, invoice.customerEmail || 'unknown@example.com');
    
    await get().updateInvoice(id, {
      remindersSent: invoice.remindersSent + 1,
      lastReminderDate: now,
    });
  },

  fetchSettings: async (userId) => {
    try {
      const q = query(
        collection(db, 'invoiceSettings'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.docs.length > 0) {
        const data = snapshot.docs[0].data();
        set({ settings: { id: snapshot.docs[0].id, ...data } as unknown as InvoiceSettings });
      } else {
        // Create default settings
        const defaultSettings: InvoiceSettings = {
          userId,
          companyName: '',
          defaultCurrency: 'TRY',
          defaultTaxRate: 20,
          defaultPaymentTerms: 30,
          invoicePrefix: 'INV',
          nextInvoiceNumber: 1,
        };
        await addDoc(collection(db, 'invoiceSettings'), defaultSettings);
        set({ settings: defaultSettings });
      }
    } catch (error: any) {
      console.error('Error fetching invoice settings:', error);
    }
  },

  updateSettings: async (userId, data) => {
    const settings = get().settings;
    if (!settings) return;
    
    const q = query(
      collection(db, 'invoiceSettings'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 0) {
      await updateDoc(doc(db, 'invoiceSettings', snapshot.docs[0].id), data);
      set({ settings: { ...settings, ...data } });
    }
  },

  addPayment: async (paymentData) => {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'payments'), {
        ...paymentData,
        paymentDate: Timestamp.fromDate(paymentData.paymentDate),
        createdAt: Timestamp.fromDate(now),
      });
      
      const newPayment: PaymentRecord = {
        id: docRef.id,
        ...paymentData,
        createdAt: now,
      };
      
      set(state => ({
        payments: [newPayment, ...state.payments],
      }));
      
      return docRef.id;
    } catch (error: any) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },

  fetchPayments: async (invoiceId) => {
    try {
      const q = query(
        collection(db, 'payments'),
        where('invoiceId', '==', invoiceId),
        orderBy('paymentDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as PaymentRecord[];
      
      set({ payments });
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    }
  },

  generateInvoiceNumber: () => {
    const settings = get().settings;
    if (!settings) return 'INV-0001';
    
    const year = new Date().getFullYear();
    const number = String(settings.nextInvoiceNumber).padStart(4, '0');
    return `${settings.invoicePrefix}-${year}-${number}`;
  },

  calculateTotals: (items, discountPercent = 0, taxRate = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },

  getInvoiceById: (id) => {
    return get().invoices.find(inv => inv.id === id);
  },

  getOverdueInvoices: () => {
    return get().invoices.filter(inv => inv.status === 'overdue');
  },

  getMonthlyRevenue: () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return get().invoices
      .filter(inv => 
        inv.status === 'paid' && 
        inv.paidDate && 
        new Date(inv.paidDate) >= startOfMonth
      )
      .reduce((sum, inv) => sum + inv.total, 0);
  },
}));
