'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminNavigation } from '@/components/layout/AdminNavigation';
import { AdminPageLoader } from '@/components/ui/LoadingSpinner';
import { 
  FaPlus, 
  FaSearch, 
  FaQrcode, 
  FaBarcode, 
  FaUser, 
  FaCalendar,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaFilter,
  FaSort
} from 'react-icons/fa';
import { Sticker } from '@/types';

interface StickerWithUser extends Sticker {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminStickersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [stickers, setStickers] = useState<StickerWithUser[]>([]);
  const [stickersLoading, setStickersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'assigned'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'assignedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [assignForm, setAssignForm] = useState({
    customerName: '',
    customerEmail: ''
  });
  const [assignLoading, setAssignLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);

  const fetchStickers = useCallback(async () => {
    try {
      setStickersLoading(true);
      const response = await fetch('/api/admin/stickers');
      const data = await response.json();
      
      if (data.stickers) {
        setStickers(data.stickers);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des autocollants:', error);
    } finally {
      setStickersLoading(false);
    }
  }, []);

  const generateStickers = useCallback(async () => {
    try {
      setGenerateLoading(true);
      const response = await fetch('/api/admin/stickers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count: 5 }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ ${data.message}`);
        fetchStickers(); // Rafraîchir la liste
      } else {
        console.error('Erreur API:', data);
        alert(`❌ ${data.error}${data.details ? '\n\nDétails: ' + data.details : ''}`);
      }
    } catch (error) {
      console.error('Erreur lors de la génération des autocollants:', error);
      alert(`❌ Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setGenerateLoading(false);
    }
  }, [fetchStickers]);

  const assignSticker = useCallback(async () => {
    if (!selectedSticker || !assignForm.customerName || !assignForm.customerEmail) {
      alert('❌ Veuillez remplir tous les champs');
      return;
    }

    try {
      setAssignLoading(true);
      const response = await fetch('/api/admin/stickers/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stickerId: selectedSticker.id,
          customerName: assignForm.customerName,
          customerEmail: assignForm.customerEmail
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ ${data.message}`);
        if (data.tempPassword) {
          alert(`🔑 Mot de passe temporaire: ${data.tempPassword}`);
        }
        setShowAssignModal(false);
        setSelectedSticker(null);
        setAssignForm({ customerName: '', customerEmail: '' });
        fetchStickers(); // Rafraîchir la liste
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      alert('❌ Erreur lors de l\'assignation');
    } finally {
      setAssignLoading(false);
    }
  }, [selectedSticker, assignForm, fetchStickers]);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/auth/signin');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchStickers();
    }
  }, [user]);

  const filteredStickers = useMemo(() => {
    return stickers.filter(sticker => {
      const matchesSearch = 
        sticker.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sticker.barcode.includes(searchTerm) ||
        sticker.randomProfile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sticker.randomProfile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sticker.randomProfile.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || sticker.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [stickers, searchTerm, statusFilter]);

  const sortedStickers = useMemo(() => {
    return [...filteredStickers].sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'createdAt') {
        aValue = a.createdAt?.toDate?.() || new Date(0);
        bValue = b.createdAt?.toDate?.() || new Date(0);
      } else {
        aValue = a.assignedAt?.toDate?.() || new Date(0);
        bValue = b.assignedAt?.toDate?.() || new Date(0);
      }
      
      if (sortOrder === 'asc') {
        return aValue.getTime() - bValue.getTime();
      } else {
        return bValue.getTime() - aValue.getTime();
      }
    });
  }, [filteredStickers, sortBy, sortOrder]);

  const availableCount = useMemo(() => 
    stickers.filter(s => s.status === 'available').length, 
    [stickers]
  );
  
  const assignedCount = useMemo(() => 
    stickers.filter(s => s.status === 'assigned').length, 
    [stickers]
  );

  if (loading || stickersLoading) {
    return <AdminPageLoader />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AdminNavigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Gestion des Autocollants
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez le stock d'autocollants et assignez-les aux clients
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={generateStickers}
                disabled={generateLoading}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <FaPlus className="mr-2" />
                {generateLoading ? 'Génération...' : 'Générer 5'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FaQrcode className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Autocollants</p>
                <p className="text-2xl font-bold text-gray-900">{stickers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{availableCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FaUser className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Assignés</p>
                <p className="text-2xl font-bold text-gray-900">{assignedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par QR, code-barres, nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="available">Disponibles</option>
                <option value="assigned">Assignés</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="createdAt">Date de création</option>
                <option value="assignedAt">Date d'assignation</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaSort className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stickers Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code-barres
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profil Aléatoire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStickers.map((sticker) => (
                  <tr key={sticker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaQrcode className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-mono text-gray-900">
                          {sticker.qrCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaBarcode className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-mono text-gray-900">
                          {sticker.barcode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sticker.randomProfile.firstName} {sticker.randomProfile.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sticker.randomProfile.profession} - {sticker.randomProfile.company}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sticker.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {sticker.status === 'available' ? (
                          <>
                            <FaCheckCircle className="w-3 h-3 mr-1" />
                            Disponible
                          </>
                        ) : (
                          <>
                            <FaUser className="w-3 h-3 mr-1" />
                            Assigné
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sticker.status === 'assigned' && sticker.assignedAt ? (
                        <div>
                          <div className="flex items-center">
                            <FaCalendar className="w-3 h-3 mr-1" />
                            Assigné le {sticker.assignedAt.toDate?.()?.toLocaleDateString() || 'N/A'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center">
                            <FaCalendar className="w-3 h-3 mr-1" />
                            Créé le {sticker.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSticker(sticker);
                            setShowAssignModal(true);
                          }}
                          disabled={sticker.status === 'assigned'}
                          className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Ouvrir le profil QR avec la même apparence que les profils utilisateurs
                            window.open(`/sticker/profile?qr=${sticker.qrCode}`, '_blank');
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Voir le profil"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sortedStickers.length === 0 && (
          <div className="text-center py-12">
            <FaQrcode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun autocollant trouvé</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucun autocollant ne correspond à vos critères de recherche.'
                : 'Commencez par générer des autocollants pour votre stock.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={generateStickers}
                disabled={generateLoading}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <FaPlus className="mr-2" />
                {generateLoading ? 'Génération...' : 'Générer 5 autocollants'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedSticker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Assigner l'autocollant
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                QR Code: <span className="font-mono">{selectedSticker.qrCode}</span>
              </p>
              <p className="text-sm text-gray-600">
                Code-barres: <span className="font-mono">{selectedSticker.barcode}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du client *
                </label>
                <input
                  type="text"
                  value={assignForm.customerName}
                  onChange={(e) => setAssignForm({ ...assignForm, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Prénom Nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email du client *
                </label>
                <input
                  type="email"
                  value={assignForm.customerEmail}
                  onChange={(e) => setAssignForm({ ...assignForm, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="client@example.com"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSticker(null);
                  setAssignForm({ customerName: '', customerEmail: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={assignSticker}
                disabled={assignLoading || !assignForm.customerName || !assignForm.customerEmail}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {assignLoading ? 'Assignation...' : 'Assigner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
