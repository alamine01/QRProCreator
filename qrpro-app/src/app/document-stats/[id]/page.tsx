'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  Download, 
  Calendar, 
  BarChart3, 
  FileText, 
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Clock,
  User,
  QrCode,
  Smartphone
} from 'lucide-react';

interface DocumentStats {
  id: string;
  name: string;
  originalName: string;
  ownerEmail: string;
  classification: 'public' | 'confidential';
  statsTrackingEnabled: boolean;
  downloadCount: number;
  qrScanCount: number;
  uploadedAt: any;
  mimeType?: string;
  downloads: Array<{
    timestamp: any;
    userAgent?: string;
    ip?: string;
  }>;
  qrScans: Array<{
    id: string;
    timestamp: any;
    userAgent?: string;
    ip?: string;
    location?: string;
  }>;
}

export default function DocumentStatsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

  const documentId = params?.id as string;
  const urlEmail = searchParams?.get('email');

  const verifyEmail = useCallback(async (email: string, password: string) => {
    if (!email || !password || !documentId) return;
    
    setVerifying(true);
    try {
      const response = await fetch(`/api/document-stats/${documentId}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      
      if (response.ok) {
        const data = await response.json();
        setDocumentStats(data);
        setEmailVerified(true);
        setError(null);
        
        // Rediriger vers la même page avec l'email dans l'URL pour éviter de redemander
        const newUrl = `/document-stats/${documentId}?email=${encodeURIComponent(email)}`;
        window.history.replaceState({}, '', newUrl);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur de vérification');
        setEmailVerified(false);
      }
    } catch (err) {
      setError('Erreur de connexion');
      setEmailVerified(false);
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (urlEmail) {
      setInputEmail(urlEmail);
      // Pré-remplir le champ email mais ne pas vérifier automatiquement
    }
    // Toujours arrêter le loading pour afficher le formulaire
    setLoading(false);
  }, [urlEmail]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyEmail(inputEmail, inputPassword);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date inconnue';
    
    try {
      let date;
      
      // Gérer différents formats de timestamp
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        // Firebase Timestamp
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        // Firebase Timestamp en format objet
        date = new Date(timestamp.seconds * 1000);
      } else if (typeof timestamp === 'string') {
        // String ISO
        date = new Date(timestamp);
      } else if (typeof timestamp === 'number') {
        // Timestamp Unix
        date = new Date(timestamp);
      } else {
        // Essayer de convertir directement
        date = new Date(timestamp);
      }
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return 'Date inconnue';
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error, timestamp);
      return 'Date inconnue';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (!mimeType) return '📁';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📁';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                Statistiques du Document
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Entrez votre adresse email pour consulter les statistiques
              </p>
            </div>

            {error && (
              <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-red-700 break-words" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Mot de passe"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={verifying || !inputEmail || !inputPassword}
                className="w-full px-4 py-2 sm:py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs sm:text-sm lg:text-base"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Consulter les statistiques
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!documentStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Document non trouvé</h2>
          <p className="text-gray-600">Le document demandé n'existe pas ou n'est pas accessible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header moderne */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{getFileIcon(documentStats.mimeType || '')}</div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">
                  {documentStats.name}
                </h1>
                <p className="text-orange-100 text-sm truncate">
                  {documentStats.originalName}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  documentStats.classification === 'public'
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {documentStats.classification === 'public' ? 'Public' : 'Confidentiel'}
                </span>
                <span className="text-orange-100 text-xs">
                  📅 {formatDate(documentStats.uploadedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards modernes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {/* Total Downloads */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{documentStats.downloadCount}</p>
                <p className="text-sm text-gray-500">Téléchargements</p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" style={{width: `${Math.min((documentStats.downloadCount / 10) * 100, 100)}%`}}></div>
            </div>
          </div>

          {/* QR Scans */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{documentStats.qrScanCount || 0}</p>
                <p className="text-sm text-gray-500">Scans QR</p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{width: `${Math.min(((documentStats.qrScanCount || 0) / 5) * 100, 100)}%`}}></div>
            </div>
          </div>

          {/* Recent Downloads */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {documentStats.downloads?.filter(d => {
                    const downloadDate = d.timestamp?.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return downloadDate > weekAgo;
                  }).length || 0}
                </p>
                <p className="text-sm text-gray-500">Cette semaine</p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{width: `${Math.min(((documentStats.downloads?.filter(d => {
                const downloadDate = d.timestamp?.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return downloadDate > weekAgo;
              }).length || 0) / 3) * 100, 100)}%`}}></div>
            </div>
          </div>

          {/* Last Download */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 truncate max-w-20">
                  {documentStats.downloads?.length > 0 
                    ? formatDate(documentStats.downloads[documentStats.downloads.length - 1].timestamp).split(' ')[0]
                    : 'Aucun'
                  }
                </p>
                <p className="text-sm text-gray-500">Dernier</p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{width: `${documentStats.downloads?.length > 0 ? 100 : 0}%`}}></div>
            </div>
          </div>

          {/* Owner */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 truncate max-w-20">
                  {documentStats.ownerEmail.split('@')[0]}
                </p>
                <p className="text-sm text-gray-500">Propriétaire</p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-600 to-orange-700 rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>

        {/* Sections Timeline modernes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Scans Timeline */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                Historique des Scans QR
              </h3>
            </div>
            <div className="p-6">
              {documentStats.qrScans && documentStats.qrScans.length > 0 ? (
                <div className="space-y-4">
                  {documentStats.qrScans.map((scan, index) => (
                    <div key={scan.id} className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <QrCode className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">Scan QR #{index + 1}</p>
                        <p className="text-sm text-gray-500">{formatDate(scan.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 truncate max-w-24">
                          {scan.userAgent ? scan.userAgent.split(' ')[0] : 'Inconnu'}
                        </p>
                        {scan.ip && (
                          <p className="text-xs text-gray-400">IP: {scan.ip}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QrCode className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun scan QR</h3>
                  <p className="text-gray-500">Ce document n'a pas encore été scanné via QR code.</p>
                </div>
              )}
            </div>
          </div>

          {/* Downloads Timeline */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Historique des Téléchargements
              </h3>
            </div>
            <div className="p-6">
              {documentStats.downloads && documentStats.downloads.length > 0 ? (
                <div className="space-y-4">
                  {documentStats.downloads.map((download, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Download className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">Téléchargement #{index + 1}</p>
                        <p className="text-sm text-gray-500">{formatDate(download.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 truncate max-w-24">
                          {download.userAgent ? download.userAgent.split(' ')[0] : 'Inconnu'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun téléchargement</h3>
                  <p className="text-gray-500">Ce document n'a pas encore été téléchargé.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
