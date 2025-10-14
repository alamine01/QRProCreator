'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaQrcode, FaBarcode, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaWhatsapp, FaLinkedin, FaFacebook, FaTwitter, FaSnapchat, FaYoutube, FaTiktok } from 'react-icons/fa';

interface ScanResult {
  type: 'barcode' | 'profile';
  barcode?: string;
  randomProfile?: {
    firstName: string;
    lastName: string;
    profession: string;
    company: string;
    phone: string;
    email: string;
    bio: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profession?: string;
    phone?: string;
    profilePicture?: string;
    profileSlug: string;
    biography?: string;
    location?: string;
    instagram?: string;
    whatsapp?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    snapchat?: string;
    youtube?: string;
    tiktok?: string;
  };
  businessCard?: {
    id: string;
    name: string;
    title: string;
    company: string;
    bio: string;
    phonePrimary: string;
    email: string;
    location: string;
    instagram?: string;
    whatsapp?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    snapchat?: string;
    youtube?: string;
    tiktok?: string;
  };
  assignedAt?: any;
  createdAt?: any;
}

function StickerScanPageContent() {
  const searchParams = useSearchParams();
  const qrCode = searchParams.get('qr');
  
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (qrCode) {
      scanQRCode();
    } else {
      setError('Code QR manquant');
      setLoading(false);
    }
  }, [qrCode]);

  const scanQRCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sticker/scan?qr=${qrCode}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Erreur lors du scan');
      }
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Scan du QR code en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaQrcode className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de scan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {result.type === 'barcode' ? (
          // Affichage du code-barres (autocollant non assigné)
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBarcode className="w-10 h-10 text-blue-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Autocollant Disponible
            </h1>
            
            <p className="text-gray-600 mb-6">
              Cet autocollant n'est pas encore assigné à un client
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Code-barres pour identification
              </h3>
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-4">
                <span className="text-2xl font-mono tracking-wider">
                  {result.barcode}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Utilisez ce code-barres pour identifier rapidement cet autocollant
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profil aléatoire généré
              </h3>
              <div className="text-left">
                <div className="flex items-center mb-2">
                  <FaUser className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium">
                    {result.randomProfile?.firstName} {result.randomProfile?.lastName}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <FaEnvelope className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {result.randomProfile?.profession} - {result.randomProfile?.company}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {result.randomProfile?.bio}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => window.close()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          // Affichage du profil client (autocollant assigné)
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                {result.user?.profilePicture ? (
                  <img
                    src={result.user.profilePicture}
                    alt={result.user.firstName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <FaUser className="w-10 h-10" />
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {result.user?.firstName} {result.user?.lastName}
              </h1>
              <p className="text-blue-100">
                {result.businessCard?.title || result.user?.profession}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Company Info */}
              {(result.businessCard?.company || result.user?.profession) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {result.businessCard?.company || result.user?.profession}
                  </h3>
                  {(result.businessCard?.bio || result.user?.biography) && (
                    <p className="text-gray-600">{result.businessCard?.bio || result.user?.biography}</p>
                  )}
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                {(result.businessCard?.phonePrimary || result.user?.phone) && (
                  <div className="flex items-center">
                    <FaPhone className="w-5 h-5 text-gray-500 mr-3" />
                    <a 
                      href={`tel:${result.businessCard?.phonePrimary || result.user?.phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {result.businessCard?.phonePrimary || result.user?.phone}
                    </a>
                  </div>
                )}
                
                {(result.businessCard?.email || result.user?.email) && (
                  <div className="flex items-center">
                    <FaEnvelope className="w-5 h-5 text-gray-500 mr-3" />
                    <a 
                      href={`mailto:${result.businessCard?.email || result.user?.email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {result.businessCard?.email || result.user?.email}
                    </a>
                  </div>
                )}
                
                {(result.businessCard?.location || result.user?.location) && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="text-gray-700">{result.businessCard?.location || result.user?.location}</span>
                  </div>
                )}
              </div>

              {/* Social Media */}
              {(result.businessCard || result.user) && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Réseaux sociaux</h4>
                  <div className="flex flex-wrap gap-3">
                    {(result.businessCard?.instagram || result.user?.instagram) && (
                      <a
                        href={result.businessCard?.instagram || result.user?.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <FaInstagram className="w-4 h-4 mr-2" />
                        Instagram
                      </a>
                    )}
                    
                    {(result.businessCard?.whatsapp || result.user?.whatsapp) && (
                      <a
                        href={`https://wa.me/${(result.businessCard?.whatsapp || result.user?.whatsapp || '').replace(/[^\d+]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <FaWhatsapp className="w-4 h-4 mr-2" />
                        WhatsApp
                      </a>
                    )}
                    
                    {(result.businessCard?.linkedin || result.user?.linkedin) && (
                      <a
                        href={result.businessCard?.linkedin || result.user?.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <FaLinkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    )}
                    
                    {(result.businessCard?.facebook || result.user?.facebook) && (
                      <a
                        href={result.businessCard?.facebook || result.user?.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-blue-700 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <FaFacebook className="w-4 h-4 mr-2" />
                        Facebook
                      </a>
                    )}
                    
                    {(result.businessCard?.twitter || result.user?.twitter) && (
                      <a
                        href={result.businessCard?.twitter || result.user?.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-sky-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <FaTwitter className="w-4 h-4 mr-2" />
                        Twitter
                      </a>
                    )}
                    
                    {(result.businessCard?.snapchat || result.user?.snapchat) && (
                      <a
                        href={result.businessCard?.snapchat || result.user?.snapchat}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-yellow-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <FaSnapchat className="w-4 h-4 mr-2" />
                        Snapchat
                      </a>
                    )}
                    
                    {(result.businessCard?.youtube || result.user?.youtube) && (
                      <a
                        href={result.businessCard?.youtube || result.user?.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <FaYoutube className="w-4 h-4 mr-2" />
                        YouTube
                      </a>
                    )}
                    
                    {(result.businessCard?.tiktok || result.user?.tiktok) && (
                      <a
                        href={result.businessCard?.tiktok || result.user?.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <FaTiktok className="w-4 h-4 mr-2" />
                        TikTok
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Profile Link */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Profil complet disponible sur :
                </p>
                <a
                  href={`/pro/${result.user?.profileSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaUser className="w-4 h-4 mr-2" />
                  Voir le profil complet
                </a>
              </div>

              {/* Assignment Date */}
              {(result.assignedAt || result.createdAt) && (
                <div className="mt-4 text-center space-y-1">
                  {result.assignedAt && (
                    <p className="text-xs text-gray-500">
                      Assigné le {result.assignedAt.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </p>
                  )}
                  {result.createdAt && (
                    <p className="text-xs text-gray-400">
                      Créé le {result.createdAt.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 text-center">
              <button
                onClick={() => window.close()}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StickerScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <StickerScanPageContent />
    </Suspense>
  );
}
