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
  const [verifying, setVerifying] = useState(false);

  const documentId = params?.id as string;
  const urlEmail = searchParams?.get('email');

  const verifyEmail = useCallback(async (email: string) => {
    if (!email || !documentId) return;
    
    setVerifying(true);
    try {
      const response = await fetch(`/api/document-stats/${documentId}?email=${encodeURIComponent(email)}`);
      
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
      // Si l'email est dans l'URL, vérifier automatiquement (cas où on revient sur la page)
      verifyEmail(urlEmail);
    } else {
      // Pas d'email dans l'URL, arrêter le loading pour afficher le formulaire
      setLoading(false);
    }
  }, [urlEmail, verifyEmail]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyEmail(inputEmail);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date inconnue';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

              <button
                type="submit"
                disabled={verifying || !inputEmail}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="text-3xl sm:text-4xl flex-shrink-0">{getFileIcon(documentStats.mimeType || '')}</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 break-words" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>
                {documentStats.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mb-2 break-words" style={{wordBreak: 'break-all', overflowWrap: 'anywhere'}}>
                {documentStats.originalName}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className={`text-xs px-2 py-1 rounded-full w-fit ${
                  documentStats.classification === 'public'
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {documentStats.classification === 'public' ? 'Public' : 'Confidentiel'}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  📅 Uploadé le {formatDate(documentStats.uploadedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total Téléchargements</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{documentStats.downloadCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Scans QR Code</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{documentStats.qrScanCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Téléchargements Récents</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                  {documentStats.downloads?.filter(d => {
                    const downloadDate = d.timestamp?.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return downloadDate > weekAgo;
                  }).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Dernier Téléchargement</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 break-words" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>
                  {documentStats.downloads?.length > 0 
                    ? formatDate(documentStats.downloads[documentStats.downloads.length - 1].timestamp)
                    : 'Aucun'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Propriétaire</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 break-words" style={{wordBreak: 'break-all', overflowWrap: 'anywhere'}}>{documentStats.ownerEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Scans Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Historique des Scans QR</h3>
          
          {documentStats.qrScans && documentStats.qrScans.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {documentStats.qrScans.map((scan, index) => (
                <div key={scan.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-indigo-50 rounded-lg gap-2 sm:gap-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <QrCode className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        Scan QR #{index + 1}
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(scan.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500 break-words" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>
                      {scan.userAgent ? scan.userAgent.split(' ')[0] : 'Appareil inconnu'}
                    </p>
                    {scan.ip && (
                      <p className="text-xs text-gray-400">
                        IP: {scan.ip}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucun scan QR</h3>
              <p className="text-sm sm:text-base text-gray-500">Ce document n'a pas encore été scanné via QR code.</p>
            </div>
          )}
        </div>

        {/* Downloads Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Historique des Téléchargements</h3>
          
          {documentStats.downloads && documentStats.downloads.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {documentStats.downloads.map((download, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        Téléchargement #{index + 1}
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(download.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500 break-words" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>
                      {download.userAgent ? download.userAgent.split(' ')[0] : 'Appareil inconnu'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <Download className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucun téléchargement</h3>
              <p className="text-sm sm:text-base text-gray-500">Ce document n'a pas encore été téléchargé.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
