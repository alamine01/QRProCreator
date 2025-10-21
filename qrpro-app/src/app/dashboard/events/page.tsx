'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  FaCalendarAlt, 
  FaEye, 
  FaUsers, 
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaQrcode,
  FaSearch,
  FaArrowLeft,
  FaClock
} from 'react-icons/fa';
import { Event } from '@/types/events';
import { formatFirebaseDate } from '@/lib/dateUtils';

export default function UserEventsPage() {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }
    
    if (user) {
      fetchUserEvents();
    }
  }, [user, loading, router]);

  const fetchUserEvents = async () => {
    try {
      setLoadingEvents(true);
      
      if (!firebaseUser?.uid) {
        setEvents([]);
        return;
      }
      
      // Récupérer les événements où l'utilisateur est propriétaire ou collaborateur
      const [ownedEventsResponse, collaboratorEventsResponse] = await Promise.all([
        fetch(`/api/admin/events?ownerId=${firebaseUser.uid}`),
        fetch(`/api/admin/events?collaboratorId=${firebaseUser.uid}`)
      ]);
      
      const [ownedData, collaboratorData] = await Promise.all([
        ownedEventsResponse.json(),
        collaboratorEventsResponse.json()
      ]);
      
      const allEvents = [
        ...(ownedData.success ? ownedData.data : []),
        ...(collaboratorData.success ? collaboratorData.data : [])
      ];
      
      // Supprimer les doublons
      const uniqueEvents = allEvents.filter((event, index, self) => 
        index === self.findIndex(e => e.id === event.id)
      );
      
      setEvents(uniqueEvents);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        return 'bg-blue-100 text-blue-800';
      case 'without_preregistration':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserRole = (event: Event) => {
    if (event.ownerId === firebaseUser?.uid) {
      return { label: 'Propriétaire', color: 'bg-purple-100 text-purple-800' };
    }
    return { label: 'Collaborateur', color: 'bg-blue-100 text-blue-800' };
  };

  if (loading || loadingEvents) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A22] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header simplifié */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center py-4 sm:py-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-3 sm:mr-4"
            >
              <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                Mes Événements
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Gérez vos événements QRPRO
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Barre de recherche simplifiée */}
        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A22] focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Liste des événements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredEvents.map((event) => {
            const userRole = getUserRole(event);
            
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  {/* En-tête de la carte */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 truncate">{event.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${userRole.color}`}>
                        {userRole.label}
                      </span>
                    </div>
                    <div className="ml-2 sm:ml-4">
                      {event.isActive ? (
                        <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      ) : (
                        <FaTimesCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* Informations de l'événement */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="w-4 h-4 mr-2" />
                      <span className="text-sm">{formatFirebaseDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="w-4 h-4 mr-2" />
                      <span className="text-sm">{getEventTypeLabel(event.type)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaClock className="w-4 h-4 mr-2" />
                      <span className="text-sm">Créé le {formatFirebaseDate(event.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions simplifiées */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={() => router.push(`/dashboard/events/${event.id}`)}
                      className="flex-1 inline-flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 bg-[#F15A22] text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base lg:text-lg font-medium"
                    >
                      <FaEye className="mr-2 text-sm sm:text-base lg:text-lg" />
                      <span className="hidden sm:inline">Voir détails</span>
                      <span className="sm:hidden">Détails</span>
                    </button>
                    {event.ownerId === firebaseUser?.uid && (
                      <button
                        onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                        className="flex-1 inline-flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm sm:text-base lg:text-lg font-medium"
                      >
                        <FaQrcode className="mr-2 text-sm sm:text-base lg:text-lg" />
                        Modifier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCalendarAlt className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Aucun événement trouvé' : 'Aucun événement'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Essayez avec d\'autres mots-clés' 
                : 'Vous n\'avez pas encore d\'événements assignés.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-6 py-3 bg-[#F15A22] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <FaArrowLeft className="mr-2" />
                Retour au dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

