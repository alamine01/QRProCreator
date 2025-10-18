'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { generateQRCode } from '@/lib/qrcode';
import { downloadVCard } from '@/lib/vcard';
import { recordScan, detectDeviceInfo, getUserProfileBySlug } from '@/lib/firebase';
import {
  QrCode,
  Download,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  ExternalLink,
  Briefcase,
  MessageSquare,
  Star,
  Navigation as NavigationIcon,
  User,
  Loader2
} from 'lucide-react';
import { User as UserType } from '@/types';

export default function PublicProfile() {
  const params = useParams();
  const { user, loading } = useAuth();
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const slug = params?.slug as string;
        
        if (slug) {
          // Essayer de récupérer le profil par slug depuis Firestore
          try {
            const userProfile = await getUserProfileBySlug(slug);
            if (userProfile) {
              setProfileUser(userProfile);
              setProfileLoading(false);
              
              // Générer le QR code pour cette page
              const profileUrl = `${window.location.origin}/pro/${slug}`;
              generateQRCode(profileUrl).then(setQrCode);
              
              // Enregistrer le scan
              try {
                if (userProfile.id) {
                  const deviceInfo = await detectDeviceInfo();
                  // Utiliser l'ID de l'utilisateur du profil
                  await recordScan(userProfile.id, {
                    ...deviceInfo,
                    ip: 'Unknown', // À améliorer avec une API IP
                  });
                  console.log('Scan enregistré avec succès');
                } else {
                  console.warn('Impossible d\'enregistrer le scan: ID utilisateur manquant');
                }
              } catch (scanError) {
                console.error('Erreur lors de l\'enregistrement du scan:', scanError);
              }
              
              return;
            }
          } catch (error) {
            console.log('Profil non trouvé par slug, utilisation de l\'utilisateur connecté:', error);
          }
        }
        
        // Fallback : utiliser l'utilisateur connecté comme profil public
        if (user && !loading) {
          setProfileUser(user);
          setProfileLoading(false);
          
          // Générer le QR code pour cette page
          const profileUrl = `${window.location.origin}/pro/${user.profileSlug}`;
          generateQRCode(profileUrl).then(setQrCode);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user, loading, params?.slug]);

  const handleDownloadVCard = () => {
    if (profileUser) {
      downloadVCard(profileUser, profileUser.id);
    }
  };

  const handlePrintQR = () => {
    if (qrCode) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${profileUser?.firstName || 'Utilisateur'} ${profileUser?.lastName || ''}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
            }
            .qr-code {
              margin-bottom: 20px;
            }
            .info {
              margin-top: 20px;
            }
            @media print {
              body {
                min-height: auto;
                padding: 0;
              }
              .container {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="qr-code">
              <img src="${qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
            </div>
            <div class="info">
              <h2 style="margin: 0;">${profileUser?.firstName || 'Utilisateur'} ${profileUser?.lastName || ''}</h2>
              ${profileUser?.profession ? `<p style="margin: 5px 0; color: #666;">${profileUser.profession}</p>` : ''}
            </div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([printContent], { type: 'text/html' });
      const printUrl = URL.createObjectURL(blob);
      const printFrame = document.createElement('iframe');
      printFrame.style.display = 'none';
      document.body.appendChild(printFrame);

      printFrame.src = printUrl;
      printFrame.onload = function() {
        try {
          printFrame.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(printFrame);
            URL.revokeObjectURL(printUrl);
          }, 1000);
        } catch (e) {
          console.error('Print failed:', e);
          alert('Impossible d\'imprimer. Veuillez essayer de sauvegarder en PDF.');
        }
      };
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profil non trouvé
          </h1>
          <p className="text-gray-600 mb-8">
            Le profil que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <a
            href="/"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="relative h-32 bg-gradient-to-r from-primary-500 to-primary-600">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                {profileUser.profilePicture ? (
                  <img 
                    src={profileUser.profilePicture} 
                    alt={`${profileUser.firstName || 'Utilisateur'} ${profileUser.lastName || ''}`}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-400">
                      {(profileUser.firstName?.[0] || 'U')}{(profileUser.lastName?.[0] || 'U')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-16 px-6 pb-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileUser.firstName || 'Utilisateur'} {profileUser.lastName || ''}
                </h1>
                {profileUser.profession && (
                  <p className="text-blue-600 font-medium mt-1">{profileUser.profession}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="mt-6 space-y-4">
                {/* Primary Phone */}
                {profileUser.phone && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/10 text-primary-500">
                      <Phone className="h-5 w-5" />
                    </div>
                    <a href={`tel:${profileUser.phone}`} className="ml-3 text-gray-700 hover:text-blue-600 transition">
                      {profileUser.phone} (Principal)
                    </a>
                  </div>
                )}

                {/* Secondary Phone */}
                {profileUser.phoneSecondary && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/10 text-primary-500">
                      <Phone className="h-5 w-5" />
                    </div>
                    <a href={`tel:${profileUser.phoneSecondary}`} className="ml-3 text-gray-700 hover:text-blue-600 transition">
                      {profileUser.phoneSecondary}
                    </a>
                  </div>
                )}

                {/* Third Phone */}
                {profileUser.phoneThird && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/10 text-primary-500">
                      <Phone className="h-5 w-5" />
                    </div>
                    <a href={`tel:${profileUser.phoneThird}`} className="ml-3 text-gray-700 hover:text-blue-600 transition">
                      {profileUser.phoneThird}
                    </a>
                  </div>
                )}

                {/* Fourth Phone */}
                {profileUser.phoneFourth && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/10 text-primary-500">
                      <Phone className="h-5 w-5" />
                    </div>
                    <a href={`tel:${profileUser.phoneFourth}`} className="ml-3 text-gray-700 hover:text-blue-600 transition">
                      {profileUser.phoneFourth}
                    </a>
                  </div>
                )}

                {/* Email */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/10 text-primary-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <a href={`mailto:${profileUser.email}`} className="ml-3 text-gray-700 hover:text-blue-600 transition">
                    {profileUser.email}
                  </a>
                </div>

                {/* Address */}
                {profileUser.address && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/10 text-primary-500">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="ml-3 text-gray-700">{profileUser.address}</span>
                  </div>
                )}
              </div>

              {/* Map */}
              {profileUser.location && (
                <div className="mt-6">
                  <a 
                    href={profileUser.location} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition duration-200"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/10 text-primary-500 mr-3">
                      <NavigationIcon className="h-5 w-5" />
                    </div>
                    <span className="text-blue-600 font-medium">Naviguer vers l'emplacement</span>
                  </a>
                </div>
              )}

              {/* Review Link */}
              {profileUser.reviewLink && (
                <div className="mt-6">
                  <a 
                    href={profileUser.reviewLink} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition duration-200"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                      <Star className="h-5 w-5" />
                    </div>
                    <span className="text-yellow-600 font-medium">Laisser un avis</span>
                  </a>
                </div>
              )}

              {/* Biography */}
              {profileUser.biography && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">À propos</h3>
                  <p className="text-gray-700 leading-relaxed">{profileUser.biography}</p>
                </div>
              )}

              {/* Social Media Links */}
              <div className="mt-6 flex justify-center space-x-4">
                {profileUser.instagram && (
                  <a 
                    href={profileUser.instagram} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white hover:opacity-90 transition"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}

                {profileUser.whatsapp && (
                  <a 
                    href={`https://wa.me/${profileUser.whatsapp.replace(/[^\d+]/g, '')}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:opacity-90 transition"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </a>
                )}

                {profileUser.facebook && (
                  <a 
                    href={profileUser.facebook} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:opacity-90 transition"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}

                {profileUser.linkedin && (
                  <a 
                    href={profileUser.linkedin} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-700 text-white hover:opacity-90 transition"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}

                {profileUser.twitter && (
                  <a 
                    href={profileUser.twitter} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-400 text-white hover:opacity-90 transition"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}

                {profileUser.youtube && (
                  <a 
                    href={profileUser.youtube} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white hover:opacity-90 transition"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}

                {profileUser.tiktok && (
                  <a 
                    href={profileUser.tiktok} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 text-white hover:opacity-90 transition"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                )}

                {profileUser.snapchat && (
                  <a 
                    href={profileUser.snapchat} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-400 text-white hover:opacity-90 transition"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="14" fill="#FFFA37"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M21.0255 8.18551C20.0601 6.96879 18.4673 6 16.0118 6C13.9091 6.02071 9.70378 7.18445 9.70378 11.6738C9.70378 12.3294 9.75568 13.2075 9.80103 13.8541C9.74758 13.8386 9.68188 13.8095 9.57775 13.7596L9.56328 13.7527C9.37915 13.6643 9.09918 13.5298 8.7098 13.5298C8.31645 13.5298 7.93611 13.6839 7.65375 13.9124C7.37309 14.1394 7.13333 14.4885 7.13333 14.9105C7.13333 15.4384 7.43041 15.7888 7.77778 16.0135C8.08632 16.2131 8.47538 16.3406 8.78337 16.4415L8.81382 16.4514C9.14349 16.5596 9.3851 16.642 9.55169 16.7458C9.68136 16.8267 9.70104 16.8778 9.70348 16.9264C9.70179 16.9333 9.69782 16.9482 9.68919 16.9724C9.67141 17.0224 9.64184 17.0899 9.59862 17.1743C9.5124 17.3427 9.38667 17.5498 9.23711 17.7706C8.93539 18.2161 8.56717 18.673 8.29212 18.9376C8.02082 19.1986 7.57562 19.5229 7.11016 19.7811C6.87933 19.9091 6.6536 20.0152 6.45167 20.0881C6.24322 20.1633 6.09047 20.192 5.99608 20.192C5.92136 20.192 5.85669 20.2073 5.82847 20.2144C5.7888 20.2243 5.74774 20.2374 5.70713 20.2527C5.62657 20.2829 5.53056 20.3283 5.43546 20.3923C5.25377 20.5146 5 20.7612 5 21.1502C5 21.3532 5.04766 21.5251 5.13005 21.6742C5.20217 21.8047 5.29487 21.9038 5.34823 21.9608L5.35615 21.9692L5.37091 21.9851C5.66435 22.3008 6.15008 22.5205 6.62162 22.6712C7.02679 22.8007 7.4798 22.8972 7.92122 22.9551C7.92745 22.9836 7.93397 23.0142 7.9411 23.0478L7.9434 23.0587C7.97119 23.1897 8.008 23.3633 8.06221 23.5234C8.11336 23.6744 8.20599 23.8977 8.39564 24.0568C8.63717 24.2593 8.95308 24.2798 9.1592 24.279C9.38047 24.2781 9.63881 24.2469 9.88394 24.2174L9.90481 24.2149C10.2497 24.1733 10.6106 24.1304 10.9843 24.1304C11.6663 24.1304 12.1035 24.4153 12.7894 24.8837L12.794 24.8869C13.0316 25.0492 13.2976 25.2308 13.6 25.4095C14.6122 26.0076 15.4346 26.0025 15.9007 25.9995C15.9315 25.9993 15.9606 25.9992 15.9882 25.9992C16.0158 25.9992 16.0452 25.9993 16.0761 25.9995C16.543 26.0025 17.3873 26.0079 18.4 25.4095C18.7024 25.2308 18.9684 25.0492 19.2059 24.8869L19.2106 24.8837C19.8965 24.4153 20.3337 24.1304 21.0157 24.1304C21.3894 24.1304 21.7503 24.1733 22.0952 24.2149L22.1161 24.2174C22.3612 24.2469 22.6195 24.2781 22.8408 24.279C23.0469 24.2798 23.3628 24.2593 23.6044 24.0568C23.794 23.8977 23.8866 23.6744 23.9378 23.5234C23.992 23.3634 24.0288 23.1898 24.0566 23.0587L24.0589 23.0478C24.066 23.0142 24.0725 22.9836 24.0788 22.9551C24.5202 22.8972 24.9732 22.8007 25.3784 22.6712C25.8499 22.5205 26.3357 22.3007 26.6291 21.985L26.6439 21.9692L26.6517 21.9608C26.7051 21.9038 26.7978 21.8047 26.8699 21.6742C26.9523 21.5251 27 21.3532 27 21.1502C27 20.7612 26.7462 20.5146 26.5645 20.3923C26.4694 20.3283 26.3734 20.2829 26.2929 20.2527C26.2523 20.2374 26.2112 20.2243 26.1715 20.2144C26.1433 20.2073 26.0786 20.192 26.0039 20.192C25.9095 20.192 25.7568 20.1633 25.5483 20.0881C25.3464 20.0152 25.1207 19.9091 24.8898 19.7811C24.4244 19.5229 23.9792 19.1986 23.7079 18.9376C23.4328 18.673 23.0646 18.2161 22.7629 17.7706C22.6133 17.5498 22.4876 17.3427 22.4014 17.1743C22.3582 17.0899 22.3286 17.0224 22.3108 16.9724C22.3022 16.9482 22.2982 16.9333 22.2965 16.9264C22.299 16.8778 22.3186 16.8267 22.4483 16.7458C22.6149 16.642 22.8565 16.5596 23.1862 16.4514L23.2166 16.4415C23.5246 16.3406 23.9137 16.2131 24.2222 16.0135C24.5696 15.7888 24.8667 15.4384 24.8667 14.9105C24.8667 14.4885 24.6269 14.1394 24.3462 13.9124C24.0639 13.6839 23.6835 13.5298 23.2902 13.5298C22.9008 13.5298 22.6209 13.6643 22.4367 13.7527L22.4223 13.7596C22.3181 13.8095 22.2524 13.8386 22.199 13.8541C22.2443 13.2075 22.2962 12.3294 22.2962 11.6738C22.2962 10.7837 21.9726 9.37904 21.0255 8.18551ZM11.7832 8.77274C10.9822 9.77549 10.7077 10.9662 10.7077 11.6738C10.7077 12.3299 10.7633 13.2413 10.8102 13.8949C10.8258 14.1119 10.7813 14.365 10.5917 14.5658C10.3998 14.7691 10.1388 14.8351 9.90561 14.8351C9.56889 14.8351 9.3128 14.7119 9.14898 14.6331L9.12996 14.624C8.94718 14.5363 8.85108 14.4956 8.7098 14.4956C8.58128 14.4956 8.42437 14.5508 8.29994 14.6515C8.17382 14.7535 8.13725 14.8534 8.13725 14.9105C8.13725 15.0269 8.18018 15.1101 8.33794 15.2121C8.52427 15.3326 8.78976 15.4232 9.13779 15.5374L9.16809 15.5473C9.45712 15.642 9.81511 15.7593 10.0976 15.9354C10.4147 16.133 10.7077 16.4507 10.7077 16.9401C10.7077 17.0684 10.6722 17.1919 10.6389 17.2854C10.6028 17.3869 10.554 17.4941 10.4992 17.601C10.3896 17.8152 10.2413 18.0571 10.0783 18.2978C9.75483 18.7754 9.3437 19.2918 9.002 19.6205C8.65655 19.9528 8.13703 20.3263 7.61159 20.6178C7.34696 20.7645 7.07068 20.8961 6.80428 20.9923C6.56581 21.0783 6.3088 21.1457 6.06224 21.1563C6.0561 21.1589 6.04931 21.162 6.0422 21.1655C6.03083 21.1713 6.0202 21.1774 6.01092 21.1837L6.00618 21.187C6.00711 21.1936 6.00817 21.1985 6.00906 21.202C6.01103 21.2097 6.01337 21.2152 6.01652 21.2209C6.02619 21.2384 6.04143 21.2579 6.1031 21.324L6.11928 21.3413C6.23038 21.4609 6.50416 21.616 6.93815 21.7547C7.35148 21.8868 7.84023 21.9822 8.30201 22.026C8.53305 22.0479 8.66621 22.1923 8.72257 22.2701C8.78059 22.3501 8.81377 22.4347 8.83316 22.4908C8.87067 22.5994 8.899 22.7332 8.92135 22.8387L8.92474 22.8547C8.95525 22.9985 8.98194 23.1215 9.01675 23.2242C9.02905 23.2606 9.0404 23.2882 9.05017 23.3085C9.0722 23.3111 9.10599 23.3135 9.15493 23.3133C9.36726 23.3124 9.57984 23.2808 9.79022 23.2554C10.1268 23.2148 10.5433 23.1646 10.9843 23.1646C12.0071 23.1646 12.682 23.6258 13.334 24.0713L13.3706 24.0963C13.6118 24.261 13.8536 24.4259 14.1255 24.5866C14.8917 25.0394 15.4747 25.0361 15.9007 25.0337C15.9306 25.0336 15.9598 25.0334 15.9882 25.0334C16.0164 25.0334 16.0454 25.0336 16.0753 25.0337C16.5059 25.036 17.1085 25.0393 17.8745 24.5866C18.1464 24.4259 18.3882 24.261 18.6294 24.0963L18.666 24.0713C19.318 23.6258 19.9929 23.1646 21.0157 23.1646C21.4567 23.1646 21.8732 23.2148 22.2098 23.2554L22.2199 23.2566C22.4921 23.2894 22.6913 23.3126 22.8451 23.3133C22.894 23.3135 22.9278 23.3111 22.9498 23.3085C22.9596 23.2882 22.9709 23.2606 22.9833 23.2242C23.0181 23.1215 23.0447 22.9985 23.0753 22.8547L23.0787 22.8387C23.101 22.7331 23.1293 22.5994 23.1668 22.4908C23.1862 22.4347 23.2194 22.3501 23.2774 22.2701C23.3338 22.1923 23.467 22.0479 23.698 22.026C24.1598 21.9822 24.6485 21.8868 25.0618 21.7547C25.4958 21.616 25.7696 21.4609 25.8807 21.3414L25.8969 21.324C25.9585 21.2579 25.9738 21.2384 25.9835 21.2209C25.9866 21.2152 25.989 21.2097 25.9909 21.202C25.9918 21.1985 25.9929 21.1936 25.9938 21.187L25.9891 21.1837C25.9798 21.1774 25.9692 21.1713 25.9578 21.1655C25.9507 21.1619 25.9439 21.1589 25.9378 21.1563C25.6912 21.1457 25.4342 21.0783 25.1957 20.9923C24.9293 20.8961 24.653 20.7645 24.3884 20.6178C23.863 20.3263 23.3435 19.9528 22.998 19.6205C22.6563 19.2918 22.2452 18.7754 21.9217 18.2978C21.7587 18.0571 21.6104 17.8152 21.5008 17.601C21.446 17.4941 21.3972 17.3869 21.3611 17.2854C21.3278 17.1919 21.2923 17.0684 21.2923 16.9401C21.2923 16.4507 21.5853 16.133 21.9024 15.9354C22.1849 15.7593 22.5429 15.642 22.8319 15.5473L22.8622 15.5374C23.2102 15.4232 23.4757 15.3326 23.6621 15.2121C23.8198 15.1101 23.8627 15.0269 23.8627 14.9105C23.8627 14.8534 23.8262 14.7535 23.7001 14.6515C23.5756 14.5508 23.4187 14.4956 23.2902 14.4956C23.1489 14.4956 23.0528 14.5363 22.87 14.624L22.851 14.6331C22.6872 14.7119 22.4311 14.8351 22.0944 14.8351C21.8612 14.8351 21.6002 14.7691 21.4083 14.5658C21.2187 14.365 21.1742 14.1119 21.1898 13.8949C21.2367 13.2413 21.2923 12.3299 21.2923 11.6738C21.2923 10.9643 21.0227 9.77352 20.2275 8.77149C19.4508 7.79264 18.1523 6.96575 16.0118 6.96575C13.871 6.96575 12.566 7.79288 11.7832 8.77274Z" fill="white" stroke="black" strokeWidth="0.3"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center">
              {/* Logo placement */}
              <div className="mb-2">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Admin View with QR Code */}
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Partager la Carte</h2>
              <div className="flex flex-col items-center justify-center mb-6">
                {qrCode ? (
                  <img src={qrCode} alt="QR Code" className="w-32 h-32 mb-2" />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <p className="text-base font-medium text-gray-900 mt-2">
                  {profileUser.firstName || 'Utilisateur'} {profileUser.lastName || ''}
                </p>
                {profileUser.profession && (
                  <p className="text-sm text-gray-500">{profileUser.profession}</p>
                )}
              </div>
              <div className="space-y-3">
                <button 
                  onClick={handlePrintQR}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimer le Code QR
                </button>
              </div>

              {/* vCard Download Button */}
              <button 
                onClick={handleDownloadVCard}
                className="w-full flex flex-col items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-500 hover:opacity-90 transition-colors duration-200 mt-4"
              >
                <Download className="h-6 w-6 mb-1" />
                <span>Enregistrer dans les Contacts</span>
                <div className="flex items-center space-x-2 mt-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="text-xs opacity-90">&</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-7.8212c.0007-.0028.001-.0056.001-.0084 0-.5511-.4482-.9993-.9993-.9993-.5511 0-.9993.4482-.9993.9993 0 .0028.0003.0056.001.0084l-1.9973 7.8212zm-11.4045 0l-1.9973-7.8212c-.0007-.0028-.001-.0056-.001-.0084 0-.5511.4482-.9993.9993-.9993s.9993.4482.9993.9993c0 .0028-.0003.0056-.001.0084l1.9973 7.8212z"/>
                  </svg>
                </div>
              </button>

              <p className="text-xs text-gray-500 mt-3">
                Cela créera une fiche de contact complète avec toutes les coordonnées, les liens sociaux et les informations de localisation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
