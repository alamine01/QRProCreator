'use client';

import React, { useState, useEffect } from 'react';
import { BaseLayout } from '@/components/layout/BaseLayout';
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
  Check
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [qrCode, setQrCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');

  useEffect(() => {
    if (user) {
      const url = `${window.location.origin}/pro/${user.profileSlug}`;
      setProfileUrl(url);
      generateQRCode(url).then(setQrCode);
    }
  }, [user]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

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
      downloadVCard(user);
    }
  };

  if (loading) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </BaseLayout>
    );
  }

  if (!user) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
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
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bonjour, {user.firstName} !
            </h1>
            <p className="text-gray-600">
              Gérez votre carte de visite numérique et partagez vos informations facilement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="lg:col-span-2">
              <div className="glass-effect rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Mon Profil</h2>
                  <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                    <Edit className="h-4 w-4" />
                    <span>Modifier</span>
                  </button>
                </div>

                <div className="flex items-start space-x-6">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-12 w-12 text-primary-600" />
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {user.firstName} {user.lastName}
                    </h3>
                    {user.profession && (
                      <p className="text-gray-600 mb-4">{user.profession}</p>
                    )}
                    
                    {/* Contact Information */}
                    <div className="space-y-2">
                      {user.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-primary-500" />
                          <span className="text-gray-700">{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-primary-500" />
                        <span className="text-gray-700">{user.email}</span>
                      </div>
                      {user.location && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-primary-500" />
                          <span className="text-gray-700">{user.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Social Media */}
                    {(user.linkedin || user.instagram || user.twitter || user.facebook) && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Réseaux Sociaux</h4>
                        <div className="flex space-x-4">
                          {user.linkedin && (
                            <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                              <Linkedin className="h-5 w-5" />
                            </a>
                          )}
                          {user.instagram && (
                            <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                              <Instagram className="h-5 w-5" />
                            </a>
                          )}
                          {user.twitter && (
                            <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
                              <Twitter className="h-5 w-5" />
                            </a>
                          )}
                          {user.facebook && (
                            <a href={user.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800">
                              <Facebook className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-effect rounded-2xl p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Actions Rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center space-x-3 p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors"
                  >
                    <Share2 className="h-6 w-6 text-primary-500" />
                    <span className="font-medium text-gray-700">
                      {copied ? 'Lien copié !' : 'Copier le lien'}
                    </span>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
                  </button>
                  
                  <button
                    onClick={handleDownloadVCard}
                    className="flex items-center justify-center space-x-3 p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors"
                  >
                    <Download className="h-6 w-6 text-primary-500" />
                    <span className="font-medium text-gray-700">Télécharger vCard</span>
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-effect rounded-2xl p-8 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  Votre QR Code
                </h2>
                
                {qrCode ? (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-xl shadow-lg inline-block mb-6">
                      <img
                        src={qrCode}
                        alt="QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Scannez ce QR code pour accéder à votre profil public
                    </p>
                    
                    <button
                      onClick={handleDownloadQR}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Télécharger QR Code</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-gray-100 p-4 rounded-xl inline-block mb-6">
                      <QrCode className="h-24 w-24 text-gray-400 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Génération du QR code...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
