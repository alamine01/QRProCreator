import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, updateOrderStatus } from '@/lib/firebase';

// GET /api/admin/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const statusParam = url.searchParams.get('status');
    const limitCount = limitParam ? parseInt(limitParam) : undefined;

    const orders = await getAllOrders(limitCount, statusParam || undefined);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/orders - Update order status
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (data.id && data.status) {
      await updateOrderStatus(
        data.id, 
        data.status, 
        data.notes, 
        data.cancellationReason
      );

      // Retourner la commande mise à jour
      const orders = await getAllOrders();
      const updatedOrder = orders.find(order => order.id === data.id);
      
      return NextResponse.json(updatedOrder);
    }
    
    return NextResponse.json({ error: 'Missing order ID or status' }, { status: 400 });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
