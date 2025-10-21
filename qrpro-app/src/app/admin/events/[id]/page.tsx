'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt,
  FaUsers, 
  FaQrcode,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaEye,
  FaDownload,
  FaShare,
  FaClock
} from 'react-icons/fa';
import { Event } from '@/types/events';
import EventQRCode from '@/components/events/EventQRCode';
import { formatFirebaseDate } from '@/lib/dateUtils';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [eventId, setEventId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }
    
    if (user && eventId) {
      fetchEventData();
    }
  }, [user, loading, router, eventId]);

  const fetchEventData = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`/api/admin/events/${eventId}`);
      const data = await response.json();
      
      if (data.success) {
        setEvent(data.data);
      } else {
        console.error('Erreur lors de la récupération de l\'événement:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'événement:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        router.push('/admin/events');
      } else {
        alert('Erreur lors de la suppression de l\'événement');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'événement');
    }
  };

  const formatDate = (timestamp: any) => {
    try {
      if (timestamp?.toDate) {
        return timestamp.toDate().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return 'Date invalide';
    } catch (error) {
      return 'Date invalide';
    }
  };

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

  const canUserAccess = () => {
    if (!event || !firebaseUser) return false;
    return event.ownerId === firebaseUser.uid || event.collaborators.includes(firebaseUser.uid) || user?.isAdmin;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A22] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!event || !canUserAccess()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FaTimesCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Accès refusé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous n'avez pas accès à cet événement.
          </p>
          <button
            onClick={() => router.push('/admin/events')}
            className="mt-4 inline-flex items-center px-4 py-2 bg-[#F15A22] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux événements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/events')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {event.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {event.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {event.isActive ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaTimesCircle className="text-red-500" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {event.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
              
              {event.ownerId === firebaseUser?.uid && (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm sm:text-base lg:text-lg font-medium"
                  >
                    <FaEdit className="mr-2 text-sm sm:text-base lg:text-lg" />
                    Modifier
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm sm:text-base lg:text-lg font-medium"
                  >
                    <FaTrash className="mr-2 text-sm sm:text-base lg:text-lg" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de l'événement</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date et heure</p>
                    <p className="text-lg font-semibold text-gray-900">{formatFirebaseDate(event.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Lieu</p>
                    <p className="text-lg font-semibold text-gray-900">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaUsers className="mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Collaborateurs</p>
                    <p className="text-lg font-semibold text-gray-900">{event.collaborators.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaQrcode className="mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaClock className="mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Créé le</p>
                    <p className="text-lg font-semibold text-gray-900">{formatFirebaseDate(event.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaCheckCircle className={`mr-3 ${event.isActive ? 'text-green-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {event.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Configuration */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuration du formulaire</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message de bienvenue</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {event.formConfig.welcomeMessage || 'Bienvenue à notre événement !'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Champs du formulaire</label>
                  <div className="space-y-2">
                    {event.formConfig.fields.map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{field.label}</span>
                          <span className="text-sm text-gray-500">({field.type})</span>
                          {field.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Requis</span>
                          )}
                        </div>
                        {field.placeholder && (
                          <span className="text-sm text-gray-500 italic">
                            "{field.placeholder}"
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  className="flex items-center justify-center px-4 py-3 sm:px-6 sm:py-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm sm:text-base font-medium"
                >
                  <FaEye className="mr-2 text-sm sm:text-base" />
                  <span className="hidden sm:inline">Voir les statistiques</span>
                  <span className="sm:hidden">Statistiques</span>
                </button>
                
                <button
                  onClick={() => router.push(`/event/${event.id}/checkin`)}
                  className="flex items-center justify-center px-4 py-3 sm:px-6 sm:py-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm sm:text-base font-medium"
                >
                  <FaQrcode className="mr-2 text-sm sm:text-base" />
                  <span className="hidden sm:inline">Page de check-in</span>
                  <span className="sm:hidden">Check-in</span>
                </button>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="lg:col-span-1">
            <EventQRCode 
              eventId={event.id}
              eventName={event.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
