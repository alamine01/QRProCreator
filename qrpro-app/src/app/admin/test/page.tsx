'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminTestPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🧪 [TEST ADMIN] Page de test chargée');
    console.log('🧪 [TEST ADMIN] Utilisateur:', {
      user: user ? {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      } : null,
      loading
    });
  }, [user, loading]);

  const fetchOrders = async () => {
    try {
      console.log('🧪 [TEST ADMIN] Chargement des commandes...');
      setIsLoading(true);
      const response = await fetch('/api/admin/orders');
      console.log('🧪 [TEST ADMIN] Réponse API:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🧪 [TEST ADMIN] Commandes chargées:', data.length, 'commandes');
        setOrders(data);
      } else {
        console.error('❌ [TEST ADMIN] Erreur API:', response.status);
      }
    } catch (error) {
      console.error('❌ [TEST ADMIN] Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testStatusUpdate = async (orderId: string) => {
    try {
      console.log('🧪 [TEST ADMIN] Test de mise à jour de statut:', orderId);
      
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: orderId,
          status: 'processing'
        })
      });

      console.log('🧪 [TEST ADMIN] Réponse mise à jour:', response.status, response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🧪 [TEST ADMIN] Résultat:', result);
      } else {
        const error = await response.json();
        console.error('❌ [TEST ADMIN] Erreur:', error);
      }
    } catch (error) {
      console.error('❌ [TEST ADMIN] Erreur mise à jour:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!user) {
    return <div className="p-8">Non connecté</div>;
  }

  if (!user.isAdmin) {
    return <div className="p-8">Pas de droits admin</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Admin</h1>
      
      <div className="mb-4">
        <button
          onClick={fetchOrders}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Charger les commandes
        </button>
      </div>

      {isLoading ? (
        <div>Chargement des commandes...</div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Commandes ({orders.length})
          </h2>
          
          {orders.map((order) => (
            <div key={order.id} className="border p-4 mb-2 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <strong>Commande #{order.orderNumber}</strong>
                  <br />
                  <span className="text-sm text-gray-600">
                    {order.customerInfo.firstName} {order.customerInfo.lastName}
                  </span>
                  <br />
                  <span className="text-sm text-gray-600">
                    {order.customerInfo.email}
                  </span>
                  <br />
                  <span className="text-sm">
                    Statut: <strong>{order.status}</strong>
                  </span>
                </div>
                <button
                  onClick={() => testStatusUpdate(order.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                >
                  Tester mise à jour
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
