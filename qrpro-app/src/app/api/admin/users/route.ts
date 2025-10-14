import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUserAdminStatus } from '@/lib/firebase';

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limitCount = limitParam ? parseInt(limitParam) : undefined;

    const users = await getAllUsers(limitCount);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/users - Update user (promote to admin, etc.)
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (data.id && data.isAdmin !== undefined) {
      await updateUserAdminStatus(data.id, data.isAdmin);
      
      // Retourner les données mises à jour
      const users = await getAllUsers();
      const updatedUser = users.find(user => user.id === data.id);
      
      return NextResponse.json(updatedUser);
    }
    
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
