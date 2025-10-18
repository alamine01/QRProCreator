import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, updateOrderStatus } from '@/lib/firebase';

// GET /api/admin/test-order-sync - Test de synchronisation des commandes
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TEST ORDER SYNC] Test de synchronisation des commandes');
    
    const orders = await getAllOrders();
    console.log('📊 [TEST ORDER SYNC] Commandes récupérées:', orders.length);
    
    // Analyser les statuts actuels
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculer les revenus par statut
    const revenueByStatus = orders.reduce((acc, order) => {
      const amount = typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount) || 0;
      acc[order.status] = (acc[order.status] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      statusCounts,
      revenueByStatus,
      deliveredRevenue: revenueByStatus.delivered || 0,
      message: 'Test de synchronisation terminé'
    });
    
  } catch (error) {
    console.error('❌ [TEST ORDER SYNC] Erreur:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erreur test synchronisation', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// POST /api/admin/test-order-sync - Test de mise à jour d'une commande
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [TEST ORDER SYNC] Test de mise à jour de commande');
    
    const { orderId, newStatus } = await request.json();
    
    if (!orderId || !newStatus) {
      return NextResponse.json({ 
        success: false,
        error: 'orderId et newStatus requis' 
      }, { status: 400 });
    }
    
    console.log('🧪 [TEST ORDER SYNC] Mise à jour:', { orderId, newStatus });
    
    // Effectuer la mise à jour
    const result = await updateOrderStatus(orderId, newStatus);
    
    if (result.success) {
      // Récupérer la commande mise à jour
      const orders = await getAllOrders();
      const updatedOrder = orders.find(order => order.id === orderId);
      
      return NextResponse.json({
        success: true,
        orderId,
        newStatus,
        updatedOrder,
        emailSent: result.emailSent,
        message: 'Mise à jour réussie'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Échec de la mise à jour'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ [TEST ORDER SYNC] Erreur:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erreur test mise à jour', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
