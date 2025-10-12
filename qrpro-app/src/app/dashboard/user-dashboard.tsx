'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { generateQRCode } from '@/lib/qrcode';
import { downloadVCard } from '@/lib/vcard';
import { 
  QrCode, 
  Download, 
  Share2, 
  Edit, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  Copy,
  Check,
  ExternalLink,
  Briefcase,
  MessageSquare,
  Eye,
  UserPlus,
  CreditCard,
  LogOut,
  BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [qrCode, setQrCode] = useState<string>('');
  const [profileUrl, setProfileUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      const url = `${window.location.origin}/pro/${user.profileSlug}`;
      setProfileUrl(url);
      generateQRCode(url).then(setQrCode);
    }
  }, [user]);

  const handleDownloadQR = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `qr-code-${user?.profileSlug}.png`;
      link.click();
    }
  };

  const handleDownloadVCard = () => {
    if (user) {
      downloadVCard(user, user.id);
    }
  };

  const handleCopyProfileUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const handleEditProfile = () => {
    router.push('/dashboard/edit-profile');
  };

  const handleViewPublicProfile = () => {
    window.open(profileUrl, '_blank');
  };

  const handleOrderNFC = () => {
    router.push('/dashboard/order-nfc');
  };

  const handleViewStats = () => {
    router.push('/dashboard/statistics');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
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
            Vous devez être connecté pour accéder au tableau de bord.
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Navigation */}
      <nav className="glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <QrCode className="w-6 h-6 text-primary-500" />
              </div>
              <span className="text-xl font-bold gradient-text">QR Pro Creator</span>
            </div>
                   <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                     <span className="text-gray-700 font-medium">Bienvenue, {user.firstName || 'Utilisateur'} {user.lastName || ''}</span>
              <button 
                onClick={logout}
                className="text-gray-500 hover:text-primary-600 transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-8 mb-8 border border-white/20">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Photo de profil" className="w-20 h-20 rounded-2xl shadow-lg object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || 'U')}
                </span>
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.firstName || 'Utilisateur'} {user.lastName || ''}</h1>
              <p className="text-lg text-gray-600 mb-3">{user.profession || 'Aucune profession définie'}</p>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-xl font-medium hover:bg-primary-200 transition-colors duration-200"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir le profil public
                    </a>
                    <button
                      onClick={handleCopyProfileUrl}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                    >
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? 'Copié !' : 'Copier le lien'}
                    </button>
                  </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-8 border border-white/20">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-2xl font-bold text-gray-900">Votre code QR</h2>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <QrCode className="text-white text-xl" />
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-6 border border-gray-200/50">
                {qrCode ? (
                  <img src={qrCode} alt="Code QR" className="mx-auto w-40 h-40 sm:w-56 sm:h-56 shadow-lg rounded-xl" />
                ) : (
                  <div className="mx-auto w-40 h-40 sm:w-56 sm:h-56 bg-gray-200 rounded-xl flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
                    <div className="space-y-4">
                      <button
                        onClick={handleDownloadQR}
                        className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                      >
                        <Download className="h-5 w-5 mr-3" />
                        Télécharger le code QR
                      </button>
                      <button
                        onClick={handleDownloadVCard}
                        className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                      >
                        <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                        Télécharger la carte de visite
                      </button>
                      <p className="text-sm text-gray-600">Partagez ce code QR pour permettre aux gens d'accéder à votre profil instantanément</p>
                    </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-8 border border-white/20">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                    <h2 className="text-2xl font-bold text-gray-900">Informations du profil</h2>
                    <button 
                      onClick={handleEditProfile}
                      className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-xl font-medium hover:bg-primary-200 transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier le profil
                    </button>
                  </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <p className="text-gray-900 font-medium">{user.firstName || 'Utilisateur'} {user.lastName || ''}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profession</label>
                  <p className="text-gray-900 font-medium">{user.profession || 'Non définie'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <p className="text-gray-900 font-medium">{user.phone || 'Non défini'}</p>
                </div>
              </div>
              
              {user.biography && (
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mt-1">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Biographie</label>
                    <p className="text-gray-900">{user.biography}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            {(user.linkedin || user.whatsapp || user.instagram) && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Réseaux sociaux</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  )}
                  
                  {user.whatsapp && (
                    <a href={user.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200">
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}
                  
                  {user.instagram && (
                    <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors duration-200">
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button 
                    onClick={handleEditProfile}
                    className="group p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl hover:from-primary-100 hover:to-primary-200 transition-all duration-300 border border-primary-200/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <UserPlus className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Modifier le profil</h3>
                        <p className="text-sm text-gray-600">Mettre à jour vos informations</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={handleViewStats}
                    className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 border border-purple-200/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Statistiques</h3>
                        <p className="text-sm text-gray-600">Analyser les scans de votre QR</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={handleViewPublicProfile}
                    className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 border border-blue-200/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Voir le profil</h3>
                        <p className="text-sm text-gray-600">Voir comment les autres vous voient</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadQR}
                    className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:from-green-100 hover:to-green-200 transition-all duration-300 border border-green-200/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Download className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Télécharger QR</h3>
                        <p className="text-sm text-gray-600">Obtenir votre code QR</p>
                      </div>
                    </div>
                  </button>
                </div>
        </div>

        {/* NFC/Sticker Ordering Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl shadow-sm p-8 border border-purple-200/50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Voulez-vous commander votre QR sur une carte NFC ou un autocollant ?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Obtenez votre code QR imprimé sur des cartes NFC ou des autocollants de haute qualité pour un partage facile. Parfait pour les cartes de visite, présentations et événements de réseautage.</p>
                  <button
                    onClick={handleOrderNFC}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
                  >
                    <svg className="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Passer commande via WhatsApp
                  </button>
            <p className="text-sm text-gray-500 mt-4">Contactez-nous ici pour des commandes personnalisées et des tarifs en gros</p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <QrCode className="h-8 w-8 mr-2 text-primary-500" />
              <span className="text-xl font-bold gradient-text">QR Pro Creator</span>
            </div>
            <p className="text-gray-600 text-sm">© {new Date().getFullYear()} Tous droits réservés pour QR Pro Creator.</p>
            <p className="text-gray-500 text-xs mt-2">Créé avec ❤️ pour simplifier le partage de contacts</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
