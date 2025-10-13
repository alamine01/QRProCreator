'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { generateQRCode } from '@/lib/qrcode';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
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
  qrCodePath?: string;
  uploadedBy: string;
  uploadedAt: any;
  isActive: boolean;
  downloadCount: number;
  description?: string;
  mimeType: string;
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
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
    if (!selectedFile || !documentName) {
      alert('Veuillez sélectionner un fichier et saisir un nom');
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

      // Générer l'URL publique du document
      const documentId = `doc_${timestamp}_${randomString}`;
      const baseUrl = window.location.origin;
      const publicUrl = `${baseUrl}/document/${documentId}`;

      // Générer le QR code
      let qrCodePath = '';
      try {
        console.log('Génération du QR code...');
        const qrCodeData = await generateQRCode(publicUrl);
        // Upload du QR code vers Storage
        const qrCodeBlob = await fetch(qrCodeData).then(r => r.blob());
        const qrCodeRef = ref(storage, `qr-codes/documents/${documentId}.png`);
        await uploadBytes(qrCodeRef, qrCodeBlob);
        qrCodePath = await getDownloadURL(qrCodeRef);
        console.log('QR code généré:', qrCodePath);
      } catch (qrError) {
        console.error('Erreur lors de la génération du QR code:', qrError);
      }

      // Créer l'enregistrement dans Firestore via l'API
      const documentData = {
        name: documentName,
        originalName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        filePath: uploadResult.ref.fullPath,
        publicUrl,
        qrCodePath,
        uploadedBy: auth.currentUser?.uid || 'admin',
        description: documentDescription || '',
        mimeType: selectedFile.type
      };

      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (response.ok) {
        const newDocument = await response.json();
        setDocuments(prev => [newDocument, ...prev]);
        setShowUploadModal(false);
        setSelectedFile(null);
        setDocumentName('');
        setDocumentDescription('');
        alert('Document uploadé avec succès!');
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error || 'Impossible d\'uploader le document'}`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex-shrink-0 ml-2 sm:ml-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0 mt-3 sm:mt-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Documents</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex-shrink-0 ml-2 sm:ml-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Download className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0 mt-3 sm:mt-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Téléchargements</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {documents.reduce((sum, doc) => sum + doc.downloadCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex-shrink-0 ml-2 sm:ml-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <HardDrive className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0 mt-3 sm:mt-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Espace Utilisé</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatFileSize(documents.reduce((sum, doc) => sum + doc.fileSize, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex-shrink-0 ml-2 sm:ml-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0 mt-3 sm:mt-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Actifs</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {documents.filter(doc => doc.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un document..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Documents ({filteredDocuments.length})</h3>
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
                <div key={document.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getFileIcon(document.mimeType)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {document.name}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {document.originalName} • {formatFileSize(document.fileSize)}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">
                            📅 {formatDate(document.uploadedAt)}
                          </span>
                          <span className="text-xs text-gray-400">
                            📊 {document.downloadCount} téléchargements
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            document.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {document.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDocument(document);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <a
                        href={document.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Voir le document public"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      
                      <button
                        onClick={() => handleDeleteDocument(document.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Description du document (optionnel)"
                    />
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

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || !documentName || isUploading}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Détails du Document</h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getFileIcon(selectedDocument.mimeType)}</div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {selectedDocument.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {selectedDocument.originalName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Taille</p>
                      <p className="text-sm text-gray-900">{formatFileSize(selectedDocument.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Type</p>
                      <p className="text-sm text-gray-900">{selectedDocument.mimeType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Téléchargements</p>
                      <p className="text-sm text-gray-900">{selectedDocument.downloadCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Statut</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedDocument.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedDocument.isActive ? 'Actif' : 'Inactif'}
                      </span>
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

                  <div>
                    <p className="text-sm font-medium text-gray-700">Lien public</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={selectedDocument.publicUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedDocument.publicUrl)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Copier le lien"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  {selectedDocument.qrCodePath && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 mb-2">QR Code</p>
                      <img 
                        src={selectedDocument.qrCodePath} 
                        alt="QR Code" 
                        className="w-32 h-32 mx-auto border rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                  <a
                    href={selectedDocument.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir le Document
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
