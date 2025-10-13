'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import * as QRCode from 'qrcode';
import { 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  QrCode, 
  Search, 
  Filter,
  Calendar,
  HardDrive,
  Users,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  publicUrl: string;
  filePath?: string;
  qrCodePath?: string;
  uploadedBy: string;
  uploadedAt: any;
  isActive: boolean;
  downloadCount: number;
  description?: string;
  mimeType: string;
  temporary?: boolean;
  classification: 'public' | 'confidential';
  ownerEmail: string;
  statsTrackingEnabled: boolean;
}

export default function AdminDocumentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentClassification, setDocumentClassification] = useState<'public' | 'confidential'>('public');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statsTrackingLink, setStatsTrackingLink] = useState<string>('');

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/auth/signin');
      return;
    }
    fetchDocuments();
  }, [user, loading, router]);

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const response = await fetch('/api/admin/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        console.error('Erreur HTTP lors du chargement des documents:', response.status);
        setDocuments([]); // Définir un tableau vide en cas d'erreur
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      setDocuments([]); // Définir un tableau vide en cas d'erreur
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale autorisée: 20MB');
        return;
      }
      
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName || !ownerEmail) {
      alert('Veuillez sélectionner un fichier, saisir un nom et une adresse email');
      return;
    }

    try {
      setIsUploading(true);
      
      // Initialiser Firebase Storage côté client
      const storage = getStorage();
      const auth = getAuth();
      
      console.log('Upload côté client avec utilisateur:', auth.currentUser?.email);
      
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = selectedFile.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;

      // Upload vers Firebase Storage
      console.log('Upload vers Firebase Storage...');
      const storageRef = ref(storage, `documents/${fileName}`);
      const uploadResult = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Upload réussi:', downloadURL);

      // Créer l'enregistrement dans Firestore via l'API
      const documentData = {
        name: documentName,
        originalName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        filePath: uploadResult.ref.fullPath,
        uploadedBy: auth.currentUser?.uid || 'admin',
        description: documentDescription || '',
        mimeType: selectedFile.type,
        classification: documentClassification,
        ownerEmail: ownerEmail,
        statsTrackingEnabled: documentClassification === 'public'
      };

      console.log('📤 Données à envoyer à l\'API:', JSON.stringify(documentData, null, 2));
      console.log('💾 Sauvegarde des métadonnées dans Firestore...');
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (response.ok) {
        const newDocument = await response.json();
        console.log('✅ Document sauvegardé:', newDocument);
        
        // Générer l'URL publique avec l'ID Firebase réel
        const publicUrl = `${window.location.origin}/api/document/${newDocument.id}`;
        
        // Générer le QR code maintenant que nous avons l'URL publique
        let qrCodePath = '';
        try {
          console.log('🔲 Génération du QR code pour:', publicUrl);
          
          // Générer le QR code en PNG
          const qrCodeDataURL = await QRCode.toDataURL(publicUrl, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          console.log('✅ QR code généré, téléchargement automatique...');
          
          // Créer un lien de téléchargement automatique
          const link = window.document.createElement('a');
          link.href = qrCodeDataURL;
          link.download = `${documentName}_QR_Code.png`;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
          
          console.log('📱 QR code téléchargé automatiquement');
          qrCodePath = qrCodeDataURL; // Garder l'URL pour l'affichage
          
        } catch (qrError) {
          console.error('❌ Erreur lors de la génération du QR code:', qrError);
          console.log('⚠️ Continuation sans QR code...');
          // Continuer sans QR code si la génération échoue
        }
        
        // Corriger l'URL publique avec l'ID Firebase réel
        const correctedDocument = {
          ...newDocument,
          publicUrl,
          qrCodePath
        };
        
        setDocuments(prev => [correctedDocument, ...prev]);
        setShowUploadModal(false);
        setSelectedFile(null);
        setDocumentName('');
        setDocumentDescription('');
        setDocumentClassification('public');
        setOwnerEmail('');
        alert('Document uploadé avec succès!');
      } else {
        console.error('❌ Erreur HTTP:', response.status, response.statusText);
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Erreur API:', errorData);
        } catch (parseError) {
          console.error('❌ Impossible de parser la réponse d\'erreur:', parseError);
          errorData = { error: `Erreur HTTP ${response.status}: ${response.statusText}` };
        }
        alert(`Erreur: ${errorData.error || 'Impossible d\'uploader le document'}`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const getDirectFileUrl = (document: Document) => {
    if (document.temporary) return null;
    
    // Si on a le filePath, construire l'URL Firebase Storage directe
    if (document.filePath) {
      return `https://firebasestorage.googleapis.com/v0/b/studio-6374747103-d0730.firebasestorage.app/o/${encodeURIComponent(document.filePath)}?alt=media`;
    }
    
    // Sinon, utiliser l'URL publique
    return document.publicUrl;
  };

  const generateStatsTrackingLink = (document: Document) => {
    // Valeurs par défaut pour les documents existants
    const classification = document.classification || 'public';
    const statsTrackingEnabled = document.statsTrackingEnabled !== undefined ? document.statsTrackingEnabled : true;
    const ownerEmail = document.ownerEmail || 'admin@example.com';
    
    if (!statsTrackingEnabled || classification !== 'public') {
      return null;
    }
    
    const baseUrl = window.location.origin;
    const statsUrl = `${baseUrl}/document-stats/${document.id}?email=${encodeURIComponent(ownerEmail)}`;
    return statsUrl;
  };

  const handleDownloadQRCode = async (document: Document) => {
    try {
      console.log('🔲 Génération QR code pour:', document.name);
      
      // Générer le QR code en PNG
      const qrCodeDataURL = await QRCode.toDataURL(document.publicUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Créer un lien de téléchargement automatique
      const link = window.document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = `${document.name}_QR_Code.png`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      console.log('📱 QR code téléchargé:', document.name);
    } catch (error) {
      console.error('❌ Erreur génération QR code:', error);
      alert('Erreur lors de la génération du QR code');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        alert('Document supprimé avec succès!');
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Erreur lors de la suppression');
    }
  };

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (!mimeType) return '📁'; // Fallback si mimeType est undefined
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📁';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.fileType.includes(filterType);
    return matchesSearch && matchesFilter;
  });

  if (loading || documentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              📄 Gestion des Documents
            </h1>
            <p className="text-sm text-gray-600">
              Upload, gérez et partagez vos documents avec des QR codes
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 sm:mt-0 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Document
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Documents</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Téléchargements</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Espace Utilisé</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {formatFileSize(documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Actifs</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {documents.filter(doc => doc.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un document..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">Tous les types</option>
                <option value="pdf">PDF</option>
                <option value="image">Images</option>
                <option value="word">Word</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Documents ({filteredDocuments.length})</h3>
          </div>
          
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Aucun document ne correspond à votre recherche'
                  : 'Commencez par uploader votre premier document'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Upload Premier Document
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="p-3 sm:p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="text-xl sm:text-2xl flex-shrink-0">{getFileIcon(document.mimeType)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                          {document.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {document.originalName} • {formatFileSize(document.fileSize)}
                        </p>
                        {document.temporary && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                            ⚠️ Document temporaire
                          </span>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 sm:mt-1">
                          <span className="text-xs text-gray-400">
                            📅 {formatDate(document.uploadedAt)}
                          </span>
                          <span className="text-xs text-gray-400">
                            📊 {document.downloadCount || 0} téléchargements
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full w-fit ${
                            document.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {document.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end sm:justify-start space-x-1 sm:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedDocument(document);
                          setShowDetailModal(true);
                        }}
                        className="p-2 sm:p-2.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDownloadQRCode(document)}
                        className="p-2 sm:p-2.5 text-gray-400 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
                        title="Télécharger QR Code"
                      >
                        <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          const directUrl = getDirectFileUrl(document);
                          if (!directUrl) {
                            alert('Document temporaire - non accessible publiquement');
                            return;
                          }
                          window.open(directUrl, '_blank');
                        }}
                        className={`p-2 sm:p-2.5 transition-colors rounded-lg ${
                          document.temporary 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={document.temporary ? 'Document temporaire - non accessible publiquement' : 'Ouvrir le document directement'}
                      >
                        <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteDocument(document.id)}
                        className="p-2 sm:p-2.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upload Document</h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fichier *
                    </label>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.xls,.xlsx"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Types acceptés: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP, TXT, XLS, XLSX (Max: 20MB)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du document *
                    </label>
                    <input
                      type="text"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Nom du document"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base resize-none"
                      placeholder="Description du document (optionnel)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Classification *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="classification"
                          value="public"
                          checked={documentClassification === 'public'}
                          onChange={(e) => setDocumentClassification(e.target.value as 'public' | 'confidential')}
                          className="mr-2 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Public (accessible avec lien de suivi)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="classification"
                          value="confidential"
                          checked={documentClassification === 'confidential'}
                          onChange={(e) => setDocumentClassification(e.target.value as 'public' | 'confidential')}
                          className="mr-2 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Confidentiel (pas de suivi)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email du propriétaire *
                    </label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="email@exemple.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email du propriétaire pour le suivi des statistiques
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">
                        Fichier sélectionné: {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Taille: {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  )}
                </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="w-full sm:w-auto px-4 py-2 sm:py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || !documentName || !ownerEmail || isUploading}
                      className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-lg w-full max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Détails du Document</h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="text-3xl sm:text-4xl flex-shrink-0">{getFileIcon(selectedDocument.mimeType)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 break-words">
                        {selectedDocument.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 break-words">
                        {selectedDocument.originalName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Taille</p>
                      <p className="text-sm sm:text-base text-gray-900">{formatFileSize(selectedDocument.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Type</p>
                      <p className="text-sm sm:text-base text-gray-900">{selectedDocument.mimeType}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Téléchargements</p>
                      <p className="text-sm sm:text-base text-gray-900">{selectedDocument.downloadCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Statut</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedDocument.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedDocument.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Classification</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        (selectedDocument.classification || 'public') === 'public'
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {(selectedDocument.classification || 'public') === 'public' ? 'Public' : 'Confidentiel'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Propriétaire</p>
                      <p className="text-sm sm:text-base text-gray-900">{selectedDocument.ownerEmail || 'admin@example.com'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Date d'upload</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedDocument.uploadedAt)}</p>
                  </div>


                  {selectedDocument.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Description</p>
                      <p className="text-sm text-gray-900">{selectedDocument.description}</p>
                    </div>
                  )}


                  {/* Liens pour documents publics */}
                  {(selectedDocument.classification || 'public') === 'public' && (selectedDocument.statsTrackingEnabled !== false) ? (
                    <div className="space-y-4">
                      {/* Lien public du document */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Lien public du document</p>
                        <div className="space-y-2">
                          <div className="px-2 sm:px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs sm:text-sm break-all">
                            {selectedDocument.publicUrl || `${window.location.origin}/api/document/${selectedDocument.id}`}
                          </div>
                          <button
                            onClick={() => {
                              const urlToCopy = selectedDocument.publicUrl || `${window.location.origin}/api/document/${selectedDocument.id}`;
                              navigator.clipboard.writeText(urlToCopy);
                              alert('Lien public copié !');
                            }}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
                            title="Copier le lien public"
                          >
                            Copier
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Ce lien permet d'accéder directement au document
                        </p>
                      </div>

                      {/* Lien de suivi des statistiques */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Lien de suivi des statistiques</p>
                        <div className="space-y-2">
                          <div className="px-2 sm:px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-800 text-xs sm:text-sm break-all">
                            {statsTrackingLink || 'Cliquer sur "Générer" pour créer le lien'}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                const trackingLink = generateStatsTrackingLink(selectedDocument);
                                if (trackingLink) {
                                  setStatsTrackingLink(trackingLink);
                                }
                              }}
                              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
                              title="Générer le lien de suivi"
                            >
                              Générer
                            </button>
                            {statsTrackingLink && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(statsTrackingLink);
                                  alert('Lien de suivi copié !');
                                }}
                                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
                                title="Copier le lien de suivi"
                              >
                                Copier
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Ce lien permet au propriétaire ({selectedDocument.ownerEmail || 'admin@example.com'}) de consulter les statistiques de téléchargement
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Suivi des statistiques</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          {(selectedDocument.classification || 'public') === 'confidential' 
                            ? 'Document confidentiel - Pas de suivi disponible'
                            : 'Suivi des statistiques non activé'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                  <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={() => {
                        const directUrl = getDirectFileUrl(selectedDocument);
                        if (!directUrl) {
                          alert('Document temporaire - non accessible publiquement');
                          return;
                        }
                        window.open(directUrl, '_blank');
                      }}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      Ouvrir le Document
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
