import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, getAllOrders, getAllBusinessCards } from '@/lib/firebase';

// GET /api/admin/stats-real - Statistiques réelles sans cache
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [API ADMIN STATS-REAL] Récupération des statistiques Firebase (sans cache)');
    
    // Récupérer les vraies données Firebase
    const [users, orders, businessCards] = await Promise.all([
      getAllUsers(),
      getAllOrders(),
      getAllBusinessCards()
    ]);
    
    console.log('📊 [API ADMIN STATS-REAL] Données récupérées:', {
      users: users.length,
      orders: orders.length,
      businessCards: businessCards.length
    });
    
    // Calculer les statistiques réelles
    const totalUsers = users.length;
    const totalOrders = orders.length;
    const totalBusinessCards = businessCards.length;
    
    // Compter les commandes par statut
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const processingOrders = orders.filter(order => order.status === 'processing').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    
    // Calculer le revenu total (seulement les commandes livrées)
    const totalRevenue = orders.reduce((sum, order) => {
      if (order.status === 'delivered') {
        let amount = 0;
        if (typeof order.totalAmount === 'number') {
          amount = order.totalAmount;
        } else if (typeof order.totalAmount === 'string') {
          amount = parseFloat(order.totalAmount) || 0;
        }
        console.log(`💰 Commande livrée ${order.id}: ${amount} FCFA`);
        return sum + amount;
      }
      return sum;
    }, 0);
    
    // Calculer la valeur moyenne des commandes livrées
    const averageOrderValue = deliveredOrders > 0 ? Math.round(totalRevenue / deliveredOrders) : 0;
    
    // Calculer les taux de croissance
    const userGrowth = totalUsers > 0 ? Math.round((totalUsers / 10) * 100) : 0;
    const orderGrowth = totalOrders > 0 ? Math.round((totalOrders / 5) * 100) : 0;
    const revenueGrowth = totalRevenue > 0 ? Math.round((totalRevenue / 100000) * 100) : 0;
    
    const realStats = {
      totalUsers,
      totalOrders,
      totalBusinessCards,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue, // Seulement les commandes livrées
      averageOrderValue, // Basé sur les commandes livrées
      userGrowth,
      orderGrowth,
      revenueGrowth,
      source: 'firebase-real',
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ [API ADMIN STATS-REAL] Statistiques calculées:', realStats);
    
    return NextResponse.json(realStats);
    
  } catch (error) {
    console.error('❌ [API ADMIN STATS-REAL] Erreur:', error);
    
    // Fallback vers des statistiques simulées en cas d'erreur
    const fallbackStats = {
      totalUsers: 0,
      totalOrders: 0,
      totalBusinessCards: 0,
      pendingOrders: 0,
      processingOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      userGrowth: 0,
      orderGrowth: 0,
      revenueGrowth: 0,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return NextResponse.json(fallbackStats);
  }
}
