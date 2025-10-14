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
    console.log('🚀 [API ADMIN] Début de la mise à jour de statut');
    const data = await request.json();
    console.log('🚀 [API ADMIN] Données reçues:', data);
    
    if (data.id && data.status) {
      console.log('🚀 [API ADMIN] Appel de updateOrderStatus...');
      const result = await updateOrderStatus(
        data.id, 
        data.status, 
        data.notes, 
        data.cancellationReason
      );
      console.log('🚀 [API ADMIN] Résultat updateOrderStatus:', result);

      if (!result.success) {
        return NextResponse.json({ 
          error: result.error || 'Erreur lors de la mise à jour du statut' 
        }, { status: 500 });
      }

      // Retourner la commande mise à jour avec le statut d'email
      const orders = await getAllOrders();
      const updatedOrder = orders.find(order => order.id === data.id);
      
      return NextResponse.json({
        order: updatedOrder,
        emailSent: result.emailSent,
        message: result.emailSent 
          ? 'Statut mis à jour et email envoyé avec succès' 
          : 'Statut mis à jour mais email non envoyé'
      });
    }
    
    return NextResponse.json({ error: 'Missing order ID or status' }, { status: 400 });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
