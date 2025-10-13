'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminNavigation } from '@/components/layout/AdminNavigation';
import { 
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaUser,
  FaUserShield,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaEdit,
  FaCheck,
  FaTimes,
  FaEye,
  FaCrown,
  FaUserPlus,
  FaUserMinus,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { ResponsiveCardGrid } from '@/components/ui/ResponsiveCardGrid';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';

export default function UsersManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/auth/signin');
      return;
    }

    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user, loading, router]);

  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profession?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        roleFilter === 'admin' ? user.isAdmin : !user.isAdmin
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Êtes-vous sûr de vouloir ${currentStatus ? 'retirer les droits admin' : 'donner les droits admin'} à cet utilisateur ?`)) {
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: userId,
          isAdmin: !currentStatus 
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => 
          prev.map(user => user.id === userId ? updatedUser : user)
        );
        // Mettre à jour aussi l'utilisateur sélectionné dans le modal
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(updatedUser);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Erreur lors de la promotion admin');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Erreur lors de la promotion admin: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      let date;
      
      // Gérer les différents formats de timestamp Firebase
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        // Timestamp Firebase avec méthode toDate()
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        // Timestamp Firebase avec propriétés seconds/nanoseconds
        date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
      } else if (timestamp._seconds) {
        // Format alternatif Firebase
        date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        // String ou number timestamp
        date = new Date(timestamp);
      } else {
        console.warn('Format de timestamp non reconnu:', timestamp);
        return 'Date invalide';
      }
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn('Date invalide générée:', date, 'depuis:', timestamp);
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error, 'timestamp:', timestamp);
      return 'Erreur de date';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#F15A22] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AdminNavigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-2 sm:mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Gestion des Utilisateurs
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gérez les utilisateurs et leurs permissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou profession..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F15A22] focus:border-transparent appearance-none"
              >
                <option value="all">Tous les utilisateurs</option>
                <option value="admin">Administrateurs</option>
                <option value="user">Utilisateurs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A22] mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUser className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || roleFilter !== 'all' ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || roleFilter !== 'all' 
                ? 'Essayez de modifier vos filtres'
                : 'Les nouveaux utilisateurs apparaîtront ici'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.firstName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {getInitials(user.firstName, user.lastName)}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h3 className="font-bold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          {user.isAdmin && (
                            <FaCrown className="ml-2 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {user.profession && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaUser className="mr-2 text-gray-400" />
                        {user.profession}
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaPhone className="mr-2 text-gray-400" />
                        {user.phone}
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {user.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendar className="mr-2 text-gray-400" />
                      Inscrit le {formatDate(user.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isAdmin 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.isAdmin ? (
                        <>
                          <FaUserShield className="mr-1" />
                          Administrateur
                        </>
                      ) : (
                        <>
                          <FaUser className="mr-1" />
                          Utilisateur
                        </>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      Profil: {user.profileSlug}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Détails de l'utilisateur
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-6">
                {selectedUser.profilePicture ? (
                  <img
                    src={selectedUser.profilePicture}
                    alt={selectedUser.firstName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {getInitials(selectedUser.firstName, selectedUser.lastName)}
                    </span>
                  </div>
                )}
                <div className="ml-4">
                  <div className="flex items-center">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    {selectedUser.isAdmin && (
                      <FaCrown className="ml-2 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Informations Personnelles</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Profession</label>
                      <p className="text-gray-900">{selectedUser.profession || 'Non spécifiée'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Téléphone</label>
                      <p className="text-gray-900">{selectedUser.phone || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Localisation</label>
                      <p className="text-gray-900">{selectedUser.location || 'Non spécifiée'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Adresse</label>
                      <p className="text-gray-900">{selectedUser.address || 'Non spécifiée'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Informations du Compte</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rôle</label>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.isAdmin 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedUser.isAdmin ? (
                            <>
                              <FaUserShield className="mr-1" />
                              Administrateur
                            </>
                          ) : (
                            <>
                              <FaUser className="mr-1" />
                              Utilisateur
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Slug du Profil</label>
                      <p className="text-gray-900 font-mono text-sm">{selectedUser.profileSlug}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date d'inscription</label>
                      <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dernière mise à jour</label>
                      <p className="text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography */}
              {selectedUser.biography && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Biographie</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedUser.biography}
                  </p>
                </div>
              )}

              {/* Social Media */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Réseaux Sociaux</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['linkedin', 'whatsapp', 'instagram', 'twitter', 'snapchat', 'facebook', 'youtube', 'tiktok'].map((platform) => {
                    const value = selectedUser[platform as keyof User] as string;
                    return value ? (
                      <div key={platform} className="flex items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 capitalize mr-2">
                          {platform}:
                        </span>
                        <a 
                          href={value} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#F15A22] hover:underline text-sm truncate"
                        >
                          {value}
                        </a>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => handleToggleAdmin(selectedUser.id, selectedUser.isAdmin)}
                disabled={isUpdating}
                className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                  selectedUser.isAdmin
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {selectedUser.isAdmin ? (
                  <>
                    <FaUserMinus className="mr-2" />
                    Retirer Admin
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Promouvoir Admin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
