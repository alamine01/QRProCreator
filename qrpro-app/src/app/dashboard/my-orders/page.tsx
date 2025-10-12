'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, cancelOrder } from '@/lib/firebase';
import { Order } from '@/types';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  AlertTriangle,
  User
} from 'lucide-react';

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setLoadingOrders(true);
      const userOrders = await getUserOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancellationReason.trim()) return;

    try {
      setCancellingOrderId(selectedOrder.id);
      await cancelOrder(selectedOrder.id, cancellationReason);
      
      // Recharger les commandes
      await loadOrders();
      
      // Fermer les modales
      setShowCancelModal(false);
      setSelectedOrder(null);
      setCancellationReason('');
      
      alert('Commande annulée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur lors de l\'annulation de la commande');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processing':
        return 'En cours';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return 'Inconnu';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canModifyOrder = (order: Order) => {
    return order.status === 'pending';
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes commandes</h1>
              <p className="text-gray-600">Suivez l'état de vos commandes</p>
            </div>
          </div>
        </div>

        {/* Liste des commandes */}
        {orders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-8 border border-white/20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune commande</h3>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore passé de commande.</p>
            <button
              onClick={() => router.push('/dashboard/order-products')}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200"
            >
              Commander maintenant
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 overflow-hidden">
                {/* Header de la commande */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Commande {order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">Créée le {formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                      <span className="text-xl font-bold text-primary-600">{order.totalAmount.toLocaleString()} {order.currency}</span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-500 hover:text-primary-600 transition-colors duration-200"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails de la commande */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Produits */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Produits commandés</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                            </div>
                            <span className="font-semibold text-gray-900">{item.totalPrice.toLocaleString()} FCFA</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Informations de livraison */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Informations de livraison</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{order.customerInfo.firstName} {order.customerInfo.lastName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{order.customerInfo.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{order.customerInfo.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{order.customerInfo.address}, {order.customerInfo.city}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span>
                            {order.paymentInfo.method === 'mobile_money' 
                              ? `Mobile Money (${order.paymentInfo.provider})` 
                              : 'Paiement à la livraison'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {canModifyOrder(order) && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Modifier</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowCancelModal(true);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Annuler</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {order.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de détails de commande */}
        {selectedOrder && !showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Détails de la commande {selectedOrder.orderNumber}</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Statut */}
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedOrder.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Créée le {formatDate(selectedOrder.createdAt)}
                  </span>
                </div>

                {/* Produits détaillés */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Produits</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">{item.unitPrice.toLocaleString()} FCFA × {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-gray-900">{item.totalPrice.toLocaleString()} FCFA</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-primary-600">{selectedOrder.totalAmount.toLocaleString()} {selectedOrder.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Informations client */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Informations client</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Nom complet</p>
                      <p className="text-gray-900">{selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Email</p>
                      <p className="text-gray-900">{selectedOrder.customerInfo.email}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Téléphone</p>
                      <p className="text-gray-900">{selectedOrder.customerInfo.phone}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Ville</p>
                      <p className="text-gray-900">{selectedOrder.customerInfo.city}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="font-medium text-gray-700">Adresse</p>
                      <p className="text-gray-900">{selectedOrder.customerInfo.address}</p>
                    </div>
                  </div>
                </div>

                {/* Paiement */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Paiement</h3>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">Méthode</p>
                    <p className="text-gray-900">
                      {selectedOrder.paymentInfo.method === 'mobile_money' 
                        ? `Mobile Money (${selectedOrder.paymentInfo.provider})` 
                        : 'Paiement à la livraison'
                      }
                    </p>
                    {selectedOrder.paymentInfo.phoneNumber && (
                      <>
                        <p className="font-medium text-gray-700 mt-2">Numéro de téléphone</p>
                        <p className="text-gray-900">{selectedOrder.paymentInfo.phoneNumber}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal d'annulation */}
        {showCancelModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Annuler la commande</h2>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Êtes-vous sûr de vouloir annuler la commande <span className="font-semibold">{selectedOrder.orderNumber}</span> ?
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison de l'annulation *
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Expliquez pourquoi vous annulez cette commande..."
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancellationReason('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={!cancellationReason.trim() || cancellingOrderId === selectedOrder.id}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancellingOrderId === selectedOrder.id ? 'Annulation...' : 'Confirmer l\'annulation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
