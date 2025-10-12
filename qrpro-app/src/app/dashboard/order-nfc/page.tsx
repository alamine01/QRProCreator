'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  CreditCard,
  Package,
  MessageCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Users,
  CheckCircle,
  Loader2,
  ShoppingCart,
  Star,
  Gift
} from 'lucide-react';

export default function OrderNFC() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessType: 'individual',
    products: [] as string[],
    purpose: '',
    purposeDetails: '',
    emergencyContact1: '',
    emergencyContact2: '',
    socialMedia1: '',
    socialMedia2: '',
    socialMedia3: '',
    socialMedia4: '',
    source: '',
    sourceDetails: '',
    quantity: '1',
    customMessage: ''
  });
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (user && !loading) {
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        products: checked 
          ? [...prev.products, value]
          : prev.products.filter(p => p !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Créer le message WhatsApp
      const message = `Bonjour ! Je souhaiterais commander des cartes/autocollants NFC avec mon code QR de QR Pro Creator.

📋 **Informations de commande :**
• Nom: ${formData.name}
• Email: ${formData.email}
• Téléphone: ${formData.phone}
• Adresse: ${formData.address}
• Type: ${formData.businessType === 'business' ? 'Entreprise' : 'Particulier'}

🛍️ **Produits souhaités :**
${formData.products.map(product => `• ${getProductName(product)}`).join('\n')}

📦 **Quantité :** ${formData.quantity}

🎯 **Objectif :** ${formData.purpose}
${formData.purposeDetails ? `\n📝 **Détails :** ${formData.purposeDetails}` : ''}

📞 **Contact d'urgence :** ${formData.emergencyContact1}
${formData.emergencyContact2 ? `\n📞 **Contact d'urgence 2 :** ${formData.emergencyContact2}` : ''}

📱 **Réseaux sociaux :**
${formData.socialMedia1 ? `• ${formData.socialMedia1}` : ''}
${formData.socialMedia2 ? `• ${formData.socialMedia2}` : ''}
${formData.socialMedia3 ? `• ${formData.socialMedia3}` : ''}
${formData.socialMedia4 ? `• ${formData.socialMedia4}` : ''}

📢 **Comment avez-vous entendu parler de nous :** ${formData.source}
${formData.sourceDetails ? `\n📝 **Détails :** ${formData.sourceDetails}` : ''}

${formData.customMessage ? `\n💬 **Message personnalisé :** ${formData.customMessage}` : ''}

Merci pour votre commande ! 🚀`;

      // Ouvrir WhatsApp avec le message pré-rempli
      const whatsappUrl = `https://wa.me/221787526236?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Simuler un délai pour l'UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getProductName = (product: string) => {
    const productNames: { [key: string]: string } = {
      'qr_card': 'Carte QR Code',
      'nfc_card': 'Carte NFC',
      'sticker': 'Autocollant QR',
      'nfc_sticker': 'Autocollant NFC',
      'business_card': 'Carte de visite',
      'keychain': 'Porte-clés NFC',
      'bracelet': 'Bracelet NFC',
      'badge': 'Badge NFC'
    };
    return productNames[product] || product;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-8">
            Vous devez être connecté pour passer une commande.
          </p>
          <a
            href="/auth/signin"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Return Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-primary-500 to-primary-600 p-6 rounded-lg">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-10 w-10 text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Commande de Cartes NFC & Autocollants</h1>
            <p className="text-primary-100 mt-2">Obtenez votre QR code imprimé sur des supports physiques</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 rounded-full p-2 mr-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Informations personnelles</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                  Nom complet<span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                  Adresse e-mail<span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                  Numéro de téléphone<span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="address">
                  Adresse
                </label>
                <input 
                  type="text" 
                  id="address" 
                  name="address" 
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Type de client<span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="businessType" 
                      value="business" 
                      checked={formData.businessType === 'business'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Building className="h-4 w-4 ml-2 mr-2 text-gray-500" />
                    <span>J'ai une entreprise</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="businessType" 
                      value="individual" 
                      checked={formData.businessType === 'individual'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Users className="h-4 w-4 ml-2 mr-2 text-gray-500" />
                    <span>Je suis un particulier</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Products */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 rounded-full p-2 mr-4">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Produits souhaités</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-4">
                  Produits d'intérêt<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'qr_card', label: 'Carte QR Code', icon: CreditCard },
                    { value: 'nfc_card', label: 'Carte NFC', icon: CreditCard },
                    { value: 'sticker', label: 'Autocollant QR', icon: Gift },
                    { value: 'nfc_sticker', label: 'Autocollant NFC', icon: Gift },
                    { value: 'business_card', label: 'Carte de visite', icon: CreditCard },
                    { value: 'keychain', label: 'Porte-clés NFC', icon: Gift },
                    { value: 'bracelet', label: 'Bracelet NFC', icon: Gift },
                    { value: 'badge', label: 'Badge NFC', icon: Gift }
                  ].map((product) => {
                    const IconComponent = product.icon;
                    return (
                      <label key={product.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="products" 
                          value={product.value}
                          checked={formData.products.includes(product.value)}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <IconComponent className="h-4 w-4 ml-2 mr-2 text-gray-500" />
                        <span>{product.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="quantity">
                  Quantité<span className="text-red-500">*</span>
                </label>
                <select 
                  id="quantity" 
                  name="quantity" 
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="custom">Quantité personnalisée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Purpose */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 rounded-full p-2 mr-4">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Objectif de la commande</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="purpose">
                  À quoi servira cette commande ?<span className="text-red-500">*</span>
                </label>
                <select 
                  id="purpose" 
                  name="purpose" 
                  value={formData.purpose}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez un objectif</option>
                  <option value="business_cards">Cartes de visite professionnelles</option>
                  <option value="events">Événements et conférences</option>
                  <option value="marketing">Campagne marketing</option>
                  <option value="personal">Usage personnel</option>
                  <option value="gifts">Cadeaux d'entreprise</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="purposeDetails">
                  Détails supplémentaires
                </label>
                <textarea 
                  id="purposeDetails" 
                  name="purposeDetails" 
                  value={formData.purposeDetails}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Donnez plus de détails sur votre projet..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Social */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 rounded-full p-2 mr-4">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Contact et réseaux sociaux</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="emergencyContact1">
                  Contact d'urgence<span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="emergencyContact1" 
                  name="emergencyContact1" 
                  value={formData.emergencyContact1}
                  onChange={handleInputChange}
                  required
                  placeholder="Nom et numéro de téléphone"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="emergencyContact2">
                  Contact d'urgence 2 (optionnel)
                </label>
                <input 
                  type="text" 
                  id="emergencyContact2" 
                  name="emergencyContact2" 
                  value={formData.emergencyContact2}
                  onChange={handleInputChange}
                  placeholder="Nom et numéro de téléphone"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="socialMedia1">
                    Réseau social 1
                  </label>
                  <input 
                    type="text" 
                    id="socialMedia1" 
                    name="socialMedia1" 
                    value={formData.socialMedia1}
                    onChange={handleInputChange}
                    placeholder="ex: LinkedIn, Instagram..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="socialMedia2">
                    Réseau social 2
                  </label>
                  <input 
                    type="text" 
                    id="socialMedia2" 
                    name="socialMedia2" 
                    value={formData.socialMedia2}
                    onChange={handleInputChange}
                    placeholder="ex: Facebook, Twitter..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="socialMedia3">
                    Réseau social 3
                  </label>
                  <input 
                    type="text" 
                    id="socialMedia3" 
                    name="socialMedia3" 
                    value={formData.socialMedia3}
                    onChange={handleInputChange}
                    placeholder="ex: YouTube, TikTok..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="socialMedia4">
                    Réseau social 4
                  </label>
                  <input 
                    type="text" 
                    id="socialMedia4" 
                    name="socialMedia4" 
                    value={formData.socialMedia4}
                    onChange={handleInputChange}
                    placeholder="ex: Snapchat, WhatsApp..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Source */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 rounded-full p-2 mr-4">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Comment nous avez-vous trouvé ?</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="source">
                  Source<span className="text-red-500">*</span>
                </label>
                <select 
                  id="source" 
                  name="source" 
                  value={formData.source}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez une source</option>
                  <option value="google">Recherche Google</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="recommendation">Recommandation</option>
                  <option value="advertisement">Publicité</option>
                  <option value="event">Événement</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="sourceDetails">
                  Détails (optionnel)
                </label>
                <input 
                  type="text" 
                  id="sourceDetails" 
                  name="sourceDetails" 
                  value={formData.sourceDetails}
                  onChange={handleInputChange}
                  placeholder="Précisez si nécessaire..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="customMessage">
                  Message personnalisé
                </label>
                <textarea 
                  id="customMessage" 
                  name="customMessage" 
                  value={formData.customMessage}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Ajoutez un message ou des demandes spéciales..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={submitting || formData.products.length === 0}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all duration-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <MessageCircle className="h-6 w-6 mr-3" />
                  Envoyer la commande via WhatsApp
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Votre commande sera envoyée directement sur WhatsApp pour un traitement rapide
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
