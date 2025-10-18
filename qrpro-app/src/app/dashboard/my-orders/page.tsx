'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, cancelOrder, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
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
  User,
  X
} from 'lucide-react';

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  
  // États pour le formulaire de modification
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    items: [] as any[]
  });

  // États pour la sélection de produits intégrée
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProductInfo, setSelectedProductInfo] = useState<any>(null);
  const [availableProducts] = useState([
    { 
      id: 'nfc-card', 
      name: 'Carte NFC', 
      price: 20000, 
      description: 'Carte NFC personnalisée avec votre QR code',
      details: 'Carte NFC haute qualité avec design personnalisé, compatible avec tous les smartphones modernes. Dimensions : 85.6 x 54 mm. Résistante à l\'eau et aux rayures.',
      features: ['Design personnalisé', 'Compatible tous smartphones', 'Résistante à l\'eau', 'Dimensions standard']
    },
    { 
      id: 'qr-stickers', 
      name: 'Autocollants QR Code', 
      price: 3000, 
      description: 'Pack de 3 autocollants avec votre QR code',
      details: 'Autocollants QR Code haute qualité, résistants aux intempéries et à l\'usure. Parfait pour le marketing et le partage d\'informations. Dimensions personnalisables.',
      features: ['Résistant aux intempéries', 'QR Code personnalisé', 'Dimensions flexibles', 'Adhésion longue durée']
    },
    { 
      id: 'complete-pack', 
      name: 'Pack Complet', 
      price: 21500, 
      description: 'Carte NFC + 3 autocollants QR Code (Économisez 1,500 FCFA)',
      details: 'Pack économique incluant une carte NFC personnalisée, 3 autocollants QR Code, et tous nos services premium. Idéal pour les professionnels.',
      features: ['1 Carte NFC', '3 Autocollants QR Code', 'Services premium', 'Support technique']
    }
  ]);

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

  // Gérer le retour depuis la page de produits
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');
    const orderId = urlParams.get('orderId');
    
    if (returnTo === 'edit' && orderId) {
      // Trouver la commande à modifier
      const orderToEdit = orders.find(order => order.id === orderId);
      if (orderToEdit) {
        handleEditOrder(orderToEdit);
      }
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [orders]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setLoadingOrders(true);
      const userOrders = await getUserOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      // Optionnel: afficher un message d'erreur à l'utilisateur
      setOrders([]);
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
      alert('Erreur lors de l\'annulation de la commande. Veuillez réessayer.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    
    // Nettoyer automatiquement les doublons et corriger les IDs
    const cleanedItems = cleanItems(order.items);
    
    setEditForm({
      firstName: order.customerInfo.firstName,
      lastName: order.customerInfo.lastName,
      email: order.customerInfo.email,
      phone: order.customerInfo.phone,
      address: order.customerInfo.address,
      city: order.customerInfo.city,
      notes: order.notes || '',
      items: cleanedItems
    });
    setShowEditModal(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      setEditingOrderId(selectedOrder.id);
      
      console.log('Début de la modification de la commande:', selectedOrder.id);
      console.log('Données du formulaire:', editForm);
      
      // Calculer le nouveau total
      const newTotalAmount = editForm.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
      console.log('Nouveau total calculé:', newTotalAmount);
      
      // Préparer les données à mettre à jour
      const updateData = {
        customerInfo: {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          city: editForm.city
        },
        items: editForm.items,
        totalAmount: newTotalAmount,
        notes: editForm.notes,
        updatedAt: new Date()
      };
      
      console.log('Données à mettre à jour:', updateData);
      
      // Mettre à jour la commande dans Firebase
      const orderRef = doc(db, 'orders', selectedOrder.id);
      await updateDoc(orderRef, updateData);
      console.log('Commande mise à jour avec succès dans Firebase');
      
      // Recharger les commandes
      console.log('Rechargement des commandes...');
      await loadOrders();
      console.log('Commandes rechargées');
      
      // Fermer la modal
      setShowEditModal(false);
      setSelectedOrder(null);
      
      alert('Commande modifiée avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error);
      console.error('Détails de l\'erreur:', error);
      console.error('Stack trace:', error.stack);
      alert('Erreur lors de la modification de la commande. Veuillez réessayer.');
    } finally {
      setEditingOrderId(null);
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
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return 'Date invalide';
      return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  const formatAmount = (amount: number, currency: string = 'FCFA') => {
    try {
      if (typeof amount !== 'number' || isNaN(amount)) {
        return '0 ' + currency;
      }
      return amount.toLocaleString('fr-FR') + ' ' + currency;
    } catch (error) {
      console.error('Erreur de formatage de montant:', error);
      return '0 ' + currency;
    }
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...editForm.items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity,
      totalPrice: updatedItems[index].unitPrice * newQuantity
    };
    
    setEditForm({ ...editForm, items: updatedItems });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = editForm.items.filter((_, i) => i !== index);
    setEditForm({ ...editForm, items: updatedItems });
  };

  const calculateTotal = () => {
    return editForm.items.reduce((total, item) => total + item.totalPrice, 0);
  };

  // Fonction utilitaire pour nettoyer automatiquement les doublons
  const cleanItems = (items: any[]) => {
    return items.reduce((acc: any[], item: any) => {
      // Corriger les IDs si nécessaire
      let correctedItem = { ...item };
      if (item.productId === 'nfc_card') correctedItem.productId = 'nfc-card';
      if (item.productId === 'qr_sticker') correctedItem.productId = 'qr-stickers';
      if (item.productId === 'complete_pack') correctedItem.productId = 'complete-pack';
      
      // Vérifier si ce produit existe déjà
      const existingIndex = acc.findIndex(existing => existing.productId === correctedItem.productId);
      
      if (existingIndex >= 0) {
        // Fusionner avec l'item existant
        acc[existingIndex].quantity += correctedItem.quantity;
        acc[existingIndex].totalPrice = acc[existingIndex].unitPrice * acc[existingIndex].quantity;
      } else {
        // Ajouter comme nouvel item
        acc.push(correctedItem);
      }
      
      return acc;
    }, []);
  };

  const handleAddProduct = (product: any) => {
    // Afficher les informations du produit avant d'ajouter
    setSelectedProductInfo(product);
  };

  const confirmAddProduct = (product: any) => {
    // Nettoyer automatiquement les doublons existants
    const cleanedItems = cleanItems(editForm.items);
    
    // Maintenant ajouter le nouveau produit
    const existingItem = cleanedItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Augmenter la quantité si le produit existe déjà
      const index = cleanedItems.indexOf(existingItem);
      cleanedItems[index].quantity += 1;
      cleanedItems[index].totalPrice = cleanedItems[index].unitPrice * cleanedItems[index].quantity;
    } else {
      // Ajouter un nouveau produit
      const newItem = {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
        totalPrice: product.price
      };
      cleanedItems.push(newItem);
    }
    
    setEditForm({ ...editForm, items: cleanedItems });
    setSelectedProductInfo(null);
  };

  const handleRemoveProduct = (productId: string) => {
    const updatedItems = editForm.items.filter(item => item.productId !== productId);
    setEditForm({ ...editForm, items: updatedItems });
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
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm sm:text-base">Retour</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes commandes</h1>
                <p className="text-sm sm:text-base text-gray-600">Suivez l'état de vos commandes</p>
              </div>
            </div>
            
            {/* Bouton Commander */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => router.push('/dashboard/order-products')}
                className="flex items-center justify-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 text-sm sm:text-base font-medium"
              >
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Commander</span>
              </button>
            </div>
          </div>
        </div>

        {/* Liste des commandes */}
        {orders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 border border-white/20 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Aucune commande</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Vous n'avez pas encore passé de commande.</p>
            <button
              onClick={() => router.push('/dashboard/order-products')}
              className="bg-primary-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200 text-sm sm:text-base"
            >
              Commander maintenant
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-sm border border-white/20 overflow-hidden">
                {/* Header de la commande */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Commande {order.orderNumber}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Créée le {formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:space-x-2">
                      <span className="text-lg sm:text-xl font-bold text-primary-600">{formatAmount(order.totalAmount, order.currency)}</span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-500 hover:text-primary-600 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails de la commande */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Produits */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Produits commandés</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.productName}</p>
                              <p className="text-xs sm:text-sm text-gray-600">Quantité: {item.quantity}</p>
                            </div>
                            <span className="font-semibold text-gray-900 text-sm sm:text-base ml-2">{formatAmount(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Informations de livraison */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Informations de livraison</h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{order.customerInfo.firstName} {order.customerInfo.lastName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{order.customerInfo.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{order.customerInfo.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{order.customerInfo.address}, {order.customerInfo.city}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {order.paymentInfo.method === 'wave_direct' 
                              ? 'Wave Direct' 
                              : order.paymentInfo.method === 'orange_money'
                              ? 'Orange Money'
                              : 'Paiement à la livraison'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {canModifyOrder(order) && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm sm:text-base"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Modifier</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowCancelModal(true);
                          }}
                          className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm sm:text-base"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Annuler</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {order.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bouton Commander en bas */}
        {orders.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6 border border-white/20 text-center mt-8">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Besoin d'autres produits ?</h3>
                <p className="text-sm text-gray-600">Commandez facilement depuis cette page</p>
              </div>
              <button
                onClick={() => router.push('/dashboard/order-products')}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium"
              >
                <Package className="h-5 w-5" />
                <span>Commander</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal de détails de commande */}
        {selectedOrder && !showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Détails de la commande {selectedOrder.orderNumber}</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Statut */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
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
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Produits</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.productName}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{formatAmount(item.unitPrice)} × {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm sm:text-base ml-2">{formatAmount(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-lg sm:text-xl font-bold text-primary-600">{formatAmount(selectedOrder.totalAmount, selectedOrder.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Informations client */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Informations client</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Nom complet</p>
                      <p className="text-gray-900 truncate">{selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Email</p>
                      <p className="text-gray-900 truncate">{selectedOrder.customerInfo.email}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Téléphone</p>
                      <p className="text-gray-900 truncate">{selectedOrder.customerInfo.phone}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Ville</p>
                      <p className="text-gray-900 truncate">{selectedOrder.customerInfo.city}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="font-medium text-gray-700">Adresse</p>
                      <p className="text-gray-900">{selectedOrder.customerInfo.address}</p>
                    </div>
                  </div>
                </div>

                {/* Paiement */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Paiement</h3>
                  <div className="text-xs sm:text-sm">
                    <p className="font-medium text-gray-700">Méthode</p>
                    <p className="text-gray-900">
                      {selectedOrder.paymentInfo.method === 'wave_direct' 
                        ? 'Wave Direct' 
                        : selectedOrder.paymentInfo.method === 'orange_money'
                        ? 'Orange Money'
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
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Notes</h3>
                    <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal d'annulation */}
        {showCancelModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl max-w-md w-full">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Annuler la commande</h2>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-gray-600 mb-4">
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Expliquez pourquoi vous annulez cette commande..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancellationReason('');
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={!cancellationReason.trim() || cancellingOrderId === selectedOrder.id}
                    className="flex-1 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {cancellingOrderId === selectedOrder.id ? 'Annulation...' : 'Confirmer l\'annulation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de modification */}
        {showEditModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Modifier la commande {selectedOrder.orderNumber}</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedOrder(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse complète *
                    </label>
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      rows={2}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Instructions spéciales pour la livraison..."
                    />
                  </div>
                </div>

                {/* Section des produits - Formulaire intégré */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Produits de la commande</h3>
                    <button
                      onClick={() => setShowProductSelector(!showProductSelector)}
                      className="flex items-center space-x-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 text-sm"
                    >
                      <Package className="h-4 w-4" />
                      <span>{showProductSelector ? 'Masquer' : 'Ajouter'} des produits</span>
                    </button>
                  </div>

                  {/* Sélecteur de produits intégré */}
                  {showProductSelector && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Sélectionner des produits</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableProducts.map((product) => (
                          <div key={product.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-primary-300 transition-colors duration-200">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900 text-sm">{product.name}</h5>
                              <span className="text-primary-600 font-semibold text-sm">{formatAmount(product.price)}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-3">{product.description}</p>
                            <button
                              onClick={() => handleAddProduct(product)}
                              className="w-full px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 text-sm"
                            >
                              Ajouter
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modal d'informations du produit */}
                  {selectedProductInfo && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                          {/* En-tête */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{selectedProductInfo.name}</h3>
                              <p className="text-primary-600 font-semibold text-lg">{formatAmount(selectedProductInfo.price)}</p>
                            </div>
                            <button
                              onClick={() => setSelectedProductInfo(null)}
                              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                              <X className="h-6 w-6" />
                            </button>
                          </div>

                          {/* Description */}
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                            <p className="text-gray-600 text-sm">{selectedProductInfo.description}</p>
                          </div>

                          {/* Détails */}
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Détails</h4>
                            <p className="text-gray-600 text-sm">{selectedProductInfo.details}</p>
                          </div>

                          {/* Caractéristiques */}
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-2">Caractéristiques</h4>
                            <ul className="space-y-1">
                              {selectedProductInfo.features.map((feature: string, index: number) => (
                                <li key={index} className="flex items-center text-sm text-gray-600">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-3">
                            <button
                              onClick={() => setSelectedProductInfo(null)}
                              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => confirmAddProduct(selectedProductInfo)}
                              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                            >
                              Ajouter au panier
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Liste des produits sélectionnés */}
                  {editForm.items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun produit sélectionné</p>
                      <p className="text-sm">Utilisez le bouton "Ajouter des produits" pour commencer</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editForm.items.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base">{item.productName}</h4>
                              <p className="text-xs sm:text-sm text-gray-600">{formatAmount(item.unitPrice)} par unité</p>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {/* Contrôle de quantité */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600"
                                >
                                  -
                                </button>
                                <span className="w-12 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                                >
                                  +
                                </button>
                              </div>
                              
                              {/* Prix total */}
                              <div className="text-right">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatAmount(item.totalPrice)}</p>
                              </div>
                              
                              {/* Bouton supprimer */}
                              <button
                                onClick={() => handleRemoveItem(index)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Supprimer ce produit"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Total */}
                      <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total de la commande:</span>
                          <span className="text-xl font-bold text-primary-600">{formatAmount(calculateTotal(), selectedOrder?.currency || 'FCFA')}</span>
                        </div>
                      </div>
                      
                      {/* Action pour vider */}
                      {editForm.items.length > 0 && (
                        <div className="text-center">
                          <button
                            onClick={() => {
                              if (confirm('Êtes-vous sûr de vouloir vider tous les produits de cette commande ?')) {
                                setEditForm({ ...editForm, items: [] });
                              }
                            }}
                            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm"
                          >
                            <Trash2 className="h-4 w-4 inline mr-2" />
                            Vider tous les produits
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateOrder}
                    disabled={!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim() || !editForm.phone.trim() || !editForm.address.trim() || !editForm.city.trim() || editForm.items.length === 0 || editingOrderId === selectedOrder.id}
                    className="flex-1 px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {editingOrderId === selectedOrder.id ? 'Modification...' : 'Sauvegarder les modifications'}
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
