import { NextRequest, NextResponse } from 'next/server';
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

// API Key validation (same as projects)
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

// GET /api/v1/time-entries
export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } },
      { status: 401 }
    );
  }
  
  if (!hasPermission(auth.permissions, 'time:read')) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
      { status: 403 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '50'), 100);
    
    let q = query(
      collection(db, 'timeEntries'),
      where('userId', '==', auth.userId),
      orderBy('startTime', 'desc'),
      limit(perPage)
    );
    
    const snapshot = await getDocs(q);
    let entries = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        startTime: data.startTime?.toDate?.()?.toISOString() || null,
        endTime: data.endTime?.toDate?.()?.toISOString() || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      } as Record<string, unknown>;
    });
    
    // Client-side filtering
    if (projectId) {
      entries = entries.filter(e => e.projectId === projectId);
    }
    if (startDate) {
      const start = new Date(startDate);
      entries = entries.filter(e => new Date(String(e.startTime)) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      entries = entries.filter(e => new Date(String(e.startTime)) <= end);
    }
    
    // Calculate totals
    const totalMinutes = entries.reduce((sum, e) => sum + (Number(e.duration) || 0), 0);
    const billableMinutes = entries.filter(e => e.billable).reduce((sum, e) => sum + (Number(e.duration) || 0), 0);
    
    return NextResponse.json({
      success: true,
      data: entries,
      meta: {
        page,
        perPage,
        total: entries.length,
        totalHours: Math.round(totalMinutes / 60 * 100) / 100,
        billableHours: Math.round(billableMinutes / 60 * 100) / 100,
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

// POST /api/v1/time-entries
export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } },
      { status: 401 }
    );
  }
  
  if (!hasPermission(auth.permissions, 'time:write')) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.startTime) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'startTime is required' } },
        { status: 400 }
      );
    }
    
    const startTime = new Date(body.startTime);
    const endTime = body.endTime ? new Date(body.endTime) : null;
    
    // Calculate duration if both start and end are provided
    let duration = body.duration || 0;
    if (endTime && !body.duration) {
      duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    }
    
    const now = new Date();
    const entry = {
      userId: auth.userId,
      projectId: body.projectId || null,
      taskId: body.taskId || null,
      description: body.description || '',
      startTime: Timestamp.fromDate(startTime),
      endTime: endTime ? Timestamp.fromDate(endTime) : null,
      duration,
      billable: body.billable !== false,
      hourlyRate: body.hourlyRate || null,
      tags: body.tags || [],
      status: endTime ? 'completed' : 'running',
      breaks: [],
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };
    
    const docRef = await addDoc(collection(db, 'timeEntries'), entry);
    
    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...entry,
        startTime: startTime.toISOString(),
        endTime: endTime?.toISOString() || null,
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
