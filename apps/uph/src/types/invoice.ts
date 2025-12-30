// Invoice Types

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'other';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number; // percentage
  taxRate?: number; // percentage
  total: number;
  itemType: 'service' | 'product' | 'time' | 'expense';
  referenceId?: string; // Link to time entry, inventory item, etc.
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., "INV-2025-0001"
  userId: string;
  projectId?: string;
  projectName?: string;
  
  // Customer/Client Info
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  customerTaxId?: string;
  
  // Invoice Details
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  currency: 'TRY' | 'EUR' | 'USD' | 'GBP';
  
  // Dates
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  
  // Status & Payment
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  
  // Additional
  notes?: string;
  termsAndConditions?: string;
  pdfUrl?: string;
  
  // Reminders
  remindersSent: number;
  lastReminderDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceSettings {
  userId: string;
  companyName: string;
  companyAddress?: string;
  companyTaxId?: string;
  companyLogo?: string;
  bankDetails?: string;
  defaultCurrency: 'TRY' | 'EUR' | 'USD' | 'GBP';
  defaultTaxRate: number;
  defaultPaymentTerms: number; // days
  invoicePrefix: string; // e.g., "INV"
  nextInvoiceNumber: number;
  defaultNotes?: string;
  defaultTerms?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: Date;
}
