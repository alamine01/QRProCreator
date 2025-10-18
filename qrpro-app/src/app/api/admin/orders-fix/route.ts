import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, updateOrderStatus } from '@/lib/firebase';

// GET /api/admin/orders-fix - Get all orders (Firebase only)
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [API ADMIN ORDERS-FIX] Récupération des données Firebase');
    
    // Utiliser uniquement Firebase
    const firebaseOrders = await getAllOrders();
    console.log('✅ [API ADMIN ORDERS-FIX] Données Firebase récupérées:', firebaseOrders.length);
    
    return NextResponse.json(firebaseOrders);
    
  } catch (error) {
    console.error('❌ [API ADMIN ORDERS-FIX] Erreur:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des commandes', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// PUT /api/admin/orders-fix - Update order status (Firebase only)
export async function PUT(request: NextRequest) {
  try {
    console.log('🚀 [API ADMIN ORDERS-FIX] Début de la mise à jour');
    const data = await request.json();
    console.log('🚀 [API ADMIN ORDERS-FIX] Données reçues:', data);
    
    // Vérification de sécurité basique
    if (!data.id || !data.status) {
      return NextResponse.json(
        { error: 'ID de commande et statut requis' },
        { status: 400 }
      );
    }

    // Validation des statuts
    const validStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(data.status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Utiliser uniquement Firebase
    console.log('🔥 [API ADMIN ORDERS-FIX] Mise à jour Firebase');
    const result = await updateOrderStatus(
      data.id, 
      data.status, 
      data.notes, 
      data.cancellationReason
    );
    
    if (result.success) {
      console.log('✅ [API ADMIN ORDERS-FIX] Mise à jour Firebase réussie');
      
      // Récupérer la commande mise à jour
      const orders = await getAllOrders();
      const updatedOrder = orders.find(order => order.id === data.id);
      
      return NextResponse.json({
        order: updatedOrder,
        emailSent: result.emailSent,
        message: `Statut mis à jour vers "${data.status}" avec succès`,
        source: 'firebase'
      });
    } else {
      console.error('❌ [API ADMIN ORDERS-FIX] Erreur de mise à jour Firebase:', result.error);
      return NextResponse.json({
        error: result.error || 'Erreur de mise à jour Firebase'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ [API ADMIN ORDERS-FIX] Erreur:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour de la commande', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}