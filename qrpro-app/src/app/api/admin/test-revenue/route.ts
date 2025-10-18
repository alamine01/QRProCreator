import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/firebase';

// GET /api/admin/test-revenue - Test du calcul des revenus
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TEST REVENUE] Test du calcul des revenus');
    
    const orders = await getAllOrders();
    console.log('📊 [TEST REVENUE] Commandes récupérées:', orders.length);
    
    // Analyser toutes les commandes
    const allOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      finalAmount: order.totalAmount || 0
    }));
    
    // Calculer les revenus par statut
    const revenueByStatus = {
      pending: orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      processing: orders.filter(o => o.status === 'processing').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      delivered: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      cancelled: orders.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const deliveredRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      allOrders,
      revenueByStatus,
      totalRevenue,
      deliveredRevenue,
      message: 'Test des revenus terminé'
    });
    
  } catch (error) {
    console.error('❌ [TEST REVENUE] Erreur:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erreur test revenus', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
