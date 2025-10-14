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
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

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

  const showProductAddedNotification = (productName: string) => {
    setNotificationMessage(`${productName} ajouté au panier`);
    setShowNotification(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleProductSelect = (product: Product) => {
    // Show notification
    showProductAddedNotification(product.name);
    
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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.878 19.1c-2.861-.25-5.385-1.312-7.03-2.954-.936-.936-1.504-1.952-1.76-3.149-.118-.544-.117-1.448 0-1.997.357-1.664 1.433-3.12 3.126-4.23 3.862-2.533 9.778-2.52 13.604.03.508.338.836.607 1.296 1.06.58.573.988 1.142 1.418 1.98.016.03.095.07.176.086.27.056.633.268.924.54.226.21.401.44.832 1.093.435.658 2.404 3.697 2.524 3.896.046.078-.046.202-.15.202-.073 0-.126-.05-.234-.22l-1.116-1.732c-1.9-2.942-2.003-3.078-2.532-3.343l-.278-.14h-.817c-.816 0-.817.001-.837.087-.108.47-.128.586-.104.608.015.014.478.278 1.03.586l1.002.562-.062.131c-.035.072-.074.132-.088.132-.014 0-.858-.468-1.875-1.039-1.018-.57-1.91-1.054-1.982-1.074-.29-.08-.734.24-.734.529 0 .292.087.378 1.874 1.841 1.115.914 1.753 1.462 1.85 1.592.178.236.357.584.523 1.012.29.754.763 1.174 1.538 1.368l.255.064-.021.14a.667.667 0 01-.037.157c-.033.037-.547-.127-.844-.27-.465-.223-.785-.541-1.099-1.094a5.565 5.565 0 00-.405.139c-.391.142-.41.154-.78.515-1.576 1.538-3.836 2.521-6.566 2.855-.443.055-2.15.079-2.621.037zm2.717-.473c1.252-.166 2.223-.414 3.24-.83 1.067-.437 2.073-1.065 2.777-1.733l.277-.264-.698-.333c-.746-.357-.82-.416-.915-.735-.06-.2.008-.415.198-.621l.149-.161-.324-.246c-.256-.195-.336-.28-.386-.41a.65.65 0 01.079-.616l.098-.138-1.023-.18a26.154 26.154 0 01-1.166-.222c-.153-.046-.31-.22-.35-.391-.022-.092.48-2.54.592-2.89a.67.67 0 01.426-.376c.169-.031 3.185.499 3.335.587.238.138.313.362.238.705l-.032.144h.167c.092 0 .31-.012.483-.025l.316-.025-.157-.29c-.474-.882-1.33-1.768-2.388-2.472-.494-.328-1.547-.847-2.181-1.074a13.51 13.51 0 00-3.043-.674c-.575-.06-2.082-.06-2.64.001-1.339.146-2.554.449-3.617.902C2.59 7.309.935 9.046.512 11.027c-.11.517-.12 1.423-.018 1.894.224 1.04.713 1.941 1.509 2.78 1.62 1.707 4.097 2.756 7.066 2.994.397.031 2.121-.015 2.526-.068zm-.543-1.864c-.153-.044-.308-.227-.34-.4-.022-.114.004-.192.166-.506.656-1.27.941-2.437.941-3.855 0-1.37-.252-2.435-.879-3.713-.135-.274-.245-.529-.245-.565 0-.136.114-.333.237-.41.169-.107.452-.087.588.04.052.05.187.271.3.494.449.88.756 1.847.908 2.853.094.623.113 1.803.038 2.373a9.33 9.33 0 01-.86 2.909c-.27.555-.438.784-.58.784a.418.418 0 00-.101.015.421.421 0 01-.173-.019zm-1.826-.955c-.234-.069-.404-.357-.336-.573.017-.052.127-.293.246-.535.502-1.024.711-2.123.609-3.201-.084-.886-.243-1.445-.643-2.263-.269-.549-.281-.634-.125-.854.148-.21.519-.245.713-.066.135.124.555 1 .716 1.496a7.106 7.106 0 01-.232 5.016c-.352.826-.599 1.081-.948.98zm-1.882-.969a.57.57 0 01-.304-.374c-.021-.094.014-.198.187-.547.632-1.28.639-2.514.02-3.765-.271-.55-.277-.659-.047-.876.113-.107.161-.126.32-.126.267 0 .406.135.644.625.367.754.518 1.408.516 2.246 0 .86-.141 1.452-.533 2.247-.225.455-.336.575-.56.606a.525.525 0 01-.243-.036zm-1.757-.902a.592.592 0 01-.286-.34c-.043-.152-.008-.273.165-.557.222-.365.274-.56.274-1.038 0-.477-.052-.673-.274-1.038a2.046 2.046 0 01-.168-.329c-.071-.24.129-.535.398-.586.228-.043.385.06.595.387a2.96 2.96 0 010 3.155c-.215.332-.454.45-.704.346zm13.09 1.473c.203-.073.379-.141.39-.153.012-.011-.027-.141-.087-.289-.122-.302-.102-.295-.534-.212-.468.09-.739.01-1.25-.366-.14-.103-.283-.187-.32-.187-.036 0-.115.053-.177.119-.13.14-.15.36-.044.49.093.113 1.377.724 1.53.727.067.002.289-.056.492-.129zm-.202-.983c.19-.038.211-.051.178-.112-.036-.068-1.812-1.542-1.966-1.632-.127-.074-.23-.057-.335.056-.309.33-.273.4.526 1.013.964.738 1.066.782 1.597.675zm-2.384-2.231c0-.01-.201-.183-.448-.385-.608-.501-.738-.688-.738-1.058 0-.31.206-.608.538-.78a.966.966 0 01.625-.057c.118.038.648.325 1.383.748l.155.09.128-.606c.13-.62.133-.782.012-.82-.037-.011-.746-.14-1.575-.286-1.473-.26-1.634-.275-1.702-.164-.037.06-.597 2.656-.597 2.767 0 .055.028.124.062.152.034.029.512.132 1.062.23 1.062.191 1.095.196 1.095.17Z"/>
              </svg>
            </div>
          </div>
        );
      case 'qr-stickers':
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 36 36">
                <path d="M5.6,4A1.6,1.6,0,0,0,4,5.6V12h8V4ZM10,10H6V6h4Z"/>
                <path d="M4,30.4A1.6,1.6,0,0,0,5.6,32H12V24H4ZM6,26h4v4H6Z"/>
                <path d="M24,32h6.4A1.6,1.6,0,0,0,32,30.4V24H24Zm2-6h4v4H26Z"/>
                <path d="M30.4,4H24v8h8V5.6A1.6,1.6,0,0,0,30.4,4ZM30,10H26V6h4Z"/>
                <polygon points="20 10 20 8 16 8 16 12 18 12 18 10 20 10"/>
                <rect x="12" y="12" width="2" height="2"/>
                <rect x="14" y="14" width="4" height="2"/>
                <polygon points="20 6 20 8 22 8 22 4 14 4 14 8 16 8 16 6 20 6"/>
                <rect x="4" y="14" width="2" height="4"/>
                <polygon points="12 16 12 18 10 18 10 14 8 14 8 18 6 18 6 20 4 20 4 22 8 22 8 20 10 20 10 22 12 22 12 20 14 20 14 16 12 16"/>
                <polygon points="20 16 22 16 22 18 24 18 24 16 26 16 26 14 22 14 22 10 20 10 20 12 18 12 18 14 20 14 20 16"/>
                <polygon points="18 30 14 30 14 32 22 32 22 30 20 30 20 28 18 28 18 30"/>
                <polygon points="22 20 22 18 20 18 20 16 18 16 18 18 16 18 16 20 18 20 18 22 20 22 20 20 22 20"/>
                <rect x="30" y="20" width="2" height="2"/>
                <rect x="22" y="20" width="6" height="2"/>
                <polygon points="30 14 28 14 28 16 26 16 26 18 28 18 28 20 30 20 30 18 32 18 32 16 30 16 30 14"/>
                <rect x="20" y="22" width="2" height="6"/>
                <polygon points="14 28 16 28 16 26 18 26 18 24 16 24 16 20 14 20 14 28"/>
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
          'Livraison gratuite à Dakar & Thiès',
          'Résistant à l\'eau et aux chocs',
          'Scan instantané NFC',
          'Design personnalisable'
        ];
      case 'qr-stickers':
        return [
          'Livraison gratuite à Dakar & Thiès',
          'Résistant à l\'eau et aux UV',
          'Compatible tous smartphones',
          'Qualité impression HD'
        ];
      case 'complete-pack':
        return [
          'Livraison gratuite à Dakar & Thiès',
          'Économisez 1,500 FCFA',
          'Pack complet tout-en-un',
          'Solution professionnelle'
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
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
          <Check className="h-5 w-5" />
          <span className="font-medium">{notificationMessage}</span>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-3 sm:mb-4 touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Retour</span>
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-lg sm:rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Commander nos produits</h1>
              <p className="text-sm sm:text-base text-gray-600">Choisissez vos produits physiques QR Pro</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Sélection des produits */}
          <div className="xl:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary-500" />
              <span>Nos produits</span>
            </h2>
            
            {/* Grille de produits ultra-moderne */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {PRODUCTS.map((product) => (
                <div key={product.id} className={`group relative ${getProductColor(product.id)} rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-102 sm:hover:scale-105`}>
                  {/* Header avec icône et badge */}
                  <div className="relative p-4 sm:p-6 lg:p-8">
                    {/* Badge de réduction */}
                    {product.id === 'complete-pack' && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 sm:px-3 rounded-full shadow-lg animate-pulse">
                        <span className="hidden sm:inline">-1,500 FCFA</span>
                        <span className="sm:hidden">-1.5K</span>
                      </div>
                    )}
                    
                    {/* Icône principale */}
                    <div className="flex justify-center mb-4 sm:mb-6">
                      <div className="scale-90 sm:scale-100">
                        {getProductIcon(product.id)}
                      </div>
                    </div>
                    
                    {/* Titre et description */}
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-primary-600 transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                    
                    {/* Avantages */}
                    <div className="mb-4 sm:mb-6">
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 lg:gap-6">
                        {getProductAdvantages(product.id).map((advantage, index) => (
                          <div key={index} className="flex items-center space-x-1 sm:space-x-2">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700">{advantage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Prix */}
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-2">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600">
                          {product.price.toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-500">{product.currency}</span>
                      </div>
                      
                      {product.id === 'complete-pack' && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-xs sm:text-sm text-gray-400 line-through">23,000 FCFA</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            <span className="hidden sm:inline">Économie de 6.5%</span>
                            <span className="sm:hidden">-6.5%</span>
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Bouton d'ajout */}
                    <button
                      onClick={() => handleProductSelect(product)}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 sm:space-x-3 text-sm sm:text-base group-hover:scale-105 touch-manipulation"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
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
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
                  <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                    <span className="text-sm sm:text-base">Votre panier ({selectedProducts.length} article{selectedProducts.length > 1 ? 's' : ''})</span>
                  </h3>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {selectedProducts.map((item) => (
                      <div key={item.productId} className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm border border-gray-100">
                        {/* Layout mobile : vertical, desktop : horizontal */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          {/* Section produit (mobile et desktop) */}
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 mb-2 sm:mb-0">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                              <div className="scale-50 sm:scale-75 lg:scale-90">
                                {getProductIcon(item.productId)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base truncate">{item.productName}</p>
                              <p className="text-xs sm:text-sm text-gray-600">{item.unitPrice.toLocaleString()} FCFA × {item.quantity}</p>
                            </div>
                          </div>
                          
                          {/* Section contrôles et prix (mobile et desktop) */}
                          <div className="flex items-center justify-between sm:justify-end sm:space-x-2 lg:space-x-3">
                            {/* Contrôles de quantité */}
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200 touch-manipulation"
                              >
                                <Minus className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                              </button>
                              <span className="w-5 sm:w-6 lg:w-8 text-center font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200 touch-manipulation"
                              >
                                <Plus className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                              </button>
                            </div>
                            
                            {/* Prix total */}
                            <span className="font-bold text-primary-600 text-xs sm:text-sm lg:text-base min-w-[50px] sm:min-w-[60px] lg:min-w-[80px] text-right">
                              {item.totalPrice.toLocaleString()} FCFA
                            </span>
                            
                            {/* Bouton supprimer */}
                            <button
                              onClick={() => handleProductRemove(item.productId)}
                              className="p-1 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 touch-manipulation"
                            >
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary-200">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">{calculateTotal().toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Formulaire de commande */}
          <div className="xl:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6 border border-white/20">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
              <span>Informations de livraison</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Nom *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Adresse complète *</label>
                <textarea
                  required
                  rows={3}
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Rue, quartier, ville..."
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Ville *</label>
                <input
                  type="text"
                  required
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">Méthode de paiement *</label>
                <div className="space-y-3 sm:space-y-4 xl:space-y-3">
                  
                  {/* Paiement Wave Direct */}
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <input
                        type="radio"
                        id="wave_direct"
                        name="payment_method"
                        value="wave_direct"
                        checked={paymentInfo.method === 'wave_direct'}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value as 'wave_direct' }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300"
                      />
                      <label htmlFor="wave_direct" className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center space-x-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">W</span>
                        </div>
                        <span className="hidden sm:inline">Paiement Wave Direct (Recommandé)</span>
                        <span className="sm:hidden">Wave Direct</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600 ml-6 sm:ml-7 mb-2 sm:mb-3">
                      Payez directement via Wave avec votre téléphone. Rapide et sécurisé.
                    </p>
                    {paymentInfo.method === 'wave_direct' && (
                      <div className="ml-6 sm:ml-7">
                        <a
                          href="https://pay.wave.com/m/M_sn_gV5Fky3h1d5y/c/sn/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-xs sm:text-sm font-medium touch-manipulation"
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Ouvrir Wave pour payer</span>
                          <span className="sm:hidden">Payer avec Wave</span>
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
                  <div className="border border-gray-200 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="radio"
                        id="cash_on_delivery"
                        name="payment_method"
                        value="cash_on_delivery"
                        checked={paymentInfo.method === 'cash_on_delivery'}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value as 'cash_on_delivery' }))}
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                      />
                      <label htmlFor="cash_on_delivery" className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center space-x-2">
                        <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        <span>Paiement à la livraison</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600 ml-6 sm:ml-7 mt-1 sm:mt-2">
                      Payez en espèces lors de la réception de votre commande.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Notes (optionnel)</label>
                <textarea
                  rows={3}
                  value={customerInfo.notes || ''}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Instructions spéciales pour la livraison..."
                />
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={selectedProducts.length === 0 || isSubmitting}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span className="text-sm sm:text-base">Création de la commande...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      <span className="hidden sm:inline">Confirmer la commande ({calculateTotal().toLocaleString()} FCFA)</span>
                      <span className="sm:hidden">Commander ({calculateTotal().toLocaleString()} FCFA)</span>
                    </span>
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
