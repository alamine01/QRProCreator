import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/firebase';

// GET /api/admin/stats - Get admin statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
