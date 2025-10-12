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
  Home,
  Smartphone,
  Sticker,
  Gift,
  Plus,
  Minus,
  ExternalLink
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
    method: 'wave_direct',
    provider: 'wave',
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

  const getProductIcon = (productId: string) => {
    switch (productId) {
      case 'nfc-card':
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <rect x="3" y="4" width="18" height="12" rx="2" ry="2"/>
                <line x1="7" y1="8" x2="17" y2="8"/>
                <line x1="7" y1="12" x2="17" y2="12"/>
                <circle cx="12" cy="16" r="2"/>
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        );
      case 'qr-stickers':
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="10" y="10" width="4" height="4"/>
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
        );
      case 'complete-pack':
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                <path d="M12 11l4-4m-4 4l-4-4m4 4v6"/>
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-purple-600 text-xs font-bold">%</span>
            </div>
          </div>
        );
      default:
        return <Package className="h-8 w-8 text-gray-600" />;
    }
  };

  const getProductAdvantages = (productId: string) => {
    switch (productId) {
      case 'nfc-card':
        return [
          { icon: '🚚', text: 'Livraison gratuite à Dakar & Thiès' },
          { icon: '💧', text: 'Résistant à l\'eau et aux chocs' },
          { icon: '⚡', text: 'Scan instantané NFC' },
          { icon: '🎨', text: 'Design personnalisable' }
        ];
      case 'qr-stickers':
        return [
          { icon: '🚚', text: 'Livraison gratuite à Dakar & Thiès' },
          { icon: '💧', text: 'Résistant à l\'eau et aux UV' },
          { icon: '📱', text: 'Compatible tous smartphones' },
          { icon: '✨', text: 'Qualité impression HD' }
        ];
      case 'complete-pack':
        return [
          { icon: '🚚', text: 'Livraison gratuite à Dakar & Thiès' },
          { icon: '💰', text: 'Économisez 1,500 FCFA' },
          { icon: '🎁', text: 'Pack complet tout-en-un' },
          { icon: '⭐', text: 'Solution professionnelle' }
        ];
      default:
        return [];
    }
  };

  const getProductColor = (productId: string) => {
    switch (productId) {
      case 'nfc-card':
        return 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:border-blue-300';
      case 'qr-stickers':
        return 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 hover:border-green-300';
      case 'complete-pack':
        return 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-100 hover:border-purple-300';
      default:
        return 'border-gray-200 bg-gray-50 hover:border-gray-300';
    }
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Sélection des produits */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary-500" />
              <span>Nos produits</span>
            </h2>
            
            {/* Grille de produits ultra-moderne */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {PRODUCTS.map((product) => (
                <div key={product.id} className={`group relative ${getProductColor(product.id)} rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 transform hover:-translate-y-2 hover:scale-105`}>
                  {/* Header avec icône et badge */}
                  <div className="relative p-6 sm:p-8">
                    {/* Badge de réduction */}
                    {product.id === 'complete-pack' && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                        -1,500 FCFA
                      </div>
                    )}
                    
                    {/* Icône principale */}
                    <div className="flex justify-center mb-6">
                      {getProductIcon(product.id)}
                    </div>
                    
                    {/* Titre et description */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                    
                    {/* Avantages */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">✨ Avantages inclus</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {getProductAdvantages(product.id).map((advantage, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                            <span className="text-base">{advantage.icon}</span>
                            <span>{advantage.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Prix */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-3xl sm:text-4xl font-bold text-primary-600">
                          {product.price.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-gray-500">{product.currency}</span>
                      </div>
                      
                      {product.id === 'complete-pack' && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-sm text-gray-400 line-through">23,000 FCFA</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            Économie de 6.5%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Bouton d'ajout */}
                    <button
                      onClick={() => handleProductSelect(product)}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center space-x-3 text-sm sm:text-base group-hover:scale-105"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Ajouter au panier</span>
                    </button>
                  </div>
                  
                  {/* Effet de survol avec particules */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  {/* Bordure animée */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/20 to-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              ))}
            </div>

            {/* Panier moderne */}
            {selectedProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-4 sm:p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-primary-600" />
                    <span>Votre panier ({selectedProducts.length} article{selectedProducts.length > 1 ? 's' : ''})</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedProducts.map((item) => (
                      <div key={item.productId} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                              {getProductIcon(item.productId)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.productName}</p>
                              <p className="text-xs sm:text-sm text-gray-600">{item.unitPrice.toLocaleString()} FCFA × {item.quantity}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* Contrôles de quantité */}
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                              >
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              <span className="w-6 sm:w-8 text-center font-semibold text-gray-900 text-sm sm:text-base">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                              >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                            
                            {/* Prix total */}
                            <span className="font-bold text-primary-600 text-sm sm:text-base min-w-[60px] sm:min-w-[80px] text-right">
                              {item.totalPrice.toLocaleString()} FCFA
                            </span>
                            
                            {/* Bouton supprimer */}
                            <button
                              onClick={() => handleProductRemove(item.productId)}
                              className="p-1 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <AlertCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total */}
                  <div className="mt-4 pt-4 border-t border-primary-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-xl sm:text-2xl font-bold text-primary-600">{calculateTotal().toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Formulaire de commande */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-4 sm:p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <User className="h-5 w-5 text-primary-500" />
              <span>Informations de livraison</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-4">Méthode de paiement *</label>
                <div className="space-y-4">
                  
                  {/* Paiement Wave Direct */}
                  <div className="border-2 border-green-200 bg-green-50 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="radio"
                        id="wave_direct"
                        name="payment_method"
                        value="wave_direct"
                        checked={paymentInfo.method === 'wave_direct'}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value as 'wave_direct' }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300"
                      />
                      <label htmlFor="wave_direct" className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">W</span>
                        </div>
                        <span>Paiement Wave Direct (Recommandé)</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600 ml-7 mb-3">
                      Payez directement via Wave avec votre téléphone. Rapide et sécurisé.
                    </p>
                    {paymentInfo.method === 'wave_direct' && (
                      <div className="ml-7">
                        <a
                          href="https://pay.wave.com/m/M_sn_gV5Fky3h1d5y/c/sn/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ouvrir Wave pour payer
                        </a>
                        <p className="text-xs text-gray-500 mt-2">
                          Montant à payer: <span className="font-semibold">{calculateTotal().toLocaleString()} FCFA</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Orange Money */}
                  <div className="border border-orange-200 bg-orange-50 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="radio"
                        id="orange_money"
                        name="payment_method"
                        value="orange_money"
                        checked={paymentInfo.method === 'orange_money'}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value as 'orange_money' }))}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-orange-300"
                      />
                      <label htmlFor="orange_money" className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                        <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">O</span>
                        </div>
                        <span>Orange Money</span>
                      </label>
                    </div>
                    {paymentInfo.method === 'orange_money' && (
                      <div className="ml-7">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Numéro Orange Money</label>
                          <input
                            type="tel"
                            value={paymentInfo.phoneNumber || ''}
                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="77 123 45 67"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Montant à payer: <span className="font-semibold">{calculateTotal().toLocaleString()} FCFA</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Paiement à la livraison */}
                  <div className="border border-gray-200 bg-gray-50 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="cash_on_delivery"
                        name="payment_method"
                        value="cash_on_delivery"
                        checked={paymentInfo.method === 'cash_on_delivery'}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value as 'cash_on_delivery' }))}
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                      />
                      <label htmlFor="cash_on_delivery" className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-gray-600" />
                        <span>Paiement à la livraison</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600 ml-7 mt-2">
                      Payez en espèces lors de la réception de votre commande.
                    </p>
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
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span className="text-sm sm:text-base">Création de la commande...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Confirmer la commande ({calculateTotal().toLocaleString()} FCFA)</span>
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
