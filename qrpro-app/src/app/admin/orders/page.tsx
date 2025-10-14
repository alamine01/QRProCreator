'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/security/AdminGuard';
import { AdminNavigation } from '@/components/layout/AdminNavigation';
import { 
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTruck,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import ResponsiveTable from '@/components/ui/ResponsiveTable';
import ResponsiveModal from '@/components/ui/ResponsiveModal';
import { AdminPageLoader } from '@/components/ui/LoadingSpinner';
import { Order } from '@/types';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

export default function OrdersManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Note: La sécurité est gérée par AdminGuard
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    cancellationReason: ''
  });

  // États locaux pour les commandes
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Fonction pour charger les commandes
  const fetchOrders = async () => {
    try {
      console.log('🚀 [ADMIN UI] Début du chargement des commandes');
      setOrdersLoading(true);
      const response = await fetch('/api/admin/orders');
      console.log('🚀 [ADMIN UI] Réponse API:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🚀 [ADMIN UI] Commandes chargées:', data.length, 'commandes');
        setOrders(data);
      } else {
        console.error('❌ [ADMIN UI] Erreur lors du chargement des commandes:', response.status);
      }
    } catch (error) {
      console.error('❌ [ADMIN UI] Erreur lors du chargement des commandes:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 [ADMIN UI] Chargement des commandes');
    fetchOrders();
  }, []);

  // Utiliser useMemo pour optimiser le filtrage
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered;
  }, [orders, searchTerm, statusFilter]);

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !statusUpdate.status) return;

    try {
      console.log('🚀 [ADMIN UI] Début de la mise à jour de statut:', {
        orderId: selectedOrder.id,
        newStatus: statusUpdate.status,
        customerEmail: selectedOrder.customerInfo.email
      });
      
      setIsUpdating(true);
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedOrder.id,
          status: statusUpdate.status,
          cancellationReason: statusUpdate.cancellationReason
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Vérifier si l'email a été envoyé côté serveur
        if (!result.emailSent) {
          console.log('📧 Email non envoyé côté serveur, tentative côté client...');
          
          // Fallback intelligent : envoyer côté client seulement si nécessaire
          try {
            await sendOrderStatusUpdateEmail(
              selectedOrder.customerInfo.email,
              selectedOrder.orderNumber,
              statusUpdate.status as any,
              `${selectedOrder.customerInfo.firstName} ${selectedOrder.customerInfo.lastName}`
            );
            console.log('✅ Email de changement de statut envoyé côté client (fallback)');
          } catch (emailErr) {
            console.warn('⚠️ Impossible d\'envoyer l\'email côté client:', emailErr);
            // Optionnel : afficher une notification à l'admin
            alert('⚠️ Le statut a été mis à jour mais l\'email n\'a pas pu être envoyé au client. Veuillez le contacter manuellement.');
          }
        } else {
          console.log('✅ Email envoyé avec succès côté serveur');
        }

        // Recharger les commandes pour voir les changements
        await fetchOrders();
        
        setShowModal(false);
        setSelectedOrder(null);
        setStatusUpdate({ status: '', cancellationReason: '' });
        
        // Message de confirmation adapté
        const message = result.emailSent 
          ? 'Statut de la commande mis à jour avec succès ! Email envoyé au client.'
          : 'Statut de la commande mis à jour avec succès !';
        alert(message);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Erreur lors de la mise à jour du statut: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'processing':
        return <FaTruck className="text-blue-500" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En Attente';
      case 'processing':
        return 'En Cours';
      case 'delivered':
        return 'Livré';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      let date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
      } else if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        console.warn('Format de timestamp non reconnu:', timestamp);
        return 'Date invalide';
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Date invalide générée:', date, 'depuis:', timestamp);
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error, 'timestamp:', timestamp);
      return 'Erreur de date';
    }
  };

  const isLoading = loading || ordersLoading;

  return (
    <AdminGuard>
      {/* Affichage de chargement */}
      {ordersLoading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AdminPageLoader />
            <p className="mt-4 text-gray-600">Chargement des commandes...</p>
          </div>
        </div>
      ) : (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AdminNavigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestion des Commandes
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Suivez et gérez toutes les commandes clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou numéro de commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F15A22] focus:border-transparent appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En Attente</option>
                <option value="processing">En Cours</option>
                <option value="delivered">Livré</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <ResponsiveTable
          data={filteredOrders}
          loading={isLoading}
          emptyMessage={searchTerm || statusFilter !== 'all' 
            ? 'Aucune commande trouvée avec ces filtres'
            : 'Aucune commande disponible'
          }
          columns={[
            {
              key: 'orderNumber',
              label: 'Commande',
              render: (order: any) => (
                <div className="flex items-center min-w-0">
                  <div className="flex-shrink-0 mr-3">
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      #{order.orderNumber}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {order.items.length} article(s)
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: 'customer',
              label: 'Client',
              render: (order: any) => (
                <div className="flex items-center min-w-0">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <FaUser className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </div>
                    <div className="text-sm text-gray-500 truncate" title={order.customerInfo.email}>
                      {order.customerInfo.email}
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: 'items',
              label: 'Produits',
              mobileHidden: true,
              render: (order: any) => (
                <div className="text-sm text-gray-900">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="mb-1">
                      {item.productName} (x{item.quantity})
                    </div>
                  ))}
                </div>
              )
            },
            {
              key: 'totalAmount',
              label: 'Montant',
              render: (order: any) => (
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {order.totalAmount.toLocaleString()} {order.currency}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {order.paymentInfo.method}
                  </div>
                </div>
              )
            },
            {
              key: 'status',
              label: 'Statut',
              render: (order: any) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              )
            },
            {
              key: 'createdAt',
              label: 'Date',
              render: (order: any) => (
                <span className="text-sm text-gray-500 truncate">
                  {formatDate(order.createdAt)}
                </span>
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (order: any) => (
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setStatusUpdate({ status: order.status, cancellationReason: '' });
                      setShowModal(true);
                    }}
                    className="text-[#F15A22] hover:text-[#F15A22]/80 p-1 sm:p-2 flex-shrink-0"
                    title="Modifier le statut"
                  >
                    <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1 sm:p-2 flex-shrink-0"
                    title="Voir les détails"
                  >
                    <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )
            }
          ]}
        />
      </div>

      {/* Modal */}
      <ResponsiveModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedOrder(null);
          setStatusUpdate({ status: '', cancellationReason: '' });
        }}
        title={`Commande #${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <>
            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Client</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FaUser className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedOrder.customerInfo.email}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedOrder.customerInfo.phone}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedOrder.customerInfo.address}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de la Commande</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Statut:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Montant:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedOrder.totalAmount.toLocaleString()} {selectedOrder.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Paiement:</span>
                    <span className="text-sm text-gray-900">
                      {selectedOrder.paymentInfo.method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Produits Commandés</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{item.productName}</span>
                      <span className="text-sm text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {item.totalPrice.toLocaleString()} {selectedOrder.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mettre à jour le Statut</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau Statut
                  </label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                  >
                    <option value="pending">En Attente</option>
                    <option value="processing">En Cours</option>
                    <option value="delivered">Livré</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                {statusUpdate.status === 'cancelled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison d'annulation
                    </label>
                    <input
                      type="text"
                      value={statusUpdate.cancellationReason}
                      onChange={(e) => setStatusUpdate(prev => ({ ...prev, cancellationReason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
                      placeholder="Raison de l'annulation..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedOrder(null);
                  setStatusUpdate({ status: '', cancellationReason: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className={`flex items-center justify-center px-6 py-2 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 text-white rounded-lg hover:opacity-90 transition-opacity ${
                  isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaSave className="mr-2" />
                {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </>
        )}
      </ResponsiveModal>
      </div>
      )}
    </AdminGuard>
  );
}
