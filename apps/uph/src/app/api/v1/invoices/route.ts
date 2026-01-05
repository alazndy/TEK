import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';

// API Key validation
async function validateApiKey(request: NextRequest): Promise<{ userId: string; permissions: string[] } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const apiKey = authHeader.substring(7);
  const keyPrefix = apiKey.substring(0, 8);
  
  try {
    const q = query(
      collection(db, 'apiKeys'),
      where('keyPrefix', '==', keyPrefix),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const keyDoc = snapshot.docs[0];
    const keyData = keyDoc.data();
    
    if (keyData.expiresAt && keyData.expiresAt.toDate() < new Date()) {
      return null;
    }
    
    return {
      userId: keyData.userId,
      permissions: keyData.permissions || [],
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return null;
  }
}

function hasPermission(permissions: string[], required: string): boolean {
  return permissions.includes(required) || permissions.includes('*');
}

// GET /api/v1/invoices
export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } },
      { status: 401 }
    );
  }
  
  if (!hasPermission(auth.permissions, 'invoices:read')) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
      { status: 403 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '20'), 100);
    
    let q = query(
      collection(db, 'invoices'),
      where('userId', '==', auth.userId),
      orderBy('issueDate', 'desc'),
      limit(perPage)
    );
    
    const snapshot = await getDocs(q);
    let invoices = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        issueDate: data.issueDate?.toDate?.()?.toISOString() || null,
        dueDate: data.dueDate?.toDate?.()?.toISOString() || null,
        paidDate: data.paidDate?.toDate?.()?.toISOString() || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      } as Record<string, unknown>;
    });
    
    // Client-side filtering
    if (status) {
      invoices = invoices.filter(i => i.status === status);
    }
    if (customerId) {
      invoices = invoices.filter(i => i.customerId === customerId);
    }
    
    // Calculate totals
    const totalAmount = invoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const pendingAmount = invoices.filter(i => ['sent', 'viewed', 'overdue'].includes(String(i.status))).reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    
    return NextResponse.json({
      success: true,
      data: invoices,
      meta: {
        page,
        perPage,
        total: invoices.length,
        totalAmount,
        paidAmount,
        pendingAmount,
      }
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

// POST /api/v1/invoices
export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } },
      { status: 401 }
    );
  }
  
  if (!hasPermission(auth.permissions, 'invoices:write')) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.customerName) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'customerName is required' } },
        { status: 400 }
      );
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'At least one item is required' } },
        { status: 400 }
      );
    }
    
    // Calculate totals
    const items = body.items.map((item: any, index: number) => ({
      id: `item-${index + 1}`,
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      discount: item.discount || 0,
      taxRate: item.taxRate || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0) * (1 - (item.discount || 0) / 100),
      itemType: item.itemType || 'service',
    }));
    
    const subtotal = items.reduce((sum: number, i: any) => sum + i.total, 0);
    const discountAmount = subtotal * ((body.discountPercent || 0) / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * ((body.taxRate || 0) / 100);
    const total = afterDiscount + taxAmount;
    
    const now = new Date();
    const issueDate = body.issueDate ? new Date(body.issueDate) : now;
    const dueDate = body.dueDate ? new Date(body.dueDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Generate invoice number
    const year = now.getFullYear();
    const countQuery = query(
      collection(db, 'invoices'),
      where('userId', '==', auth.userId)
    );
    const countSnapshot = await getDocs(countQuery);
    const invoiceNumber = `INV-${year}-${String(countSnapshot.size + 1).padStart(4, '0')}`;
    
    const invoice = {
      userId: auth.userId,
      invoiceNumber,
      projectId: body.projectId || null,
      projectName: body.projectName || null,
      customerId: body.customerId || null,
      customerName: body.customerName,
      customerEmail: body.customerEmail || null,
      customerAddress: body.customerAddress || null,
      customerTaxId: body.customerTaxId || null,
      items,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      currency: body.currency || 'TRY',
      issueDate: Timestamp.fromDate(issueDate),
      dueDate: Timestamp.fromDate(dueDate),
      status: 'draft',
      notes: body.notes || null,
      termsAndConditions: body.termsAndConditions || null,
      remindersSent: 0,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };
    
    const docRef = await addDoc(collection(db, 'invoices'), invoice);
    
    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...invoice,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
