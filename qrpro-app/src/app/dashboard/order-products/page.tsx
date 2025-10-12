'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PRODUCTS, createOrder } from '@/lib/firebase';
import { Product, OrderItem, CustomerInfo, PaymentInfo } from '@/types';
import { 
  ShoppingCart, 
  CreditCard, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  ArrowLeft,
  Check,
  AlertCircle,
  Package,
  Truck,
  Home
} from 'lucide-react';

export default function OrderProductsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'mobile_money',
    provider: 'orange_money',
    phoneNumber: '',
    status: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Pré-remplir les informations avec les données de l'utilisateur
  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.location || ''
      }));
    }
  }, [user]);

  const handleProductSelect = (product: Product) => {
    setSelectedProducts(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id);
      
      if (existingIndex >= 0) {
        // Si le produit existe déjà, l'augmenter de 1
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
          totalPrice: (updated[existingIndex].quantity + 1) * product.price
        };
        return updated;
      } else {
        // Ajouter un nouveau produit
        return [...prev, {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price
        }];
      }
    });
  };

  const handleProductRemove = (productId: string) => {
    setSelectedProducts(prev => prev.filter(item => item.productId !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleProductRemove(productId);
      return;
    }

    setSelectedProducts(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    ));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || selectedProducts.length === 0) return;

    setIsSubmitting(true);
    
    try {
      const orderId = await createOrder(
        user.id,
        selectedProducts,
        customerInfo,
        paymentInfo,
        customerInfo.notes
      );
      
      setOrderNumber(`QR${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
      setShowSuccess(true);
      
      // Rediriger vers la page de suivi après 3 secondes
      setTimeout(() => {
        router.push('/dashboard/my-orders');
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      alert('Une erreur est survenue lors de la création de votre commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Commande confirmée !</h1>
          <p className="text-gray-600 mb-6">
            Votre commande <span className="font-semibold text-primary-600">{orderNumber}</span> a été créée avec succès.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Vous allez être redirigé vers la page de suivi de vos commandes...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    );
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
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Commander nos produits</h1>
              <p className="text-gray-600">Choisissez vos produits physiques QR Pro</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sélection des produits */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary-500" />
              <span>Nos produits</span>
            </h2>
            
            <div className="space-y-4">
              {PRODUCTS.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary-600">{product.price.toLocaleString()} {product.currency}</span>
                        {product.id === 'complete-pack' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Économisez 1,500 FCFA
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleProductSelect(product)}
                      className="ml-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 text-sm font-medium"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Panier */}
            {selectedProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Votre panier</h3>
                <div className="space-y-3">
                  {selectedProducts.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">{item.unitPrice.toLocaleString()} FCFA × {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleProductRemove(item.productId)}
                          className="ml-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-primary-600">{calculateTotal().toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Formulaire de commande */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <User className="h-5 w-5 text-primary-500" />
              <span>Informations de livraison</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète *</label>
                <textarea
                  required
                  rows={3}
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Rue, quartier, ville..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
                <input
                  type="text"
                  required
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Méthode de paiement *</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="mobile_money"
                      name="payment_method"
                      value="mobile_money"
                      checked={paymentInfo.method === 'mobile_money'}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value as 'mobile_money' }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="mobile_money" className="text-sm font-medium text-gray-700">
                      Mobile Money
                    </label>
                  </div>
                  
                  {paymentInfo.method === 'mobile_money' && (
                    <div className="ml-7 space-y-3">
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="orange_money"
                            name="provider"
                            value="orange_money"
                            checked={paymentInfo.provider === 'orange_money'}
                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, provider: e.target.value as 'orange_money' }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <label htmlFor="orange_money" className="text-sm text-gray-700">Orange Money</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="wave"
                            name="provider"
                            value="wave"
                            checked={paymentInfo.provider === 'wave'}
                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, provider: e.target.value as 'wave' }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <label htmlFor="wave" className="text-sm text-gray-700">Wave</label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
                        <input
                          type="tel"
                          value={paymentInfo.phoneNumber || ''}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="77 123 45 67"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cash_on_delivery"
                      name="payment_method"
                      value="cash_on_delivery"
                      checked={paymentInfo.method === 'cash_on_delivery'}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value as 'cash_on_delivery' }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="cash_on_delivery" className="text-sm font-medium text-gray-700">
                      Paiement à la livraison
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
                <textarea
                  rows={3}
                  value={customerInfo.notes || ''}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Instructions spéciales pour la livraison..."
                />
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={selectedProducts.length === 0 || isSubmitting}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Création de la commande...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Confirmer la commande ({calculateTotal().toLocaleString()} FCFA)</span>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
