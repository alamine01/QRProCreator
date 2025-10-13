'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Download, 
  QrCode, 
  FileText, 
  Calendar, 
  Users, 
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  publicUrl: string;
  qrCodePath?: string;
  uploadedBy: string;
  uploadedAt: any;
  isActive: boolean;
  downloadCount: number;
  description?: string;
  mimeType: string;
}

export default function PublicDocumentPage() {
  const params = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const documentId = params?.id as string;
        
        if (documentId) {
          const response = await fetch(`/api/document/${documentId}`);
          if (response.ok) {
            const doc = await response.json();
            setDocument(doc);
          } else if (response.status === 404) {
            setError('Document non trouvé');
          } else if (response.status === 403) {
            setError('Document non disponible');
          } else {
            setError('Erreur lors du chargement du document');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du document:', error);
        setError('Erreur lors du chargement du document');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [params?.id]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date inconnue';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📁';
  };

  const handleDownload = () => {
    if (document) {
      // Créer un lien de téléchargement temporaire
      const link = document.createElement('a');
      link.href = document.publicUrl;
      link.download = document.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintQR = () => {
    if (document?.qrCodePath) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${document.name}</title>
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
              <img src="${document.qrCodePath}" alt="QR Code" style="width: 200px; height: 200px;" />
            </div>
            <div class="info">
              <h2 style="margin: 0;">${document.name}</h2>
              <p style="margin: 5px 0; color: #666;">${document.originalName}</p>
              <p style="margin: 5px 0; color: #666;">${formatFileSize(document.fileSize)}</p>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Document non trouvé'}
          </h1>
          <p className="text-gray-600 mb-8">
            {error === 'Document non trouvé' 
              ? 'Le document que vous recherchez n\'existe pas ou a été supprimé.'
              : error === 'Document non disponible'
              ? 'Ce document n\'est plus disponible.'
              : 'Une erreur est survenue lors du chargement du document.'
            }
          </p>
          <a
            href="/"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Document Header */}
            <div className="relative h-32 bg-gradient-to-r from-primary-500 to-primary-600">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center shadow-lg">
                  <span className="text-4xl">{getFileIcon(document.mimeType)}</span>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="pt-16 px-6 pb-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {document.name}
                </h1>
                <p className="text-gray-600 mt-1">{document.originalName}</p>
              </div>

              {/* Document Information */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/10 text-primary-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Type de fichier</p>
                    <p className="text-sm text-gray-900">{document.mimeType}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/10 text-primary-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Date d'upload</p>
                    <p className="text-sm text-gray-900">{formatDate(document.uploadedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/10 text-primary-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Téléchargements</p>
                    <p className="text-sm text-gray-900">{document.downloadCount} fois</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/10 text-primary-500">
                    <span className="text-lg">📊</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Taille</p>
                    <p className="text-sm text-gray-900">{formatFileSize(document.fileSize)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {document.description && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{document.description}</p>
                </div>
              )}

              {/* Download Button */}
              <div className="mt-6">
                <button 
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center px-6 py-4 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Télécharger le Document
                </button>
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

              {/* QR Code */}
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Partager le Document</h2>
              <div className="flex flex-col items-center justify-center mb-6">
                {document.qrCodePath ? (
                  <img src={document.qrCodePath} alt="QR Code" className="w-32 h-32 mb-2" />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <p className="text-base font-medium text-gray-900 mt-2">
                  {document.name}
                </p>
                <p className="text-sm text-gray-500">{document.originalName}</p>
              </div>

              {/* Print QR Button */}
              {document.qrCodePath && (
                <button 
                  onClick={handlePrintQR}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mb-4"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimer le Code QR
                </button>
              )}

              {/* Share Link */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Lien de partage</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={document.publicUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(document.publicUrl)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copier le lien"
                  >
                    📋
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Scannez le QR code ou partagez le lien pour permettre à d'autres d'accéder à ce document.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
