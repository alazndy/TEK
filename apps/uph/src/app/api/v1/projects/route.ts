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

// API Key validation middleware
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
    
    // Check expiry
    if (keyData.expiresAt && keyData.expiresAt.toDate() < new Date()) {
      return null;
    }
    
    // Update last used
    // Note: In production, this should be done asynchronously
    
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

// GET /api/v1/projects
export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } },
      { status: 401 }
    );
  }
  
  if (!hasPermission(auth.permissions, 'projects:read')) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
      { status: 403 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '20'), 100);
    const status = searchParams.get('status');
    
    let q = query(
      collection(db, 'projects'),
      where('userId', '==', auth.userId),
      orderBy('createdAt', 'desc'),
      limit(perPage)
    );
    
    const snapshot = await getDocs(q);
    const projects = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    } as Record<string, unknown>));
    
    // Filter by status client-side if provided (Firestore limitation)
    const filteredProjects = status 
      ? projects.filter(p => p.status === status)
      : projects;
    
    return NextResponse.json({
      success: true,
      data: filteredProjects,
      meta: {
        page,
        perPage,
        total: filteredProjects.length,
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

// POST /api/v1/projects
export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } },
      { status: 401 }
    );
  }
  
  if (!hasPermission(auth.permissions, 'projects:write')) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Name is required' } },
        { status: 400 }
      );
    }
    
    const now = new Date();
    const project = {
      userId: auth.userId,
      name: body.name,
      description: body.description || '',
      status: body.status || 'Planning',
      priority: body.priority || 'Medium',
      budget: body.budget || 0,
      spent: 0,
      completionPercentage: 0,
      startDate: body.startDate || now.toISOString(),
      deadline: body.deadline || null,
      manager: body.manager || '',
      tags: body.tags || [],
      files: [],
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };
    
    const docRef = await addDoc(collection(db, 'projects'), project);
    
    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...project,
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
