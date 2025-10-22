'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminNavigation } from '@/components/layout/AdminNavigation';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaUsers, 
  FaQrcode,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import { AdminPageLoader } from '@/components/ui/LoadingSpinner';
import { Event } from '@/types/events';
import EventFormModal from '@/components/events/EventFormModal';
import { formatFirebaseDate } from '@/lib/dateUtils';

export default function AdminEventsPage() {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<'all' | 'with_preregistration' | 'without_preregistration'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/auth/signin');
      return;
    }
    
    if (user?.isAdmin) {
      fetchEvents();
    }
  }, [user, loading, router]);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await fetch('/api/admin/events');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data);
      } else {
        console.error('Erreur lors de la récupération des événements:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setEvents(events.filter(event => event.id !== eventId));
      } else {
        alert('Erreur lors de la suppression de l\'événement');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'événement');
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      setCreatingEvent(true);

      console.log('handleCreateEvent: Données reçues:', eventData);
      console.log('handleCreateEvent: firebaseUser:', firebaseUser);
      console.log('handleCreateEvent: firebaseUser.uid:', firebaseUser?.uid);

      // Utiliser l'ownerId sélectionné dans le formulaire
      const dataToSubmit = {
        ...eventData,
        date: new Date(eventData.date).toISOString()
      };

      console.log('handleCreateEvent: Données à envoyer:', dataToSubmit);

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });

      console.log('handleCreateEvent: Réponse reçue:', response.status);
      const data = await response.json();
      console.log('handleCreateEvent: Données de réponse:', data);

      if (data.success) {
        setShowCreateModal(false);
        fetchEvents(); // Recharger la liste
        alert('Événement créé avec succès !');
      } else {
        alert('Erreur lors de la création de l\'événement: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de l\'événement');
    } finally {
      setCreatingEvent(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatusFilter = filterStatus === 'all' || 
                               (filterStatus === 'active' && event.isActive) ||
                               (filterStatus === 'inactive' && !event.isActive);
    
    const matchesTypeFilter = filterType === 'all' || event.type === filterType;
    
    return matchesSearch && matchesStatusFilter && matchesTypeFilter;
  });

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'with_preregistration':
        return 'Avec pré-inscription';
      case 'without_preregistration':
        return 'Sans pré-inscription';
      default:
        return type;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'with_preregistration':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'without_preregistration':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const isLoading = loading || loadingEvents;

  if (isLoading) {
    return <AdminPageLoader />;
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
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 lg:py-6 space-y-3 lg:space-y-0">
            <div className="text-center lg:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Gestion des Événements
              </h1>
              <p className="mt-1 text-sm lg:text-base text-gray-500">
                Créez et gérez les événements QRPRO
              </p>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={creatingEvent}
                className="w-full lg:w-auto inline-flex items-center justify-center px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm lg:text-base font-medium"
              >
                <FaPlus className="mr-2 text-sm lg:text-base" />
                {creatingEvent ? 'Création...' : 'Créer un événement'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm lg:text-base" />
                <input
                  type="text"
                  placeholder="Rechercher un événement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 lg:pl-11 pr-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent text-sm lg:text-base"
                />
              </div>
            </div>
            <div className="flex gap-2 lg:gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent text-sm lg:text-base"
              >
                <option value="all">Tous les événements</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent text-sm lg:text-base"
              >
                <option value="all">Tous les types</option>
                <option value="with_preregistration">Avec pré-inscription</option>
                <option value="without_preregistration">Sans pré-inscription</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-3 lg:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1 lg:mb-2">
                      <h3 className="text-base lg:text-lg font-bold text-gray-900 truncate">{event.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {event.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <p className="text-sm lg:text-base text-gray-600 mb-2 lg:mb-3 line-clamp-2">
                      {event.description && event.description.trim() !== '' 
                        ? event.description 
                        : 'Aucune description disponible'
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
                  <div className="flex items-center text-xs lg:text-sm text-gray-600">
                    <FaCalendarAlt className="mr-1 lg:mr-2 text-[#F15A22] text-xs lg:text-sm flex-shrink-0" />
                    <span className="truncate">
                      {event.date 
                        ? formatFirebaseDate(event.date) 
                        : 'Date non définie'
                      }
                    </span>
                  </div>
                  <div className="flex items-center text-xs lg:text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-1 lg:mr-2 text-[#F15A22] text-xs lg:text-sm flex-shrink-0" />
                    <span className="truncate">
                      {event.location && event.location.trim() !== '' 
                        ? event.location 
                        : 'Lieu non défini'
                      }
                    </span>
                  </div>
                  <div className="flex items-center text-xs lg:text-sm text-gray-600">
                    <FaUsers className="mr-1 lg:mr-2 text-[#F15A22] text-xs lg:text-sm flex-shrink-0" />
                    <span>{event.collaborators?.length || 0} collaborateur(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <span className={`inline-flex items-center px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-xs lg:text-sm font-medium ${getEventTypeColor(event.type)}`}>
                    {getEventTypeLabel(event.type)}
                  </span>
                  <span className="text-xs lg:text-sm text-gray-500 hidden lg:inline">
                    Créé le {event.createdAt 
                      ? formatFirebaseDate(event.createdAt) 
                      : 'Date inconnue'
                    }
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => router.push(`/admin/events/${event.id}`)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <FaEye className="mr-1.5 w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Voir détails</span>
                    <span className="sm:hidden">Voir</span>
                  </button>
                  <button
                    onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <FaEdit className="mr-1.5 w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Modifier</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <FaTrash className="mr-1.5 w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Supprimer</span>
                    <span className="sm:hidden">Suppr.</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 lg:py-12">
            <FaCalendarAlt className="mx-auto h-12 w-12 lg:h-16 lg:w-16 text-gray-400" />
            <h3 className="mt-3 lg:mt-4 text-base lg:text-lg font-semibold text-gray-900">Aucun événement</h3>
            <p className="mt-2 text-sm lg:text-base text-gray-500 px-4">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Aucun événement ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre premier événement.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <div className="mt-4 lg:mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full lg:w-auto inline-flex items-center justify-center px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80 text-white rounded-lg hover:opacity-90 transition-opacity text-sm lg:text-base font-medium"
                >
                  <FaPlus className="mr-2 text-sm lg:text-base" />
                  Créer un événement
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de création d'événement */}
      <EventFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
        loading={creatingEvent}
      />
    </div>
  );
}
