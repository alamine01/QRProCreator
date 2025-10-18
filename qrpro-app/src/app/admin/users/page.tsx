'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminNavigation } from '@/components/layout/AdminNavigation';
import ResponsiveCardGrid from '@/components/ui/ResponsiveCardGrid';
import ResponsiveModal from '@/components/ui/ResponsiveModal';
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
import { User } from '@/types';

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
      const response = await fetch('/api/admin/users-fix');
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
      const response = await fetch('/api/admin/users-fix', {
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
        // Mettre à jour l'état local
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, isAdmin: !currentStatus } : u
          )
        );
        
        // Mettre à jour l'utilisateur sélectionné si c'est le même
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, isAdmin: !currentStatus } : null);
        }
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error || 'Impossible de modifier le statut admin'}`);
      }
    } catch (error) {
      console.error('Error updating user admin status:', error);
      alert('Erreur lors de la mise à jour du statut admin');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      let date;
      
      // Gérer différents formats de timestamp Firebase
      if (timestamp && typeof timestamp === 'object') {
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          date = timestamp.toDate();
        } else if (timestamp.seconds) {
          date = new Date(timestamp.seconds * 1000);
        } else if (timestamp._seconds) {
          date = new Date(timestamp._seconds * 1000);
        } else {
          date = new Date(timestamp);
        }
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
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
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom, email, profession..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par rôle
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">Tous les utilisateurs</option>
                <option value="admin">Administrateurs</option>
                <option value="user">Utilisateurs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <ResponsiveCardGrid
          data={filteredUsers}
          loading={isLoading}
          emptyMessage={searchTerm || roleFilter !== 'all' 
            ? 'Aucun utilisateur trouvé avec ces filtres'
            : 'Aucun utilisateur disponible'
          }
          renderCard={(user) => (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.firstName}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs sm:text-sm">
                          {getInitials(user.firstName, user.lastName)}
                        </span>
                      </div>
                    )}
                    <div className="ml-3">
                      <div className="flex items-center">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                          {user.firstName} {user.lastName}
                        </h3>
                        {user.isAdmin && (
                          <FaCrown className="ml-1 sm:ml-2 text-yellow-500 w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 sm:space-x-3">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1 sm:p-2"
                      title="Voir les détails"
                    >
                      <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <FaCalendar className="mr-2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                    Inscrit le {formatDate(user.createdAt)}
                  </div>
                  {user.profession && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <FaUser className="mr-2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                      {user.profession}
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                      {user.location}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    user.isAdmin 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <FaUserShield className="mr-1 w-3 h-3" />
                    {user.isAdmin ? 'Administrateur' : 'Utilisateur'}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    Profil: {user.email.split('@')[0]}
                  </span>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      {/* Modal */}
      <ResponsiveModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        title={`Détails de ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        size="lg"
      >
        {selectedUser && (
          <>
            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Personnelles</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaUser className="mr-3 text-gray-400 w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </div>
                      <div className="text-sm text-gray-500">Nom complet</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="mr-3 text-gray-400 w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedUser.email}
                      </div>
                      <div className="text-sm text-gray-500">Email</div>
                    </div>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center">
                      <FaPhone className="mr-3 text-gray-400 w-4 h-4" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedUser.phone}
                        </div>
                        <div className="text-sm text-gray-500">Téléphone</div>
                      </div>
                    </div>
                  )}
                  {selectedUser.location && (
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-3 text-gray-400 w-4 h-4" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedUser.location}
                        </div>
                        <div className="text-sm text-gray-500">Localisation</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du Compte</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaCalendar className="mr-3 text-gray-400 w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(selectedUser.createdAt)}
                      </div>
                      <div className="text-sm text-gray-500">Date d'inscription</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaUserShield className="mr-3 text-gray-400 w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedUser.isAdmin ? 'Administrateur' : 'Utilisateur'}
                      </div>
                      <div className="text-sm text-gray-500">Rôle</div>
                    </div>
                  </div>
                  {selectedUser.profession && (
                    <div className="flex items-center">
                      <FaUser className="mr-3 text-gray-400 w-4 h-4" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedUser.profession}
                        </div>
                        <div className="text-sm text-gray-500">Profession</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions Administrateur</h3>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => handleToggleAdmin(selectedUser.id, selectedUser.isAdmin)}
                  disabled={isUpdating}
                  className={`flex items-center justify-center px-6 py-2 rounded-lg transition-colors ${
                    selectedUser.isAdmin
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {selectedUser.isAdmin ? (
                    <>
                      <FaUserMinus className="mr-2" />
                      {isUpdating ? 'Retrait...' : 'Retirer les droits admin'}
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2" />
                      {isUpdating ? 'Promotion...' : 'Donner les droits admin'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </ResponsiveModal>
    </div>
  );
}
